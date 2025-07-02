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
			// Provide comprehensive sample data based on KV watch operations
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
			};

			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};

		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}