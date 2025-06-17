import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, jetstream, Kvm } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';

export class NatsKvTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS KV Trigger',
		name: 'natsKvTrigger',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers when changes occur in a NATS KV bucket',
		subtitle: '={{$parameter["bucket"]}} - {{$parameter["operation"]}}',
		defaults: {
			name: 'NATS KV Trigger',
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
				description: 'The name of the KV bucket to watch',
			},
			{
				displayName: 'Watch Type',
				name: 'watchType',
				type: 'options',
				options: [
					{
						name: 'All Changes',
						value: 'all',
						description: 'Watch all changes in the bucket',
					},
					{
						name: 'Specific Key',
						value: 'key',
						description: 'Watch changes to a specific key',
					},
					{
						name: 'Key Pattern',
						value: 'pattern',
						description: 'Watch changes to keys matching a pattern',
					},
				],
				default: 'all',
			},
			{
				displayName: 'Key',
				name: 'key',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				required: true,
				displayOptions: {
					show: {
						watchType: ['key'],
					},
				},
				placeholder: 'my-key',
				description: 'The specific key to watch',
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
				placeholder: 'prefix.*',
				description: 'The pattern to match keys (supports * and > wildcards)',
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
						description: 'Whether to trigger on delete operations',
					},
					{
						displayName: 'Include History',
						name: 'includeHistory',
						type: 'boolean',
						default: false,
						description: 'Whether to include all historical values on startup',
					},
					{
						displayName: 'Updates Only',
						name: 'updatesOnly',
						type: 'boolean',
						default: false,
						description: 'Whether to only receive updates (no initial values)',
					},
					{
						displayName: 'Metadata Only',
						name: 'metadataOnly',
						type: 'boolean',
						default: false,
						description: 'Whether to only receive metadata without values',
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
		
		let nc: NatsConnection;
		let watcher: any;
		
		const emitData = (entry: any) => {
			if (!options.includeDeletes && entry.operation === 'DEL') {
				return;
			}
			
			let value: any = null;
			if (!options.metadataOnly && entry.value && entry.value.length > 0) {
				const stringValue = new TextDecoder().decode(entry.value);
				try {
					value = JSON.parse(stringValue);
				} catch {
					value = stringValue;
				}
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
				nc = await createNatsConnection(credentials, this);
				const js = jetstream(nc);
				const kvManager = new Kvm(js);
				const kv = await kvManager.open(bucket);
				
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
				
				watcher = await kv.watch(watchOpts);
				
				// Process entries
				(async () => {
					for await (const entry of watcher) {
						emitData(entry);
					}
				})().catch((error) => {
					this.logger.error('KV watcher error:', error);
				});
				
			} catch (error: any) {
				throw new NodeOperationError(this.getNode(), `Failed to start KV watcher: ${error.message}`);
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
					await closeNatsConnection(nc);
				}
			} catch (error) {
				console.error('Error closing KV trigger:', error);
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