import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { jetstream, jetstreamManager, Objm } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { validateBucketName, validateNumberRange } from '../utils/ValidationHelpers';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsObjectStoreManager implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Object Store Manager',
		name: 'natsObjectStoreManager',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Manage NATS JetStream Object Store buckets',
		subtitle: '{{$parameter["operation"]}} - {{$parameter["bucket"]}}',
		defaults: {
			name: 'NATS Object Store Manager',
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
						description: 'Create a new Object Store bucket',
						action: 'Create a new Object Store bucket',
					},
					{
						name: 'Delete Bucket',
						value: 'deleteBucket',
						description: 'Delete an Object Store bucket',
						action: 'Delete an Object Store bucket',
					},
					{
						name: 'Get Status',
						value: 'status',
						description: 'Get status of an Object Store bucket',
						action: 'Get status of an Object Store bucket',
					},
				],
				default: 'status',
			},
			{
				displayName: 'Bucket Name',
				name: 'bucket',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'my-files',
				description: 'Name of the Object Store bucket',
				hint: 'Bucket names can only contain alphanumeric characters, dashes, and underscores',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['createBucket'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the Object Store bucket',
						placeholder: 'File storage bucket',
					},
					{
						displayName: 'TTL (Seconds)',
						name: 'ttl',
						type: 'number',
						default: 0,
						description: 'Time-to-live for objects in seconds (0 = unlimited)',
						hint: 'Objects older than this will be automatically deleted',
					},
					{
						displayName: 'Max Bucket Size (Bytes)',
						name: 'maxBucketSize',
						type: 'number',
						default: -1,
						description: 'Maximum total size of the bucket in bytes (-1 = unlimited)',
					},
					{
						displayName: 'Storage Type',
						name: 'storage',
						type: 'options',
						options: [
							{
								name: 'File',
								value: 'file',
								description: 'Store on disk',
							},
							{
								name: 'Memory',
								value: 'memory',
								description: 'Store in memory',
							},
						],
						default: 'file',
						description: 'Storage backend for the bucket',
					},
					{
						displayName: 'Replicas',
						name: 'replicas',
						type: 'number',
						default: 1,
						description: 'Number of replicas for the bucket',
						hint: 'Higher numbers provide better fault tolerance',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('natsApi');
		
		let nc;
		
		// Create NodeLogger once for the entire execution
		const nodeLogger = new NodeLogger(this.logger, this.getNode());
		
		try {
			nc = await createNatsConnection(credentials, nodeLogger);
			const js = jetstream(nc);
			const jsm = await jetstreamManager(nc);
			const objManager = new Objm(js);
			
			for (let i = 0; i < items.length; i++) {
				try {
					const operation = this.getNodeParameter('operation', i) as string;
					const bucket = this.getNodeParameter('bucket', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					// Validate bucket name
					validateBucketName(bucket);
					
					let result: any = {};
					
					switch (operation) {
						case 'createBucket':
							// Validate options
							if (options.ttl && options.ttl < 0) {
								throw new NodeOperationError(this.getNode(), 'TTL must be non-negative', { itemIndex: i });
							}
							if (options.replicas) {
								validateNumberRange(options.replicas, 1, Number.MAX_SAFE_INTEGER, 'Replicas');
							}
							
							const bucketConfig: any = {};
							if (options.description) bucketConfig.description = options.description;
							if (options.ttl) bucketConfig.max_age = options.ttl * 1000000000; // Convert to nanoseconds
							if (options.maxBucketSize && options.maxBucketSize > 0) bucketConfig.max_bytes = options.maxBucketSize;
							if (options.storage) bucketConfig.storage = options.storage === 'memory' ? 1 : 0; // 0 = file, 1 = memory
							if (options.replicas) bucketConfig.num_replicas = options.replicas;
							
							const objStore = await objManager.create(bucket, bucketConfig);
							result = {
								success: true,
								operation: 'createBucket',
								bucket,
								status: await objStore.status(),
							};
							break;
							
						case 'deleteBucket':
							const objToDelete = await objManager.open(bucket);
							await objToDelete.destroy();
							result = {
								success: true,
								operation: 'deleteBucket',
								bucket,
							};
							break;
							
						case 'status':
							const store = await objManager.open(bucket);
							const status = await store.status();
							result = {
								success: true,
								operation: 'status',
								bucket,
								status,
							};
							break;
							
						default:
							throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
					}
					
					returnData.push({
						json: {
							...result,
							timestamp: new Date().toISOString(),
						},
						pairedItem: { item: i },
					});
					
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
			throw new NodeOperationError(this.getNode(), `NATS Object Store Manager failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
		}
		
		return [returnData];
	}
}