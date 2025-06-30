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
import { validateBucketName, validateObjectName } from '../utils/ValidationHelpers';
import { NodeLogger } from '../utils/NodeLogger';

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
				hint: 'Provide the data as you want it stored - string, JSON, or binary data',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								'/operation': ['put'],
							},
						},
						description: 'Human-readable description for the object',
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
				],
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
			const js = jetstream(nc);
			
			for (let i = 0; i < items.length; i++) {
				try {
					const operation = this.getNodeParameter('operation', i) as string;
					const bucket = this.getNodeParameter('bucket', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					// Validate bucket name
					validateBucketName(bucket);
					
					// Only allow object operations, not bucket operations
					const supportedOperations = ['put', 'get', 'delete', 'info', 'list'];
					if (!supportedOperations.includes(operation)) {
						throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}. Use NATS Object Store Manager for bucket operations.`, { itemIndex: i });
					}
					
					const handler = objectStoreOperationHandlers[operation];
					
					if (!handler) {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
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
					if (['put', 'get', 'delete', 'info'].includes(operation) && params.name) {
						validateObjectName(params.name);
					}
					
					
					// All operations need ObjectStore (no bucket operations here)
					const objManager = new Objm(js);
					const os = await objManager.open(bucket);
					const result = await handler.execute(os, params);
					
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
				await closeNatsConnection(nc, nodeLogger);
			}
		}
		
		return [returnData];
	}
}