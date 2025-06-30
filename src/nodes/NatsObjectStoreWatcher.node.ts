import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeConnectionType, IDataObject,
} from 'n8n-workflow';
import { NatsConnection, jetstream, Objm } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsObjectStoreWatcher implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Object Store Watcher',
		name: 'natsObjectStoreWatcher',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Watch for object changes in NATS Object Store buckets and trigger workflows',
		subtitle: '{{$parameter["bucket"]}}',
		defaults: {
			name: 'NATS Object Store Watcher',
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
				placeholder: 'my-files',
				description: 'Name of the bucket to monitor for changes (no spaces or dots allowed)',
				hint: 'Use only letters, numbers, hyphens, and underscores',
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
						description: 'Whether to trigger when objects are deleted from the bucket',
					},
					{
						displayName: 'Include History',
						name: 'includeHistory',
						type: 'boolean',
						default: false,
						description: 'Whether to process all existing objects when the trigger starts',
						hint: 'Useful for initial data processing or migration',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const bucket = this.getNodeParameter('bucket') as string;
		const options = this.getNodeParameter('options', {}) as any;
		
		let nc: NatsConnection;
		let watcher: any;
		
		// Create NodeLogger once for the entire trigger lifecycle
		const nodeLogger = new NodeLogger(this.logger, this.getNode());
		
		const startWatcher = async () => {
			// Create connection with monitoring for long-running trigger
			nc = await createNatsConnection(credentials, nodeLogger, {
				monitor: true,
				onError: (error) => {
					nodeLogger.error('Object store watcher connection lost:', { error });
				},
				onReconnect: (server) => {
					nodeLogger.info(`Object store watcher reconnected to ${server}`);
				},
				onDisconnect: (server) => {
					nodeLogger.warn(`Object store watcher disconnected from ${server}`);
				},
				onAsyncError: (error) => {
					nodeLogger.error('Object store watcher async error (e.g. permission):', { error });
				}
			});
			const js = jetstream(nc);
			const objManager = new Objm(js);
			const objectStore = await objManager.open(bucket);

			// Configure watch options
			const watchOptions: any = {
				ignoreDeletes: !options.includeDeletes,
			};

			// Handle history option
			if (options.includeHistory) {
				watchOptions.includeHistory = true;
			}

			// Start watching the object store
			watcher = await objectStore.watch(watchOptions);

			// Process object change events
			(async () => {
				for await (const update of watcher) {
					let result: IDataObject = {...update}
					this.emit([this.helpers.returnJsonArray([result])]);
				}
			})();
		};
		
		await startWatcher();
		
		async function closeFunction() {
			try {
				// Stop the watcher if it exists
				if (watcher && typeof watcher.stop === 'function') {
					try {
						await watcher.stop();
					} catch {
						// Watcher might already be stopped
					}
				}
				if (nc) {
					await closeNatsConnection(nc, nodeLogger);
				}
			} catch (error: any) {
				// Log error but don't throw - connection may already be closed
				// This is expected behavior during shutdown
				if (error.message && !error.message.includes('closed')) {
					// Only log unexpected errors
					nodeLogger.error('Error closing object store watcher:', { error });
				}
			}
		}
		
		// Manual trigger function for testing
		const manualTriggerFunction = async () => {
			// Provide sample data matching ObjectWatchInfo format
			const sampleData = {
				name: 'reports/2024/sales-report.pdf',
				size: 2457600, // ~2.4MB
				chunks: 20,
				digest: 'SHA-256=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=',
				mtime: new Date().toISOString(),
				deleted: false,
			};
			
			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};
		
		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}