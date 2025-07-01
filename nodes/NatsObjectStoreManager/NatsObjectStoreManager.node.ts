import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { jetstream, Objm, ObjectStoreOptions } from '../../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { NodeLogger } from '../../utils/NodeLogger';
import { osmOperationHandlers } from './operations';
import { OsmOperationParams } from './OsmOperationHandler';

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
						name: 'Create',
						value: 'create',
						description: 'Create a new Object Store bucket',
						action: 'Create a new object store bucket',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an Object Store bucket',
						action: 'Delete an object store bucket',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get status of an Object Store bucket',
						action: 'Get status of an object store bucket',
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
				description: 'Name of the Object Store bucket',
				hint: 'Bucket names can only contain alphanumeric characters, dashes, and underscores',
			},
			{
				displayName: 'Config',
				name: 'config',
				type: 'collection',
				placeholder: 'Add Config Option',
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
						name: 'max_bytes',
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
			const osm = new Objm(js);

			for (let i = 0; i < items.length; i++) {
				const operation = this.getNodeParameter('operation', i) as string;
				const handler = osmOperationHandlers[operation];
				if (!handler) {
					const error = `Unknown operation: ${operation}`;
					if (!this.continueOnFail()) throw error;

					returnData.push({
						error: new NodeOperationError(this.getNode(), error, { itemIndex: i }),
						json: {
							operation,
						},
						pairedItem: i,
					});
					continue;
				}

				const params: OsmOperationParams = {
					bucket: this.getNodeParameter('bucket', i) as string,
					objConfig: this.getNodeParameter('config', i, {}) as ObjectStoreOptions,
				};

				try {
					let result = await handler.execute(osm, params);

					// Execute the operation
					returnData.push({
						json: result,
						pairedItem: i,
					});
				} catch (error: any) {
					if (!this.continueOnFail()) throw error;

					returnData.push({
						error: new NodeOperationError(this.getNode(), error, { itemIndex: i }),
						json: {
							params: params,
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
