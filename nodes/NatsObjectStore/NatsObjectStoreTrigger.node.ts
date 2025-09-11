import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';
import { NatsConnection, jetstream, Objm } from '../../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { NodeLogger } from '../../utils/NodeLogger';

export class NatsObjectStoreTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Object Store Trigger',
		name: 'natsObjectStoreTrigger',
		icon: 'file:../../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Watch for object changes in NATS Object Store buckets and trigger workflows',
		subtitle: '={{$parameter["bucket"]}}',
		defaults: {
			name: 'NATS Object Store Trigger',
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
		let normallyClosed = false;

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
				},
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
					let result: IDataObject = { ...update };
					this.emit([this.helpers.returnJsonArray([result])]);
				}

				if (!normallyClosed) {
					nodeLogger.warn('KV watcher loop stopped');
				}
			})().catch((e) => {
				nodeLogger.error(e);
			});
		};

		await startWatcher();

		async function closeFunction() {
			try {
				normallyClosed = true;

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
			// Try to fetch real data from Object Store first
			let connection: NatsConnection | undefined;

			try {
				connection = await createNatsConnection(credentials, nodeLogger);
				const js = jetstream(connection);
				const objManager = new Objm(js);
				const objectStore = await objManager.open(bucket);

				// Try to list some objects (limit to 3 for sample)
				const objects = await objectStore.list();
				let count = 0;
				let realDataFound = false;

				for await (const obj of objects) {
					if (count >= 3) break;

					const result: IDataObject = {
						name: obj.name,
						size: obj.size,
						chunks: obj.chunks,
						digest: obj.digest,
						mtime: obj.mtime || new Date().toISOString(),
						bucket: bucket,
						deleted: obj.deleted || false,
						metadata: obj.metadata || {},
						revision: obj.revision,
						_sampleDataNote: 'This is real data from your Object Store bucket',
					};

					this.emit([this.helpers.returnJsonArray([result])]);
					realDataFound = true;
					count++;
				}

				if (realDataFound) {
					if (connection) {
						await closeNatsConnection(connection, nodeLogger);
					}
					return;
				}

				// No objects found
				nodeLogger.info(
					`No objects found in Object Store bucket '${bucket}', providing sample data`,
				);
			} catch (error: any) {
				nodeLogger.warn(
					`Could not fetch real data: ${error.message}. Providing sample data instead.`,
				);
			} finally {
				if (connection) {
					await closeNatsConnection(connection, nodeLogger);
				}
			}

			// Fallback: Provide comprehensive sample data for Object Store operations
			const fileTypes = ['pdf', 'jpg', 'txt', 'json', 'csv'];
			const randomType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
			const randomSize = Math.floor(Math.random() * 5000000) + 100000; // 100KB to 5MB

			const sampleData = {
				name: `documents/2024/${Math.random().toString(36).substr(2, 8)}-report.${randomType}`,
				size: randomSize,
				chunks: Math.ceil(randomSize / 128000), // Assuming ~128KB chunks
				digest: `SHA-256=${Math.random().toString(36).substr(2, 40)}ABCD=`,
				mtime: new Date().toISOString(),
				bucket: bucket,
				deleted: false,
				// Additional metadata that might be useful
				metadata: {
					uploadedBy: 'user-12345',
					contentType: `application/${randomType === 'jpg' ? 'jpeg' : randomType}`,
					category: 'reports',
					tags: ['monthly', 'sales', '2024'],
					version: '1.0',
				},
				revision: Math.floor(Math.random() * 5) + 1,
				created: new Date(Date.now() - Math.random() * 7200000).toISOString(), // Random time in last 2 hours
				_sampleDataNote: 'This is sample data. No objects were found in your Object Store bucket.',
			};

			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};

		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}
