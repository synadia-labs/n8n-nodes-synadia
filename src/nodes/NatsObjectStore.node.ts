import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	ApplicationError,
} from 'n8n-workflow';
import { jetstream, Objm } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { objectStoreOperationHandlers } from '../utils/operations/objectstore';
import { validateBucketName, validateObjectName } from '../utils/ValidationHelpers';

export class NatsObjectStore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Object Store',
		name: 'natsObjectStore',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Store and retrieve objects (files, data) in NATS JetStream Object Store',
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
						description: 'Create a new bucket for storing objects',
						action: 'Create a new bucket for storing objects',
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
						description: 'Download an object from the bucket',
						action: 'Download an object from the bucket',
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
						description: 'Upload data or file to the bucket',
						action: 'Upload data or file to the bucket',
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
				placeholder: 'my-files',
				description: 'Name of the bucket (no spaces or dots allowed)',
				hint: 'Use only letters, numbers, hyphens, and underscores',
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
				placeholder: 'reports/2024/sales.pdf',
				description: 'Name or path to the object (can include forward slashes for organization)',
				hint: 'Example: images/logo.png or documents/report.pdf',
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
				description: 'Content to store in the object (text, JSON, or base64 for binary)',
				hint: 'For files, use binary mode and provide base64 encoded data',
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
				placeholder: 'archive-bucket/reports/2023/annual.pdf',
				description: 'Path to source object (format: bucket-name/object-path)',
				hint: 'Creates a reference to an object in another bucket without copying data',
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
						description: 'Human-readable description for the bucket or object',
						placeholder: 'Company financial reports archive',
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
						description: 'Custom metadata headers as JSON (e.g., {"Content-Type": "application/pdf"})',
						placeholder: '{"author": "John Doe", "department": "Sales"}',
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
						description: 'Size of data chunks for streaming large files (in bytes)',
						hint: 'Default 128KB. Increase for better performance with large files',
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
						description: 'Automatically delete objects after this many seconds (0 = never expire)',
						hint: 'Useful for temporary files or cache data',
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
						description: 'Maximum total size of all objects in the bucket in bytes',
						hint: 'Use -1 for unlimited. Example: 1073741824 for 1GB',
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
						description: 'Number of data copies to maintain for redundancy',
						hint: 'Higher values increase durability but use more storage',
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
						description: 'Where to store the data',
						hint: 'File: persistent storage, Memory: faster but temporary',
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
					
					// Validate bucket name
					validateBucketName(bucket);
					
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
					
					// Validate object name for operations that require it
					if (['put', 'get', 'delete', 'info', 'link'].includes(operation) && params.name) {
						validateObjectName(params.name);
					}
					
					// Handle link operation parameters
					if (operation === 'link') {
						const linkSource = this.getNodeParameter('linkSource', i, '') as string;
						if (!linkSource) {
							throw new ApplicationError('Link source cannot be empty', {
								level: 'warning',
								tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
							});
						}
						const parts = linkSource.split('/');
						if (parts.length < 2) {
							throw new ApplicationError('Link source must be in format: bucket-name/object-path', {
								level: 'warning',
								tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
							});
						}
						const sourceBucket = parts[0];
						const sourceName = parts.slice(1).join('/');
						validateBucketName(sourceBucket);
						validateObjectName(sourceName);
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