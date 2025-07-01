import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { Objm, jetstream, ObjectStoreOptions } from '../../bundled/nats-bundled';
import { closeNatsConnection, createNatsConnection } from '../../utils/NatsConnection';
import { NodeLogger } from '../../utils/NodeLogger';
import { validateBucketName } from '../../utils/NatsHelpers';
import { 
	objectOperationHandlers, 
	bucketOperationHandlers, 
	OsOperationParams, 
	OsmOperationParams 
} from './operations';
import { bucketOperations, bucketFields } from './BucketDescription';
import { objectOperations, objectFields } from './ObjectDescription';

export class NatsObjectStore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Object Store',
		name: 'natsObjectStore',
		icon: 'file:../../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Store and retrieve objects (files, data) in NATS JetStream Object Store - manage buckets and objects',
		subtitle: '={{$parameter["resource"]}} - {{$parameter["operation"]}} - {{$parameter["bucket"]}}',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Bucket',
						value: 'bucket',
						description: 'Manage Object Store buckets (create, delete, get status)',
					},
					{
						name: 'Object',
						value: 'object',
						description: 'Manage objects and data within buckets',
					},
				],
				default: 'object',
			},
			...bucketOperations,
			...bucketFields,
			...objectOperations,
			...objectFields,
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
			const js = jetstream(nc);
			const osm = new Objm(js);

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

						const params: OsmOperationParams = {
							bucket,
							objConfig: this.getNodeParameter('config', i, {}) as ObjectStoreOptions,
						};

						result = await handler.execute(osm, params);

					} else if (resource === 'object') {
						// Object operations
						const os = await osm.open(bucket);

						const handler = objectOperationHandlers[operation];
						if (!handler) {
							const error = `Unknown object operation: ${operation}`;
							if (!this.continueOnFail()) throw new NodeOperationError(this.getNode(), error, { itemIndex: i });

							returnData.push({
								error: new NodeOperationError(this.getNode(), error, { itemIndex: i }),
								json: { operation, resource },
								pairedItem: i,
							});
							continue;
						}

						const params: OsOperationParams = {
							name: this.getNodeParameter('name', i, '') as string,
						};

						const data = this.getNodeParameter('data', i, '') as string;
						if (data !== '') {
							params.data = new TextEncoder().encode(data);
						}

						result = await handler.execute(os, params);

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
