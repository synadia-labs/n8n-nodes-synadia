import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { jetstream, Objm } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { objectStoreOperationHandlers } from '../utils/operations/objectstore';

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
				options: [
					{
						name: 'Create Bucket',
						value: 'createBucket',
						description: 'Create a new object store bucket',
					},
					{
						name: 'Delete Bucket',
						value: 'deleteBucket',
						description: 'Delete an object store bucket',
					},
					{
						name: 'Put Object',
						value: 'put',
						description: 'Store an object in the bucket',
					},
					{
						name: 'Get Object',
						value: 'get',
						description: 'Retrieve an object from the bucket',
					},
					{
						name: 'Delete Object',
						value: 'delete',
						description: 'Delete an object from the bucket',
					},
					{
						name: 'Get Info',
						value: 'info',
						description: 'Get information about an object',
					},
					{
						name: 'List Objects',
						value: 'list',
						description: 'List all objects in the bucket',
					},
					{
						name: 'Get Link',
						value: 'link',
						description: 'Create a link to an object in another bucket',
					},
					{
						name: 'Get Status',
						value: 'status',
						description: 'Get status of an object store bucket',
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
						default: 128 * 1024,
						displayOptions: {
							show: {
								'/operation': ['put', 'get'],
							},
						},
						description: 'Chunk size for streaming operations',
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
		
		let nc: any;
		
		try {
			nc = await createNatsConnection(credentials, this);
			const js = jetstream(nc);
			
			for (let i = 0; i < items.length; i++) {
				try {
					const operation = this.getNodeParameter('operation', i) as string;
					const bucket = this.getNodeParameter('bucket', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					const handler = objectStoreOperationHandlers[operation];
					
					if (!handler) {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}
					
					// Prepare parameters for the operation
					const params: any = {
						bucket,
						options,
						itemIndex: i,
						name: this.getNodeParameter('name', i, '') as string,
						data: this.getNodeParameter('data', i, '') as string,
					};
					
					// Handle link operation parameters
					if (operation === 'link') {
						const linkSource = this.getNodeParameter('linkSource', i, '') as string;
						const [sourceBucket, sourceName] = linkSource.split('/');
						if (!sourceBucket || !sourceName) {
							throw new NodeOperationError(this.getNode(), 'Link source must be in format: bucket/object');
						}
						params.sourceBucket = sourceBucket;
						params.sourceName = sourceName;
					}
					
					let result;
					
					if (operation === 'createBucket' || operation === 'deleteBucket') {
						// These operations need the connection directly
						result = await handler.execute(nc, params);
					} else if (operation === 'link') {
						// Link operation needs both ObjectStore and NatsConnection
						const objManager = new Objm(js);
						const os = await objManager.open(bucket);
						result = await handler.execute({ os, nc }, params);
					} else {
						// Other operations just need ObjectStore
						const objManager = new Objm(js);
						const os = await objManager.open(bucket);
						result = await handler.execute(os, params);
					}
					
					returnData.push({ json: result });
					
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