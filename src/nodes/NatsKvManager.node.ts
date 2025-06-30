import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import {Kvm, KvOptions} from '../bundled/nats-bundled';
import {closeNatsConnection, createNatsConnection} from '../utils/NatsConnection';
import {NodeLogger} from '../utils/NodeLogger';
import {kvmOperationHandlers} from '../operations/kvm';
import {KvmOperationParams} from "../operations/KvmOperationHandler";

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
						value: 'create',
						description: 'Create a new KV bucket',
						action: 'Create a new KV bucket',
					},
					{
						name: 'Delete Bucket',
						value: 'delete',
						description: 'Delete a KV bucket',
						action: 'Delete a KV bucket',
					},
					{
						name: 'Get Status',
						value: 'get',
						description: 'Get status of a KV bucket',
						action: 'Get status of a KV bucket',
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
				description: 'Name of the KV bucket',
				hint: 'Bucket names can only contain alphanumeric characters, dashes, and underscores',
			},
			{
				displayName: 'Config',
				name: 'config',
				type: 'collection',
				placeholder: 'Add Configuration Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['create'],
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
						displayName: 'History Per Key',
						name: 'history',
						type: 'number',
						default: 1,
						description: 'Number of historical values to keep per key',
						hint: 'Set to 1 to only keep the latest value',
					},
					{
						displayName: 'Max Size (Bytes)',
						name: 'max_bytes',
						type: 'number',
						default: -1,
						description: 'The maximum size of the bucket',
					},
					{
						displayName: 'Max Value Size (Bytes)',
						name: 'maxValueSize',
						type: 'number',
						default: -1,
						description: 'Maximum size of a single value in bytes (-1 = unlimited)',
					},
					{
						displayName: 'Replicas',
						name: 'replicas',
						type: 'number',
						default: 1,
						description: 'Number of replicas for the bucket',
						hint: 'Higher numbers provide better fault tolerance',
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
						displayName: 'TTL (Seconds)',
						name: 'ttl',
						type: 'number',
						default: 0,
						description: 'The maximum number of millis the key should live in the KV. The server will automatically remove keys older than this amount. Note that deletion of delete markers are not performed',
						hint: 'Values older than this will be automatically deleted',
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
			const kvManager = new Kvm(nc);
			
			for (let i = 0; i < items.length; i++) {
				const operation = this.getNodeParameter('operation', i) as string;
				const bucket = this.getNodeParameter('bucket', i) as string;

				const handler = kvmOperationHandlers[operation];
				if (!handler) {
					const error = `Unknown operation: ${operation}`
					if (! this.continueOnFail()) throw error;

					returnData.push({
						error: new NodeOperationError(this.getNode(), error, {itemIndex: i}),
						json: {
							operation,
						},
						pairedItem: i
					})
					continue
				}

				const params : KvmOperationParams = {
					bucket,
					kvConfig: this.getNodeParameter('config', i, {}) as KvOptions,
				}

				try {
					let result = await handler.execute(kvManager, params)

					// Execute the operation
					returnData.push({
						json: result,
						pairedItem: i,
					});
				} catch (error : any) {
					if (! this.continueOnFail()) throw error;

					returnData.push({
						error: new NodeOperationError(this.getNode(), error, {itemIndex: i}),
						json: {
							params: params,
						},
						pairedItem: i
					})
				}
			}

		} finally {
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
		}
		
		return [returnData];
	}
}