import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { jetstreamManager, ConsumerConfig } from '../../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { NodeLogger } from '../../utils/NodeLogger';
import { consumerOperationHandlers, ConsumerOperationParams } from './operations';

export class NatsConsumerManager implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Consumer Manager',
		name: 'natsConsumerManager',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Manage NATS JetStream consumers',
		subtitle:
			'{{$parameter["operation"]}} - {{$parameter["streamName"]}} - {{$parameter["consumerName"]}}',
		defaults: {
			name: 'NATS Consumer Manager',
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
						description: 'Create a new JetStream consumer',
						action: 'Create a new jet stream consumer',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a JetStream consumer',
						action: 'Delete a jet stream consumer',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get information about a consumer',
						action: 'Get information about a consumer',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all consumers for a stream',
						action: 'List all consumers for a stream',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Stream Name',
				name: 'streamName',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'ORDERS',
				description: 'Name of the JetStream stream',
				hint: 'Stream must already exist',
			},
			{
				displayName: 'Consumer Name',
				name: 'consumerName',
				type: 'string',
				default: '',
				placeholder: 'my-consumer',
				description: 'Name of the JetStream consumer',
				displayOptions: {
					show: {
						operation: ['get', 'delete'],
					},
				},
			},
			{
				displayName: 'Consumer Config',
				name: 'consumerConfig',
				type: 'collection',
				placeholder: 'Add Consumer Config',
				default: {},
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Acknowledgment Policy',
						name: 'ack_policy',
						type: 'options',
						options: [
							{
								name: 'Explicit',
								value: 'explicit',
								description: 'Messages must be explicitly acknowledged',
							},
							{
								name: 'All',
								value: 'all',
								description: 'Acknowledging a message acknowledges all previous',
							},
							{
								name: 'None',
								value: 'none',
								description: 'No acknowledgment required',
							},
						],
						default: 'explicit',
						description: 'The type of acknowledgment required by the Consumer',
					},
					{
						displayName: 'Delivery Policy',
						name: 'deliver_policy',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
								description: 'Deliver all messages in the stream',
							},
							{
								name: 'By Start Sequence',
								value: 'by_start_sequence',
								description: 'Start from a specific sequence number',
							},
							{
								name: 'By Start Time',
								value: 'by_start_time',
								description: 'Start from a specific time',
							},
							{
								name: 'Last',
								value: 'last',
								description: 'Deliver only the last message',
							},
							{
								name: 'Last Per Subject',
								value: 'last_per_subject',
								description: 'Deliver the last message for each subject',
							},
							{
								name: 'New',
								value: 'new',
								description: 'Deliver only new messages (default)',
							},
						],
						default: 'new',
						description: 'Where to start consuming messages on the stream',
					},
					{
						displayName: 'Durable Name',
						name: 'durable_name',
						type: 'string',
						default: '',
						placeholder: 'order-processor',
						description: 'A unique name for a durable consumer',
						hint: 'Consumer names should contain no spaces or dots',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						placeholder: 'order-processor',
						description: 'The consumer name',
						hint: 'Consumer names should contain no spaces or dots',
					},
					{
						displayName: 'Start Sequence',
						name: 'opt_start_seq',
						type: 'number',
						default: '',
						description: 'The sequence from which to start delivery messages',
					},
					{
						displayName: 'Start Time',
						name: 'opt_start_time',
						type: 'string',
						default: '',
						description: 'The date time from which to start delivering messages',
					},
					{
						displayName: 'Description',
						name: 'description',
						description: 'A short description of the purpose of this consume',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Ack Wait',
						name: 'ack_wait',
						description:
							'How long (in nanoseconds) to allow messages to remain un-acknowledged before attempting redelivery',
						type: 'number',
						default: '',
					},
					{
						displayName: 'Max Deliver',
						name: 'max_deliver',
						description:
							'The maximum number of times a message will be delivered to consumers if not acknowledged in time',
						type: 'number',
						default: -1,
					},
					{
						displayName: 'Max Ack Pending',
						name: 'max_ack_pending',
						description:
							'The maximum number of messages without acknowledgement that can be outstanding, once this limit is reached message delivery will be suspended',
						type: 'number',
						default: '',
					},
					{
						displayName: 'Max Waiting',
						name: 'max_waiting',
						description:
							'The number of pulls that can be outstanding on a pull consumer, pulls received after this is reached are ignored',
						type: 'number',
						default: '',
					},
					{
						displayName: 'Replicas',
						name: 'num_replicas',
						description:
							'When set do not inherit the replica count from the stream but specifically set it to this amount',
						type: 'number',
						default: '',
					},
					{
						displayName: 'Filter Subject',
						name: 'filter_subject',
						description: 'Deliver only messages that match the subject filter',
						type: 'string',
						default: '',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('natsApi');

		// Create NodeLogger once for the entire execution
		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		let nc;
		try {
			nc = await createNatsConnection(credentials, nodeLogger);
			const jsm = await jetstreamManager(nc);

			for (let i = 0; i < items.length; i++) {
				const operation = this.getNodeParameter('operation', i) as string;

				// Get the handler for this operation
				const handler = consumerOperationHandlers[operation];
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
				const params: ConsumerOperationParams = {
					streamName: this.getNodeParameter('streamName', i) as string,
					consumerConfig: this.getNodeParameter('consumerConfig', i, {}) as ConsumerConfig,
				};

				try {
					let result = await handler.execute(jsm, params);

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

			return [returnData];
		} finally {
			if (nc) {
				await closeNatsConnection(nc!, nodeLogger);
			}
		}
	}
}
