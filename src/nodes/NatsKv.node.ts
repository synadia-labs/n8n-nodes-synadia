import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { jetstream, jetstreamManager, Kvm } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';

export class NatsKv implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS KV Store',
		name: 'natsKv',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with NATS JetStream Key-Value Store',
		subtitle: '={{$parameter["operation"]}} - {{$parameter["bucket"]}}',
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
				options: [
					{
						name: 'Create Bucket',
						value: 'createBucket',
						description: 'Create a new KV bucket',
					},
					{
						name: 'Delete Bucket',
						value: 'deleteBucket',
						description: 'Delete a KV bucket',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a value from a KV bucket',
					},
					{
						name: 'Put',
						value: 'put',
						description: 'Put a value into a KV bucket',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a value in a KV bucket (with revision check)',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a key from a KV bucket',
					},
					{
						name: 'Purge',
						value: 'purge',
						description: 'Purge a key from a KV bucket (remove all revisions)',
					},
					{
						name: 'List Keys',
						value: 'list',
						description: 'List all keys in a KV bucket',
					},
					{
						name: 'Get History',
						value: 'history',
						description: 'Get history for a key',
					},
					{
						name: 'Get Status',
						value: 'status',
						description: 'Get status of a KV bucket',
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
				description: 'The name of the KV bucket',
			},
			{
				displayName: 'Key',
				name: 'key',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['get', 'put', 'update', 'delete', 'purge', 'history'],
					},
				},
				placeholder: 'my-key',
				description: 'The key to operate on',
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
				description: 'The value to store',
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
						description: 'Specific revision to get or expected revision for update',
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
						description: 'Description of the bucket',
					},
					{
						displayName: 'History',
						name: 'history',
						type: 'number',
						default: 10,
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Number of history entries to keep per key',
					},
					{
						displayName: 'TTL (seconds)',
						name: 'ttl',
						type: 'number',
						default: 0,
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Time to live for entries in seconds (0 = no expiry)',
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
						description: 'Maximum size of the bucket in bytes (-1 = unlimited)',
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
						description: 'Maximum size of a single value in bytes (-1 = unlimited)',
					},
					{
						displayName: 'Replicas',
						name: 'replicas',
						type: 'number',
						default: 1,
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Number of replicas for the bucket',
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
						description: 'Storage backend for the bucket',
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
			nc = await createNatsConnection(credentials, this);
			const js = jetstream(nc);
			
			for (let i = 0; i < items.length; i++) {
				try {
					const operation = this.getNodeParameter('operation', i) as string;
					const bucket = this.getNodeParameter('bucket', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					if (operation === 'createBucket') {
						// Create a new KV bucket
						const config: any = {
							history: options.history || 10,
							storage: options.storage || 'file',
							replicas: options.replicas || 1,
						};
						
						if (options.description) config.description = options.description;
						if (options.ttl) config.ttl = options.ttl * 1000000000; // Convert to nanoseconds
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
			throw new NodeOperationError(this.getNode(), `NATS KV operation failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc);
			}
		}
		
		return [returnData];
	}
}