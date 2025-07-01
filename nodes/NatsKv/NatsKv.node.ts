import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { Kvm, KvOptions } from '../../bundled/nats-bundled';
import { closeNatsConnection, createNatsConnection } from '../../utils/NatsConnection';
import { NodeLogger } from '../../utils/NodeLogger';
import { validateBucketName } from '../../utils/NatsHelpers';
import { 
	keyOperationHandlers, 
	bucketOperationHandlers, 
	KvOperationParams, 
	KvmOperationParams 
} from './operations';
import { bucketOperations, bucketFields } from './BucketDescription';
import { keyOperations, keyFields } from './KeyDescription';

export class NatsKv implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS KV',
		name: 'natsKv',
		icon: 'file:../../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with NATS JetStream Key-Value Store - manage buckets and keys',
		subtitle: '={{$parameter["resource"]}} - {{$parameter["operation"]}} - {{$parameter["bucket"]}}',
		defaults: {
			name: 'NATS KV',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Bucket',
						value: 'bucket',
						description: 'Manage KV buckets (create, delete, get status)',
					},
					{
						name: 'Key',
						value: 'key',
						description: 'Manage keys and values within buckets',
					},
				],
				default: 'key',
			},
			...bucketOperations,
			...bucketFields,
			...keyOperations,
			...keyFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('natsApi');

		let nc: any;

		// Create NodeLogger once for the entire execution
		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		try {
			nc = await createNatsConnection(credentials, nodeLogger);
			const kvm = new Kvm(nc);

			for (let i = 0; i < items.length; i++) {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const bucket = this.getNodeParameter('bucket', i) as string;

				try {
					let result: any;

					if (resource === 'bucket') {
						// Bucket operations
						validateBucketName(bucket);

						const handler = bucketOperationHandlers[operation];
						if (!handler) {
							const error = `Unknown bucket operation: ${operation}`;
							if (!this.continueOnFail()) throw new NodeOperationError(this.getNode(), error, { itemIndex: i });

							returnData.push({
								error: new NodeOperationError(this.getNode(), error, { itemIndex: i }),
								json: { operation, resource },
								pairedItem: i,
							});
							continue;
						}

						const params: KvmOperationParams = {
							bucket,
							kvConfig: this.getNodeParameter('config', i, {}) as KvOptions,
						};

						result = await handler.execute(kvm, params);

					} else if (resource === 'key') {
						// Key operations
						const kv = await kvm.open(bucket);

						const handler = keyOperationHandlers[operation];
						if (!handler) {
							const error = `Unknown key operation: ${operation}`;
							if (!this.continueOnFail()) throw new NodeOperationError(this.getNode(), error, { itemIndex: i });

							returnData.push({
								error: new NodeOperationError(this.getNode(), error, { itemIndex: i }),
								json: { operation, resource },
								pairedItem: i,
							});
							continue;
						}

						const params: KvOperationParams = {
							key: this.getNodeParameter('key', i, '') as string,
							value: this.getNodeParameter('value', i, '') as string,
						};

						result = await handler.execute(kv, params);

					} else {
						const error = `Unknown resource: ${resource}`;
						if (!this.continueOnFail()) throw new NodeOperationError(this.getNode(), error, { itemIndex: i });

						returnData.push({
							error: new NodeOperationError(this.getNode(), error, { itemIndex: i }),
							json: { resource },
							pairedItem: i,
						});
						continue;
					}

					returnData.push({
						json: result,
						pairedItem: i,
					});

				} catch (error: any) {
					if (!this.continueOnFail()) throw error;

					returnData.push({
						error: new NodeOperationError(this.getNode(), error.message || error, { itemIndex: i }),
						json: {
							resource,
							operation,
							bucket,
						},
						pairedItem: i,
					});
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
