import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { Objm } from '../../bundled/nats-bundled';
import { closeNatsConnection, createNatsConnection } from '../../utils/NatsConnection';
import { NodeLogger } from '../../utils/NodeLogger';
import { OsOperationParams } from '../../operations/OsOperationHandler';
import { osOperationHandlers } from '../../operations/os';

export class NatsObjectStore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Object Store',
		name: 'natsObjectStore',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Store and retrieve objects (files, data) in NATS JetStream Object Store',
		subtitle: '{{$parameter["operation"]}} - {{$parameter["bucket"]}}',
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
						name: 'Get Object',
						value: 'get',
						description: 'Download an object from the bucket',
						action: 'Download an object from the bucket',
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
						operation: ['put', 'get', 'delete', 'info'],
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
				description: 'Content to store in the object',
				hint: 'Provide the data as you want it stored',
			},
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
			const osm = new Objm(nc);

			for (let i = 0; i < items.length; i++) {
				const bucket = this.getNodeParameter('bucket', i) as string;
				const os = await osm.open(bucket);

				const operation = this.getNodeParameter('operation', i) as string;
				const handler = osOperationHandlers[operation];
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

				// Prepare parameters for the operation
				const params: OsOperationParams = {
					name: this.getNodeParameter('name', i) as string,
				};

				const data = this.getNodeParameter('data', i, '') as string;
				if (data != '') {
					params.data = new TextEncoder().encode(data);
				}

				try {
					let result = await handler.execute(os, params);

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
