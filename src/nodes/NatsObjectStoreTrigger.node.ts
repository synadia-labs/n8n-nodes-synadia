import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, consumerOpts } from '../bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';

export class NatsObjectStoreTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Object Store Trigger',
		name: 'natsObjectStoreTrigger',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers when changes occur in a NATS Object Store bucket',
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
				placeholder: 'my-bucket',
				description: 'The name of the object store bucket to watch',
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
						description: 'Whether to include all historical objects on startup',
					},
					{
						displayName: 'Updates Only',
						name: 'updatesOnly',
						type: 'boolean',
						default: false,
						description: 'Whether to only receive updates (no initial values)',
					},
					{
						displayName: 'Name Filter',
						name: 'nameFilter',
						type: 'string',
						default: '',
						placeholder: '*.jpg',
						description: 'Filter objects by name pattern (supports * wildcard)',
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
		let subscription: any;
		
		const startWatcher = async () => {
			try {
				nc = await createNatsConnection(credentials, this);
				const js = nc.jetstream();
				
				// Object Store uses the underlying stream events
				const streamName = `OBJ_${bucket}`;
				
				// Check if the stream exists
				try {
					const jsm = await js.jetstreamManager();
					await jsm.streams.info(streamName);
				} catch (error: any) {
					if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
						throw new NodeOperationError(this.getNode(), `Object Store bucket '${bucket}' does not exist. Please create it first using the NATS Object Store node's 'Create Bucket' operation.`);
					}
					throw error;
				}
				
				// Create consumer options
				const opts = consumerOpts();
				
				if (options.updatesOnly) {
					opts.deliverNew();
				} else if (options.includeHistory) {
					opts.deliverAll();
				} else {
					opts.deliverLastPerSubject();
				}
				
				// Subscribe to the object store stream
				const subject = `$O.${bucket}.M.>`;
				subscription = await js.subscribe(subject, opts);
				
				// Process messages
				(async () => {
					for await (const msg of subscription) {
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
		
		async function closeFunction() {
			try {
				if (subscription) {
					await subscription.unsubscribe();
				}
				if (nc) {
					await closeNatsConnection(nc);
				}
			} catch (error) {
				console.error('Error closing object store trigger:', error);
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