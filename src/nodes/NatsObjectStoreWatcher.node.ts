import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, jetstream, jetstreamManager } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { validateBucketName } from '../utils/ValidationHelpers';

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
					{
						displayName: 'Updates Only',
						name: 'updatesOnly',
						type: 'boolean',
						default: false,
						description: 'Whether to only process new changes, skip existing objects',
						hint: 'Start monitoring from now, ignore current bucket contents',
					},
					{
						displayName: 'Name Filter',
						name: 'nameFilter',
						type: 'string',
						default: '',
						placeholder: 'images/*.jpg',
						description: 'Only process objects matching this pattern (* = any characters)',
						hint: 'Examples: *.pdf, reports/2024/*, backup-*.zip',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const bucket = this.getNodeParameter('bucket') as string;
		const options = this.getNodeParameter('options', {}) as any;
		
		// Validate bucket name
		validateBucketName(bucket);
		
		let nc: NatsConnection;
		let subscription: any;
		
		const startWatcher = async () => {
			try {
				nc = await createNatsConnection(credentials, this.logger, this);
				const js = jetstream(nc);
				
				// Object Store uses the underlying stream events
				const streamName = `OBJ_${bucket}`;
				
				// Create ephemeral consumer configuration
				const consumerConfig: any = {
					filter_subject: `$O.${bucket}.M.>`,
					ack_policy: 'explicit',
				};
				
				// Configure delivery policy
				if (options.updatesOnly) {
					consumerConfig.deliver_policy = 'new';
				} else if (options.includeHistory) {
					consumerConfig.deliver_policy = 'all';
				} else {
					consumerConfig.deliver_policy = 'last_per_subject';
				}
				
				// Get JetStream manager and create ephemeral consumer
				const jsm = await jetstreamManager(nc);
				const consumerInfo = await jsm.consumers.add(streamName, consumerConfig);
				
				// Get consumer reference
				const consumer = await js.consumers.get(consumerInfo.stream_name, consumerInfo.name);
				
				// Store consumer for cleanup
				subscription = consumer as any;
				
				// Process messages
				(async () => {
					const messageIterator = await consumer.consume();
					for await (const msg of messageIterator) {
						try {
							// Parse the subject to get object name
							const parts = msg.subject.split('.');
							if (parts.length < 4) continue;
							
							const objectName = parts.slice(3).join('.');
							
							// Apply name filter if specified
							if (options.nameFilter) {
								const regex = new RegExp('^' + options.nameFilter.replace(/\*/g, '.*') + '$');
								if (!regex.test(objectName)) {
									msg.ack();
									continue;
								}
							}
							
							// Parse headers for metadata
							const headers = msg.headers || {};
							const operation = headers.get('X-Nats-Operation') || 'PUT';
							
							// Skip deletes if not wanted
							if (!options.includeDeletes && operation === 'DELETE') {
								msg.ack();
								continue;
							}
							
							// Get object info from headers
							const info = {
								name: objectName,
								size: parseInt(headers.get('X-Nats-Object-Size') || '0'),
								chunks: parseInt(headers.get('X-Nats-Object-Chunks') || '0'),
								digest: headers.get('X-Nats-Object-Digest') || '',
								mtime: headers.get('X-Nats-Object-Mtime') || new Date().toISOString(),
								deleted: operation === 'DELETE',
							};
							
							this.emit([this.helpers.returnJsonArray([{
								bucket,
								operation: operation.toLowerCase(),
								object: info,
								timestamp: new Date().toISOString(),
							}])]);
							
							msg.ack();
						} catch (error) {
							this.logger.error('Error processing object store event:', { error });
							msg.ack();
						}
					}
				})().catch((error) => {
					this.logger.error('Object store watcher error:', { error });
				});
				
			} catch (error: any) {
				throw new NodeOperationError(this.getNode(), `Failed to start object store watcher: ${error.message}`);
			}
		};
		
		await startWatcher();
		
		// Capture logger reference for use in closeFunction
		const logger = this.logger;
		
		async function closeFunction() {
			try {
				// Delete ephemeral consumer
				if (subscription && subscription.delete) {
					try {
						await subscription.delete();
					} catch {
						// Consumer might already be deleted
					}
				}
				if (nc) {
					await closeNatsConnection(nc, logger);
				}
			} catch (error: any) {
				// Log error but don't throw - connection may already be closed
				// This is expected behavior during shutdown
				if (error.message && !error.message.includes('closed')) {
					// Only log unexpected errors
					logger.error('Error closing object store watcher:', error);
				}
			}
		}
		
		// Manual trigger function for testing
		const manualTriggerFunction = async () => {
			// Provide sample data for object store changes
			const sampleData = {
				bucket,
				operation: 'put',
				object: {
					name: 'reports/2024/sales-report.pdf',
					size: 2457600, // ~2.4MB
					chunks: 20,
					digest: 'SHA-256=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=',
					mtime: new Date().toISOString(),
					deleted: false,
				},
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