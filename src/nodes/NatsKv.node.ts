import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	ApplicationError,
} from 'n8n-workflow';
import { jetstream, jetstreamManager, Kvm } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { validateBucketName, validateKeyName, validateNumberRange } from '../utils/ValidationHelpers';

export class NatsKv implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS KV Store',
		name: 'natsKv',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with NATS JetStream Key-Value Store',
		subtitle: '{{$parameter["operation"]}} - {{$parameter["bucket"]}}',
		defaults: {
			name: 'NATS KV Store',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'natsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Bucket',
						value: 'createBucket',
						description: 'Create a new KV bucket',
						action: 'Create a new KV bucket',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a key from a KV bucket',
						action: 'Delete a key from a KV bucket',
					},
					{
						name: 'Delete Bucket',
						value: 'deleteBucket',
						description: 'Delete a KV bucket',
						action: 'Delete a KV bucket',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a value from a KV bucket',
						action: 'Get a value from a KV bucket',
					},
					{
						name: 'Get History',
						value: 'history',
						description: 'Get history for a key',
						action: 'Get history for a key',
					},
					{
						name: 'Get Status',
						value: 'status',
						description: 'Get status of a KV bucket',
						action: 'Get status of a KV bucket',
					},
					{
						name: 'List Keys',
						value: 'list',
						description: 'List all keys in a KV bucket',
						action: 'List all keys in a KV bucket',
					},
					{
						name: 'Purge',
						value: 'purge',
						description: 'Purge a key from a KV bucket (remove all revisions)',
						action: 'Purge a key from a kv bucket remove all revisions',
					},
					{
						name: 'Put',
						value: 'put',
						description: 'Put a value into a KV bucket',
						action: 'Put a value into a KV bucket',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a value in a KV bucket (with revision check)',
						action: 'Update a value in a kv bucket with revision check',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Bucket Name',
				name: 'bucket',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'my-bucket',
				description: 'The name of the KV bucket to operate on. Must contain only letters, numbers, underscores, and hyphens (no spaces or dots).',
				hint: 'Example: user-preferences, app-config, cache-data',
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
						operation: ['get', 'put', 'update', 'delete', 'purge', 'history'],
					},
				},
				placeholder: 'user.123.settings',
				description: 'The key to operate on. Can use dots for hierarchical organization (e.g., "user.123.settings"). Cannot contain spaces.',
				hint: 'Example: config.database.host, user.profile.avatar, session.abc123',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['put', 'update'],
					},
				},
				typeOptions: {
					rows: 4,
				},
				description: 'The value to store in the KV bucket. Can be a string, JSON object, or base64-encoded binary data.',
				placeholder: '{"name": "John", "age": 30}',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Value Type',
						name: 'valueType',
						type: 'options',
						options: [
							{
								name: 'JSON',
								value: 'json',
								description: 'Treat value as JSON',
							},
							{
								name: 'String',
								value: 'string',
								description: 'Treat value as string',
							},
							{
								name: 'Binary',
								value: 'binary',
								description: 'Treat value as binary (base64)',
							},
						],
						default: 'json',
						displayOptions: {
							show: {
								'/operation': ['put', 'update'],
							},
						},
					},
					{
						displayName: 'Revision',
						name: 'revision',
						type: 'number',
						default: 0,
						displayOptions: {
							show: {
								'/operation': ['update', 'get'],
							},
						},
						description: 'For get: retrieve a specific revision of the value. For update: the expected current revision (optimistic concurrency control). Use 0 to update regardless of current revision.',
						hint: 'Leave at 0 to get latest or update without revision check',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Human-readable description of what this bucket stores',
						placeholder: 'Stores user preferences and settings',
					},
					{
						displayName: 'History',
						name: 'history',
						type: 'number',
						default: 10,
						typeOptions: {
							minValue: 1,
							maxValue: 100,
						},
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Number of historical versions to keep for each key (1-100). Useful for audit trails and rollback.',
						hint: 'Higher values use more storage but provide better history',
					},
					{
						displayName: 'TTL (Seconds)',
						name: 'ttl',
						type: 'number',
						default: 0,
						typeOptions: {
							minValue: 0,
						},
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Time to live for all entries in seconds. Keys will automatically expire after this duration. Set to 0 for no expiration.',
						hint: 'Example: 3600 = 1 hour, 86400 = 1 day',
						placeholder: '3600',
					},
					{
						displayName: 'Max Bucket Size',
						name: 'maxBucketSize',
						type: 'number',
						default: -1,
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Maximum total size of the bucket in bytes. Set to -1 for unlimited size.',
						hint: 'Example: 1048576 = 1MB, 1073741824 = 1GB',
						placeholder: '1073741824',
					},
					{
						displayName: 'Max Value Size',
						name: 'maxValueSize',
						type: 'number',
						default: -1,
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Maximum size of a single value in bytes. Set to -1 for unlimited size.',
						hint: 'Example: 1024 = 1KB, 1048576 = 1MB',
						placeholder: '1048576',
					},
					{
						displayName: 'Replicas',
						name: 'replicas',
						type: 'number',
						default: 1,
						typeOptions: {
							minValue: 1,
							maxValue: 5,
						},
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Number of data replicas to maintain (1-5). Higher values provide better fault tolerance but use more resources.',
						hint: 'Set to cluster size for maximum durability',
					},
					{
						displayName: 'Storage',
						name: 'storage',
						type: 'options',
						options: [
							{
								name: 'File',
								value: 'file',
							},
							{
								name: 'Memory',
								value: 'memory',
							},
						],
						default: 'file',
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Storage backend for the bucket. File storage persists data to disk, memory storage is faster but data is lost on restart.',
						hint: 'Use memory for cache-like data, file for persistent data',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('natsApi');
		
		let nc: any;
		
		try {
			nc = await createNatsConnection(credentials, this.logger, this.getNode());
			const js = jetstream(nc);
			
			for (let i = 0; i < items.length; i++) {
				try {
					const operation = this.getNodeParameter('operation', i) as string;
					const bucket = this.getNodeParameter('bucket', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					// Validate bucket name
					validateBucketName(bucket);
					
					if (operation === 'createBucket') {
						// Validate numeric parameters
						const history = options.history || 10;
						const replicas = options.replicas || 1;
						const ttl = options.ttl || 0;
						
						validateNumberRange(history, 1, 100, 'History');
						validateNumberRange(replicas, 1, 5, 'Replicas');
						if (ttl < 0) {
							throw new ApplicationError('TTL cannot be negative', {
								level: 'warning',
								tags: { nodeType: 'n8n-nodes-synadia.natsKv' },
							});
						}
						
						// Create a new KV bucket
						const config: any = {
							history,
							storage: options.storage || 'file',
							replicas,
						};
						
						if (options.description) config.description = options.description;
						if (ttl > 0) config.ttl = ttl * 1000000000; // Convert to nanoseconds
						if (options.maxBucketSize > 0) config.max_bytes = options.maxBucketSize;
						if (options.maxValueSize > 0) config.max_value_size = options.maxValueSize;
						
						const kvManager = new Kvm(js);
						const kv = await kvManager.create(bucket, config);
						const status = await kv.status();
						
						returnData.push({
							json: {
								operation: 'createBucket',
								bucket: bucket,
								success: true,
								status: {
									bucket: status.bucket,
									values: status.values,
									size: (status as any).size || (status as any).bytes || 0,
									ttl: status.ttl,
								},
							},
						});
						
					} else if (operation === 'deleteBucket') {
						// Delete a KV bucket
						const jsm = await jetstreamManager(nc);
						const success = await jsm.streams.delete(`KV_${bucket}`);
						
						returnData.push({
							json: {
								operation: 'deleteBucket',
								bucket: bucket,
								success: success,
							},
						});
						
					} else {
						// Get the KV bucket
						const kvManager = new Kvm(js);
						const kv = await kvManager.open(bucket);
						
						switch (operation) {
							case 'get': {
								const key = this.getNodeParameter('key', i) as string;
								validateKeyName(key);
								const entry = options.revision 
									? await kv.get(key, { revision: options.revision })
									: await kv.get(key);
								
								if (entry === null) {
									returnData.push({
										json: {
											operation: 'get',
											bucket,
											key,
											found: false,
										},
									});
								} else {
									let value: any;
									const stringValue = new TextDecoder().decode(entry.value);
									
									try {
										value = JSON.parse(stringValue);
									} catch {
										value = stringValue;
									}
									
									returnData.push({
										json: {
											operation: 'get',
											bucket,
											key,
											found: true,
											value,
											revision: entry.revision,
											created: new Date(entry.created.getTime()).toISOString(),
											delta: entry.delta,
										},
									});
								}
								break;
							}
							
							case 'put': {
								const key = this.getNodeParameter('key', i) as string;
								const value = this.getNodeParameter('value', i) as string;
								validateKeyName(key);
								
								let encodedValue: Uint8Array;
								if (options.valueType === 'binary') {
									encodedValue = new TextEncoder().encode(Buffer.from(value, 'base64').toString());
								} else if (options.valueType === 'json') {
									const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
									encodedValue = new TextEncoder().encode(JSON.stringify(jsonValue));
								} else {
									encodedValue = new TextEncoder().encode(value);
								}
								
								const revision = await kv.put(key, encodedValue);
								
								returnData.push({
									json: {
										operation: 'put',
										bucket,
										key,
										success: true,
										revision,
									},
								});
								break;
							}
							
							case 'update': {
								const key = this.getNodeParameter('key', i) as string;
								const value = this.getNodeParameter('value', i) as string;
								const expectedRevision = options.revision || 0;
								validateKeyName(key);
								
								let encodedValue: Uint8Array;
								if (options.valueType === 'binary') {
									encodedValue = new TextEncoder().encode(Buffer.from(value, 'base64').toString());
								} else if (options.valueType === 'json') {
									const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
									encodedValue = new TextEncoder().encode(JSON.stringify(jsonValue));
								} else {
									encodedValue = new TextEncoder().encode(value);
								}
								
								const revision = await kv.update(key, encodedValue, expectedRevision);
								
								returnData.push({
									json: {
										operation: 'update',
										bucket,
										key,
										success: true,
										revision,
									},
								});
								break;
							}
							
							case 'delete': {
								const key = this.getNodeParameter('key', i) as string;
								validateKeyName(key);
								await kv.delete(key);
								
								returnData.push({
									json: {
										operation: 'delete',
										bucket,
										key,
										success: true,
									},
								});
								break;
							}
							
							case 'purge': {
								const key = this.getNodeParameter('key', i) as string;
								validateKeyName(key);
								await kv.purge(key);
								
								returnData.push({
									json: {
										operation: 'purge',
										bucket,
										key,
										success: true,
									},
								});
								break;
							}
							
							case 'list': {
								const keys: string[] = [];
								const iter = await kv.keys();
								for await (const key of iter) {
									keys.push(key);
								}
								
								returnData.push({
									json: {
										operation: 'list',
										bucket,
										keys,
										count: keys.length,
									},
								});
								break;
							}
							
							case 'history': {
								const key = this.getNodeParameter('key', i) as string;
								validateKeyName(key);
								const history: any[] = [];
								const iter = await kv.history({ key });
								
								for await (const entry of iter) {
									let value: any;
									const stringValue = new TextDecoder().decode(entry.value);
									
									try {
										value = JSON.parse(stringValue);
									} catch {
										value = stringValue;
									}
									
									history.push({
										value,
										revision: entry.revision,
										created: new Date(entry.created.getTime()).toISOString(),
										operation: entry.operation,
										delta: entry.delta,
									});
								}
								
								returnData.push({
									json: {
										operation: 'history',
										bucket,
										key,
										history,
										count: history.length,
									},
								});
								break;
							}
							
							case 'status': {
								const status = await kv.status();
								
								returnData.push({
									json: {
										operation: 'status',
										bucket: status.bucket,
										values: status.values,
										size: (status as any).size || (status as any).bytes || 0,
										ttl: status.ttl,
										streamInfo: (status as any).streamInfo,
									},
								});
								break;
							}
						}
					}
					
				} catch (error: any) {
					if (this.continueOnFail()) {
						returnData.push({
							json: {
								error: error.message,
								operation: this.getNodeParameter('operation', i) as string,
								bucket: this.getNodeParameter('bucket', i) as string,
							},
							pairedItem: { item: i },
						});
					} else {
						throw error;
					}
				}
			}
			
		} catch (error: any) {
			if (error instanceof ApplicationError) {
				throw error;
			}
			throw new NodeOperationError(this.getNode(), `NATS KV operation failed: ${error.message}`, {
				description: error.code === 'STREAM_NOT_FOUND' ? 'The KV bucket does not exist. Please create it first.' : undefined,
			});
		} finally {
			if (nc!) {
				await closeNatsConnection(nc, this.logger);
			}
		}
		
		return [returnData];
	}
}