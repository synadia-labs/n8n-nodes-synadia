import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeOperationError,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';
import { NatsConnection, jetstream, Kvm } from '../../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { NodeLogger } from '../../utils/NodeLogger';
import { KvWatchOptions } from '@nats-io/kv';
import { TextEncoder } from 'node:util';

export class NatsKvTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS KV Trigger',
		name: 'natsKvTrigger',
		icon: 'file:../../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Watch for changes in NATS KV buckets and trigger workflows',
		subtitle: '={{$parameter["bucket"] + " - " + $parameter["key"]}}',
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
				description:
					'The name of the KV bucket to watch. Must contain only letters, numbers, underscores, and hyphens (no spaces or dots).',
			},
			{
				displayName: 'Key Pattern',
				name: 'key',
				type: 'string',
				default: '>',
				required: true,
				placeholder: 'my_key.>',
				description:
					'Key pattern to watch. Use ">" to watch all keys, or patterns like "config.*" to watch specific keys.',
				hint: 'Examples: ">" (all keys), "config.*" (keys starting with config.), "user.*.settings" (specific patterns)',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Includes',
						name: 'includes',
						type: 'options',
						default: '',
						options: [
							{
								name: 'Last Value',
								value: '',
							},
							{
								name: 'History',
								value: 'history',
							},
							{
								name: 'Updates',
								value: 'updates',
							},
						],
						description: 'Specify what to include in the watcher, by default all last values',
					},
					{
						displayName: 'Ignore Deletes',
						name: 'ignoreDeletes',
						type: 'boolean',
						default: false,
						description: 'Whether to skip deletes',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const bucket = this.getNodeParameter('bucket') as string;
		const key = this.getNodeParameter('key') as string;
		const options = this.getNodeParameter('options', {}) as any;

		let nc: NatsConnection;
		let watcher: any;
		let normallyClosed = false;

		// Create NodeLogger once for the entire trigger lifecycle
		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		const startWatcher = async () => {
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
				},
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
						`KV bucket "${bucket}" not found. Please create it first using the NATS KV node.`,
					);
				}
				throw new NodeOperationError(
					this.getNode(),
					`Failed to open KV bucket "${bucket}": ${error.message}`,
				);
			}

			// Configure watch options
			const watchOpts: KvWatchOptions = {};
			if (key) watchOpts.key = key;
			if (options.includes) watchOpts.include = options.includes;
			if (options.ignoreDeletes) watchOpts.ignoreDeletes = options.ignoreDeletes;

			// Start watching
			watcher = await kv.watch(watchOpts);

			// Process entries
			(async () => {
				for await (const entry of watcher) {
					let result: IDataObject = { ...entry };
					this.emit([this.helpers.returnJsonArray([result])]);
				}

				if (!normallyClosed) {
					nodeLogger.warn("KV watcher loop stopped");
				}
			})().catch(e => {
				nodeLogger.error(e);
			});
		};

		await startWatcher();

		async function closeFunction() {
			try {
				normallyClosed = true;

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
			// Try to fetch real data from KV first
			let connection: NatsConnection | undefined;
			
			try {
				connection = await createNatsConnection(credentials, nodeLogger);
				const js = jetstream(connection);
				const kvManager = new Kvm(js);
				
				// Open the KV bucket
				const kv = await kvManager.open(bucket);
				
				// Try to fetch some entries based on the key pattern
				let realDataFound = false;
				
				if (key === '>') {
					// List all keys (limit to 3 for sample)
					const keys = await kv.keys();
					let count = 0;
					
					for await (const k of keys) {
						if (count >= 3) break;
						
						const entry = await kv.get(k);
						if (entry && entry.value) {
							const result: IDataObject = {
								bucket,
								key: k,
								value: entry.value,
								revision: entry.revision,
								created: entry.created.toISOString(),
								operation: 'GET',
								delta: entry.delta || 0,
								timestamp: new Date().toISOString(),
								size: entry.value.length,
								_sampleDataNote: 'This is real data from your KV bucket'
							};
							
							this.emit([this.helpers.returnJsonArray([result])]);
							realDataFound = true;
							count++;
						}
					}
				} else {
					// Try to get specific key(s) based on pattern
					const entry = await kv.get(key);
					if (entry && entry.value) {
						const result: IDataObject = {
							bucket,
							key: key,
							value: entry.value,
							revision: entry.revision,
							created: entry.created.toISOString(),
							operation: 'GET',
							delta: entry.delta || 0,
							timestamp: new Date().toISOString(),
							size: entry.value.length,
							_sampleDataNote: 'This is real data from your KV bucket'
						};
						
						this.emit([this.helpers.returnJsonArray([result])]);
						realDataFound = true;
					}
				}
				
				if (realDataFound) {
					if (connection) {
						await closeNatsConnection(connection, nodeLogger);
					}
					return;
				}
				
				// No data found
				nodeLogger.info(`No entries found in KV bucket '${bucket}' with key pattern '${key}', providing sample data`);
				
			} catch (error: any) {
				nodeLogger.warn(`Could not fetch real data: ${error.message}. Providing sample data instead.`);
			} finally {
				if (connection) {
					await closeNatsConnection(connection, nodeLogger);
				}
			}
			
			// Fallback: Provide comprehensive sample data based on KV watch operations
			const sampleUserPreferences = {
				theme: 'dark',
				language: 'en',
				timezone: 'America/New_York',
				notifications: {
					email: true,
					push: false,
					sms: false
				},
				dashboard: {
					layout: 'grid',
					widgets: ['weather', 'calendar', 'tasks'],
					refreshRate: 30
				}
			};

			const sampleData = {
				bucket,
				key: 'user.12345.preferences',
				value: new TextEncoder().encode(JSON.stringify(sampleUserPreferences)),
				revision: Math.floor(Math.random() * 10) + 1,
				created: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
				operation: 'PUT',
				delta: Math.floor(Math.random() * 5) + 1,
				timestamp: new Date().toISOString(),
				// Additional KV metadata that might be useful
				size: JSON.stringify(sampleUserPreferences).length,
				history: Math.floor(Math.random() * 3) + 1,
				_sampleDataNote: 'This is sample data. No entries were found in your KV bucket.'
			};

			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};

		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}