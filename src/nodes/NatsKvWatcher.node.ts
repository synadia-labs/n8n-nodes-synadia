import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeOperationError,
	NodeConnectionType,
	ApplicationError,
} from 'n8n-workflow';
import { NatsConnection, jetstream, Kvm } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { validateBucketName, validateKeyName } from '../utils/ValidationHelpers';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsKvWatcher implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS KV Watcher',
		name: 'natsKvWatcher',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Watch for changes in NATS KV buckets and trigger workflows',
		subtitle: '{{$parameter["bucket"]}} - {{$parameter["operation"]}}',
		defaults: {
			name: 'NATS KV Watcher',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'natsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Bucket Name',
				name: 'bucket',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'my-bucket',
				description: 'The name of the KV bucket to watch. Must contain only letters, numbers, underscores, and hyphens (no spaces or dots).',
			},
			{
				displayName: 'Watch Type',
				name: 'watchType',
				type: 'options',
				options: [
					{
						name: 'All Changes',
						value: 'all',
						description: 'Watch all changes in the bucket - triggers for any key update, addition, or deletion',
					},
					{
						name: 'Specific Key',
						value: 'key',
						description: 'Watch changes to a single specific key only',
					},
					{
						name: 'Key Pattern',
						value: 'pattern',
						description: 'Watch changes to keys matching a pattern with wildcards',
					},
				],
				default: 'all',
				description: 'Choose what keys to watch for changes',
			},
			{
				displayName: 'Key',
				name: 'key',
				// eslint-disable-next-line n8n-nodes-base/cred-class-field-type-options-password-missing
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						watchType: ['key'],
					},
				},
				placeholder: 'user.preferences',
				description: 'The specific key to watch for changes. Keys can use dots for hierarchical organization (e.g., "user.settings.theme").',
			},
			{
				displayName: 'Pattern',
				name: 'pattern',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						watchType: ['pattern'],
					},
				},
				placeholder: 'user.*',
				description: 'Pattern to match keys. Use "*" for single-level wildcard (e.g., "user.*" matches "user.alice" but not "user.alice.settings"). Use ">" for multi-level wildcard (e.g., "user.>" matches all keys starting with "user.").',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Deletes',
						name: 'includeDeletes',
						type: 'boolean',
						default: true,
						description: 'Whether to trigger when keys are deleted. When enabled, you\'ll receive events with operation="DEL" when keys are removed.',
					},
					{
						displayName: 'Include History',
						name: 'includeHistory',
						type: 'boolean',
						default: false,
						description: 'Whether to replay all historical values when the trigger starts. When enabled, you\'ll first receive all existing key values before getting live updates.',
					},
					{
						displayName: 'Updates Only',
						name: 'updatesOnly',
						type: 'boolean',
						default: false,
						description: 'Whether to skip initial values and only receive new updates. When enabled, the trigger won\'t send current key values on startup.',
					},
					{
						displayName: 'Metadata Only',
						name: 'metadataOnly',
						type: 'boolean',
						default: false,
						description: 'Whether to receive only metadata without the actual values. Useful for monitoring changes without transferring large data payloads.',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const bucket = this.getNodeParameter('bucket') as string;
		const watchType = this.getNodeParameter('watchType') as string;
		const options = this.getNodeParameter('options', {}) as any;
		
		// Validate bucket name
		try {
			validateBucketName(bucket);
		} catch (error) {
			if (error instanceof ApplicationError) {
				throw new NodeOperationError(this.getNode(), error.message);
			}
			throw error;
		}
		
		// Validate key or pattern if specified
		if (watchType === 'key') {
			const key = this.getNodeParameter('key') as string;
			try {
				validateKeyName(key);
			} catch (error) {
				if (error instanceof ApplicationError) {
					throw new NodeOperationError(this.getNode(), error.message);
				}
				throw error;
			}
		} else if (watchType === 'pattern') {
			const pattern = this.getNodeParameter('pattern') as string;
			if (!pattern || pattern.trim() === '') {
				throw new NodeOperationError(this.getNode(), 'Pattern cannot be empty');
			}
			// Validate pattern has valid characters (same as keys but with wildcards)
			const validPatternRegex = /^[a-zA-Z0-9._/*>-]+$/;
			if (!validPatternRegex.test(pattern)) {
				throw new NodeOperationError(
					this.getNode(), 
					'Pattern contains invalid characters. Valid characters are: a-z, A-Z, 0-9, ., _, /, -, *, >'
				);
			}
		}
		
		let nc: NatsConnection;
		let watcher: any;
		
		// Create NodeLogger once for the entire trigger lifecycle
		const nodeLogger = new NodeLogger(this.logger, this.getNode());
		
		const emitData = (entry: any) => {
			if (!options.includeDeletes && entry.operation === 'DEL') {
				return;
			}
			
			// Return raw value data without automatic parsing
			let value: any = null;
			if (!options.metadataOnly && entry.value && entry.value.length > 0) {
				value = entry.value;
			}
			
			this.emit([this.helpers.returnJsonArray([{
				bucket,
				key: entry.key,
				value,
				revision: entry.revision,
				created: entry.created ? new Date(entry.created.getTime()).toISOString() : undefined,
				operation: entry.operation,
				delta: entry.delta,
				timestamp: new Date().toISOString(),
			}])]);
		};
		
		const startWatcher = async () => {
			try {
				// Create connection with monitoring for long-running trigger
				nc = await createNatsConnection(credentials, nodeLogger, {
					monitor: true,
					onError: (error) => {
						nodeLogger.error('KV watcher connection lost:', { error });
					},
					onReconnect: (server) => {
						nodeLogger.info(`KV watcher reconnected to ${server}`);
					},
					onDisconnect: (server) => {
						nodeLogger.warn(`KV watcher disconnected from ${server}`);
					},
					onAsyncError: (error) => {
						nodeLogger.error('KV watcher async error (e.g. permission):', { error });
					}
				});
				const js = jetstream(nc);
				const kvManager = new Kvm(js);
				
				// Open the KV bucket
				let kv;
				try {
					kv = await kvManager.open(bucket);
				} catch (error: any) {
					if (error.message?.includes('not found')) {
						throw new NodeOperationError(
							this.getNode(), 
							`KV bucket "${bucket}" not found. Please create it first using the NATS KV node.`
						);
					}
					throw new NodeOperationError(
						this.getNode(), 
						`Failed to open KV bucket "${bucket}": ${error.message}`
					);
				}
				
				// Configure watch options
				const watchOpts: any = {
					include: options.includeHistory ? 'all' : (options.updatesOnly ? 'updates' : 'last'),
					ignoreDeletes: !options.includeDeletes,
					headers_only: options.metadataOnly || false,
				};
				
				// Start the appropriate watcher
				switch (watchType) {
					case 'key': {
						const key = this.getNodeParameter('key') as string;
						watchOpts.key = key;
						break;
					}
						
					case 'pattern': {
						const pattern = this.getNodeParameter('pattern') as string;
						watchOpts.key = pattern;
						break;
					}
						
					case 'all':
					default:
						// No key filter for watching all
						break;
				}
				
				// Start watching
				try {
					watcher = await kv.watch(watchOpts);
				} catch (error: any) {
					throw new NodeOperationError(
						this.getNode(), 
						`Failed to start watcher: ${error.message}`
					);
				}
				
				// Process entries
				(async () => {
					try {
						for await (const entry of watcher) {
							emitData(entry);
						}
					} catch (error: any) {
						// Connection closed or other error
						if (!error.message?.includes('closed')) {
							nodeLogger.error('KV watcher error:', { error });
						}
					}
				})();
				
			} catch (error: any) {
				// Re-throw NodeOperationError as is
				if (error instanceof NodeOperationError) {
					throw error;
				}
				// Wrap other errors with more context
				throw new NodeOperationError(
					this.getNode(), 
					`Failed to initialize KV trigger: ${error.message}`
				);
			}
		};
		
		await startWatcher();
		
		async function closeFunction() {
			try {
				if (watcher) {
					// KV watcher is an async iterator, no stop method needed
					// It will be cleaned up when the connection closes
				}
				if (nc) {
					await closeNatsConnection(nc, nodeLogger);
				}
			} catch (error: any) {
				// Log error but don't throw - connection may already be closed
				// This is expected behavior during shutdown
				if (error.message && !error.message.includes('closed')) {
					// Only log unexpected errors
					nodeLogger.error('Error closing KV watcher:', { error });
				}
			}
		}
		
		// Manual trigger function for testing
		const manualTriggerFunction = async () => {
			// Provide sample data based on watch type
			const sampleData = {
				bucket,
				key: watchType === 'key' 
					? this.getNodeParameter('key') as string
					: watchType === 'pattern'
					? 'user.preferences.theme'
					: 'config.app.version',
				value: {
					theme: 'dark',
					language: 'en',
					notifications: true,
					lastUpdated: new Date().toISOString()
				},
				revision: 5,
				created: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
				operation: 'PUT',
				delta: 2,
				timestamp: new Date().toISOString(),
			};
			
			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};
		
		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}