import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { Kvm } from '../../bundled/nats-bundled';
import { closeNatsConnection, createNatsConnection } from '../../utils/NatsConnection';
import { NodeLogger } from '../../utils/NodeLogger';
import { kvOperationHandlers, KvOperationParams } from './operations';

export class NatsKv implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS KV Store',
		name: 'natsKv',
		icon: 'file:../../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with NATS JetStream Key-Value Store',
		subtitle: '{{$parameter["operation"]}} - {{$parameter["bucket"]}}',
		defaults: {
			name: 'NATS KV Store',
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

				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a value from a KV bucket',
						action: 'Get a value from a KV bucket',
					},
					{
						name: 'History',
						value: 'history',
						description: 'Get history for a key',
						action: 'Get history for a key',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all keys in a KV bucket',
						action: 'List all keys in a KV bucket',
					},
					{
						name: 'Put',
						value: 'put',
						description: 'Put a value into a KV bucket',
						action: 'Put a value into a KV bucket',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a key from a KV bucket',
						action: 'Delete a key from a KV bucket',
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
				description:
					'The name of the KV bucket to operate on. Must contain only letters, numbers, underscores, and hyphens (no spaces or dots).',
				hint: 'Example: user-preferences, app-config, cache-data',
			},
			{
				displayName: 'Key',
				name: 'key',
				// eslint-disable-next-line n8n-nodes-base/cred-class-field-type-options-password-missing
				type: 'string',
				default: '',
				required: true,
				placeholder: 'user.123.settings',
				description:
					'The key to operate on. Can use dots for hierarchical organization (e.g., "user.123.settings"). Cannot contain spaces.',
				hint: 'Example: config.database.host, user.profile.avatar, session.abc123',
			},
			{
				displayName: 'Value',
				name: 'value',
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
				description: 'The value to store in the KV bucket',
				placeholder: '{"name": "John", "age": 30}',
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
			const kvm = new Kvm(nc);

			for (let i = 0; i < items.length; i++) {
				const operation = this.getNodeParameter('operation', i) as string;
				const bucket = this.getNodeParameter('bucket', i) as string;

				// Get the KV bucket
				const kv = await kvm.open(bucket);

				// Get the handler for this operation
				const handler = kvOperationHandlers[operation];
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

				// Prepare parameters based on operation requirements
				const params: KvOperationParams = {
					key: this.getNodeParameter('key', i) as any,
					value: this.getNodeParameter('value', i, {}) as string,
				};

				try {
					let result = await handler.execute(kv, params);

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
