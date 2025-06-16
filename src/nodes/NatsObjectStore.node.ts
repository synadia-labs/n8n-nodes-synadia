import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection } from '../bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';

export class NatsObjectStore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Object Store',
		name: 'natsObjectStore',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with NATS JetStream Object Store',
		subtitle: '={{$parameter["operation"]}} - {{$parameter["bucket"]}}',
		defaults: {
			name: 'NATS Object Store',
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
						description: 'Create a new object store bucket',
						action: 'Create a new object store bucket',
					},
					{
						name: 'Delete Bucket',
						value: 'deleteBucket',
						description: 'Delete an object store bucket',
						action: 'Delete an object store bucket',
					},
					{
						name: 'Delete Object',
						value: 'delete',
						description: 'Delete an object from the bucket',
						action: 'Delete an object from the bucket',
					},
					{
						name: 'Get Info',
						value: 'info',
						description: 'Get information about an object',
						action: 'Get information about an object',
					},
					{
						name: 'Get Link',
						value: 'link',
						description: 'Create a link to an object in another bucket',
						action: 'Create a link to an object in another bucket',
					},
					{
						name: 'Get Object',
						value: 'get',
						description: 'Retrieve an object from the bucket',
						action: 'Retrieve an object from the bucket',
					},
					{
						name: 'Get Status',
						value: 'status',
						description: 'Get status of an object store bucket',
						action: 'Get status of an object store bucket',
					},
					{
						name: 'List Objects',
						value: 'list',
						description: 'List all objects in the bucket',
						action: 'List all objects in the bucket',
					},
					{
						name: 'Put Object',
						value: 'put',
						description: 'Store an object in the bucket',
						action: 'Store an object in the bucket',
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
				description: 'The name of the object store bucket',
			},
			{
				displayName: 'Object Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['put', 'get', 'delete', 'info', 'link'],
					},
				},
				placeholder: 'my-file.txt',
				description: 'The name of the object',
			},
			{
				displayName: 'Data',
				name: 'data',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['put'],
					},
				},
				typeOptions: {
					rows: 4,
				},
				description: 'The data to store',
			},
			{
				displayName: 'Link Source',
				name: 'linkSource',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['link'],
					},
				},
				placeholder: 'source-bucket/source-object',
				description: 'The source object to link to (bucket/object format)',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Data Type',
						name: 'dataType',
						type: 'options',
						options: [
							{
								name: 'String',
								value: 'string',
								description: 'Treat data as string',
							},
							{
								name: 'JSON',
								value: 'json',
								description: 'Treat data as JSON',
							},
							{
								name: 'Binary',
								value: 'binary',
								description: 'Treat data as binary (base64)',
							},
						],
						default: 'string',
						displayOptions: {
							show: {
								'/operation': ['put'],
							},
						},
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								'/operation': ['createBucket', 'put'],
							},
						},
						description: 'Description of the bucket or object',
					},
					{
						displayName: 'Headers',
						name: 'headers',
						type: 'json',
						default: '{}',
						displayOptions: {
							show: {
								'/operation': ['put'],
							},
						},
						description: 'Custom headers for the object',
					},
					{
						displayName: 'Chunk Size',
						name: 'chunkSize',
						type: 'number',
						default: 131072,
						displayOptions: {
							show: {
								'/operation': ['put', 'get'],
							},
						},
						description: 'Chunk size for streaming operations',
					},
					{
						displayName: 'TTL (Seconds)',
						name: 'ttl',
						type: 'number',
						default: 0,
						displayOptions: {
							show: {
								'/operation': ['createBucket'],
							},
						},
						description: 'Time to live for objects in seconds (0 = no expiry)',
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
		
		let nc: NatsConnection;
		
		try {
			nc = await createNatsConnection(credentials, this);
			const js = nc.jetstream();
			
			for (let i = 0; i < items.length; i++) {
				try {
					const operation = this.getNodeParameter('operation', i) as string;
					const bucket = this.getNodeParameter('bucket', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					if (operation === 'createBucket') {
						// Create a new object store bucket
						const config: any = {
							storage: options.storage || 'file',
							replicas: options.replicas || 1,
						};
						
						if (options.description) config.description = options.description;
						if (options.ttl) config.ttl = options.ttl * 1000000000; // Convert to nanoseconds
						if (options.maxBucketSize > 0) config.max_bytes = options.maxBucketSize;
						
						const os = await js.views.os(bucket, config);
						const status = await os.status();
						
						returnData.push({
							json: {
								operation: 'createBucket',
								bucket: bucket,
								success: true,
								status: {
									bucket: status.bucket,
									size: status.size,
									metadata: (status as any).metadata,
									objects: (status as any).chunks || 0,
								},
							},
						});
						
					} else if (operation === 'deleteBucket') {
						// Delete an object store bucket
						const jsm = await js.jetstreamManager();
						const success = await jsm.streams.delete(`OBJ_${bucket}`);
						
						returnData.push({
							json: {
								operation: 'deleteBucket',
								bucket: bucket,
								success: success,
							},
						});
						
					} else {
						// Get the object store
						const os = await js.views.os(bucket);
						
						switch (operation) {
							case 'put': {
								const name = this.getNodeParameter('name', i) as string;
								const data = this.getNodeParameter('data', i) as string;
								
								let objectData: Uint8Array;
								const dataType = options.dataType || 'string';
								
								if (dataType === 'binary') {
									objectData = new TextEncoder().encode(Buffer.from(data, 'base64').toString());
								} else if (dataType === 'json') {
									const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
									objectData = new TextEncoder().encode(JSON.stringify(jsonData));
								} else {
									objectData = new TextEncoder().encode(data);
								}
								
								const putOptions: any = {
									headers: options.headers ? JSON.parse(options.headers) : undefined,
									description: options.description,
									chunkSize: options.chunkSize || 128 * 1024,
								};
								
								// Create a readable stream from the data
								const readable = new ReadableStream({
									start(controller) {
										controller.enqueue(objectData);
										controller.close();
									}
								});
								
								const info = await os.put({ name, ...putOptions }, readable);
								
								returnData.push({
									json: {
										operation: 'put',
										bucket,
										name,
										success: true,
										info: {
											name: info.name,
											size: info.size,
											chunks: info.chunks,
											digest: info.digest,
											mtime: info.mtime,
										},
									},
								});
								break;
							}
							
							case 'get': {
								const name = this.getNodeParameter('name', i) as string;
								const result = await os.get(name);
								
								if (result === null) {
									returnData.push({
										json: {
											operation: 'get',
											bucket,
											name,
											found: false,
										},
									});
								} else {
									// Read the data
									const chunks: Uint8Array[] = [];
									for await (const chunk of result.data) {
										chunks.push(chunk);
									}
									
									// Combine chunks
									const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
									const combined = new Uint8Array(totalLength);
									let offset = 0;
									for (const chunk of chunks) {
										combined.set(chunk, offset);
										offset += chunk.length;
									}
									
									const stringData = new TextDecoder().decode(combined);
									let data: any;
									
									try {
										data = JSON.parse(stringData);
									} catch {
										data = stringData;
									}
									
									returnData.push({
										json: {
											operation: 'get',
											bucket,
											name,
											found: true,
											data,
											info: {
												name: result.info.name,
												size: result.info.size,
												chunks: result.info.chunks,
												digest: result.info.digest,
												mtime: result.info.mtime,
											},
										},
									});
								}
								break;
							}
							
							case 'delete': {
								const name = this.getNodeParameter('name', i) as string;
								await os.delete(name);
								
								returnData.push({
									json: {
										operation: 'delete',
										bucket,
										name,
										success: true,
									},
								});
								break;
							}
							
							case 'info': {
								const name = this.getNodeParameter('name', i) as string;
								const info = await os.info(name);
								
								if (info === null) {
									returnData.push({
										json: {
											operation: 'info',
											bucket,
											name,
											found: false,
										},
									});
								} else {
									returnData.push({
										json: {
											operation: 'info',
											bucket,
											name,
											found: true,
											info: {
												name: info.name,
												size: info.size,
												chunks: info.chunks,
												digest: info.digest,
												mtime: info.mtime,
												headers: info.headers,
												options: info.options,
											},
										},
									});
								}
								break;
							}
							
							case 'link': {
								const name = this.getNodeParameter('name', i) as string;
								const linkSource = this.getNodeParameter('linkSource', i) as string;
								const [sourceBucket, sourceObject] = linkSource.split('/');
								
								if (!sourceBucket || !sourceObject) {
									throw new NodeOperationError(this.getNode(), 'Link source must be in format: bucket/object');
								}
								
								const sourceOs = await js.views.os(sourceBucket);
								const sourceInfo = await sourceOs.info(sourceObject);
								
								if (!sourceInfo) {
									throw new NodeOperationError(this.getNode(), 'Source object not found');
								}
								
								const info = await os.link(name, sourceInfo);
								
								returnData.push({
									json: {
										operation: 'link',
										bucket,
										name,
										success: true,
										linkSource,
										info: {
											name: info.name,
											size: info.size,
											chunks: info.chunks,
											digest: info.digest,
											mtime: info.mtime,
										},
									},
								});
								break;
							}
							
							case 'list': {
								const objects: any[] = [];
								const list = await os.list();
								
								for await (const info of list) {
									objects.push({
										name: info.name,
										size: info.size,
										chunks: info.chunks,
										digest: info.digest,
										mtime: info.mtime,
										isLink: info.options?.link !== undefined,
									});
								}
								
								returnData.push({
									json: {
										operation: 'list',
										bucket,
										objects,
										count: objects.length,
									},
								});
								break;
							}
							
							case 'status': {
								const status = await os.status();
								
								returnData.push({
									json: {
										operation: 'status',
										bucket: status.bucket,
										size: status.size,
										objects: (status as any).chunks || 0,
										bytes: (status as any).bytes || status.size || 0,
										storage: (status as any).storage,
										replicas: (status as any).replicas,
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
			throw new NodeOperationError(this.getNode(), `NATS Object Store operation failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc);
			}
		}
		
		return [returnData];
	}
}