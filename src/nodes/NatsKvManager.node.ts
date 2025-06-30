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
import { validateBucketName, validateNumberRange } from '../utils/ValidationHelpers';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsKvManager implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS KV Manager',
		name: 'natsKvManager',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Manage NATS JetStream Key-Value Store buckets',
		subtitle: '{{$parameter["operation"]}} - {{$parameter["bucket"]}}',
		defaults: {
			name: 'NATS KV Manager',
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
						name: 'Delete Bucket',
						value: 'deleteBucket',
						description: 'Delete a KV bucket',
						action: 'Delete a KV bucket',
					},
					{
						name: 'Get Status',
						value: 'status',
						description: 'Get status of a KV bucket',
						action: 'Get status of a KV bucket',
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
				placeholder: 'my-bucket',
				description: 'Name of the KV bucket',
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
						description: 'Description of the KV bucket',
						placeholder: 'User preferences bucket',
					},
					{
						displayName: 'Max Age (Seconds)',
						name: 'maxAge',
						type: 'number',
						default: 0,
						description: 'Maximum age of values in seconds (0 = unlimited)',
						hint: 'Values older than this will be automatically deleted',
					},
					{
						displayName: 'Max Value Size (Bytes)',
						name: 'maxValueSize',
						type: 'number',
						default: -1,
						description: 'Maximum size of a single value in bytes (-1 = unlimited)',
					},
					{
						displayName: 'History Per Key',
						name: 'history',
						type: 'number',
						default: 1,
						description: 'Number of historical values to keep per key',
						hint: 'Set to 1 to only keep the latest value',
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
			const kvManager = new Kvm(js);
			
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
							if (options.maxAge && options.maxAge < 0) {
								throw new NodeOperationError(this.getNode(), 'Max age must be non-negative', { itemIndex: i });
							}
							if (options.history) {
								validateNumberRange(options.history, 1, Number.MAX_SAFE_INTEGER, 'History per key');
							}
							if (options.replicas) {
								validateNumberRange(options.replicas, 1, Number.MAX_SAFE_INTEGER, 'Replicas');
							}
							
							const bucketConfig: any = {};
							if (options.description) bucketConfig.description = options.description;
							if (options.maxAge) bucketConfig.max_age = options.maxAge * 1000000000; // Convert to nanoseconds
							if (options.maxValueSize && options.maxValueSize > 0) bucketConfig.max_value_size = options.maxValueSize;
							if (options.history) bucketConfig.history = options.history;
							if (options.storage) bucketConfig.storage = options.storage === 'memory' ? 1 : 0; // 0 = file, 1 = memory
							if (options.replicas) bucketConfig.num_replicas = options.replicas;
							
							const kv = await kvManager.create(bucket, bucketConfig);
							result = {
								success: true,
								operation: 'createBucket',
								bucket,
								status: await kv.status(),
							};
							break;
							
						case 'deleteBucket':
							const kvToDelete = await kvManager.open(bucket);
							await kvToDelete.destroy();
							result = {
								success: true,
								operation: 'deleteBucket',
								bucket,
							};
							break;
							
						case 'status':
							const kvStore = await kvManager.open(bucket);
							const status = await kvStore.status();
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
			throw new NodeOperationError(this.getNode(), `NATS KV Manager failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
		}
		
		return [returnData];
	}
}