import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { jetstreamManager } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { validateStreamName, validateConsumerName, validateNumberRange } from '../utils/ValidationHelpers';
import { validateSubject } from '../utils/NatsHelpers';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsConsumerManager implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Consumer Manager',
		name: 'natsConsumerManager',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Manage NATS JetStream consumers',
		subtitle: '{{$parameter["operation"]}} - {{$parameter["streamName"]}} - {{$parameter["consumerName"]}}',
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
						name: 'Create Consumer',
						value: 'createConsumer',
						description: 'Create a new JetStream consumer',
						action: 'Create a new JetStream consumer',
					},
					{
						name: 'Delete Consumer',
						value: 'deleteConsumer',
						description: 'Delete a JetStream consumer',
						action: 'Delete a JetStream consumer',
					},
					{
						name: 'Get Info',
						value: 'getInfo',
						description: 'Get information about a consumer',
						action: 'Get information about a consumer',
					},
					{
						name: 'List Consumers',
						value: 'listConsumers',
						description: 'List all consumers for a stream',
						action: 'List all consumers for a stream',
					},
				],
				default: 'getInfo',
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
				required: true,
				placeholder: 'order-processor',
				description: 'Name of the consumer',
				hint: 'Consumer names should contain no spaces or dots',
				displayOptions: {
					hide: {
						operation: ['listConsumers'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['createConsumer'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the consumer',
						placeholder: 'Order processing consumer',
					},
					{
						displayName: 'Delivery Policy',
						name: 'deliverPolicy',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
								description: 'Deliver all messages in the stream',
							},
							{
								name: 'Last',
								value: 'last',
								description: 'Deliver only the last message',
							},
							{
								name: 'New',
								value: 'new',
								description: 'Deliver only new messages (default)',
							},
							{
								name: 'By Start Sequence',
								value: 'byStartSequence',
								description: 'Start from a specific sequence number',
							},
							{
								name: 'By Start Time',
								value: 'byStartTime',
								description: 'Start from a specific time',
							},
							{
								name: 'Last Per Subject',
								value: 'lastPerSubject',
								description: 'Deliver the last message for each subject',
							},
						],
						default: 'new',
						description: 'Policy for which messages to deliver',
					},
					{
						displayName: 'Acknowledgment Policy',
						name: 'ackPolicy',
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
						description: 'Policy for message acknowledgment',
					},
					{
						displayName: 'Replay Policy',
						name: 'replayPolicy',
						type: 'options',
						options: [
							{
								name: 'Instant',
								value: 'instant',
								description: 'Replay messages as fast as possible',
							},
							{
								name: 'Original',
								value: 'original',
								description: 'Replay messages at original timing',
							},
						],
						default: 'instant',
						description: 'Policy for replaying messages',
					},
					{
						displayName: 'Filter Subject',
						name: 'filterSubject',
						type: 'string',
						default: '',
						description: 'Only deliver messages matching this subject filter',
						placeholder: 'orders.new',
						hint: 'Leave empty to receive all subjects from the stream',
					},
					{
						displayName: 'Start Sequence',
						name: 'startSequence',
						type: 'number',
						default: 0,
						description: 'Sequence number to start from (for By Start Sequence policy)',
						displayOptions: {
							show: {
								deliverPolicy: ['byStartSequence'],
							},
						},
					},
					{
						displayName: 'Start Time',
						name: 'startTime',
						type: 'string',
						default: '',
						description: 'ISO timestamp to start from (for By Start Time policy)',
						placeholder: '2023-01-01T00:00:00Z',
						displayOptions: {
							show: {
								deliverPolicy: ['byStartTime'],
							},
						},
					},
					{
						displayName: 'Max Deliver',
						name: 'maxDeliver',
						type: 'number',
						default: -1,
						description: 'Maximum number of delivery attempts (-1 = unlimited)',
					},
					{
						displayName: 'Acknowledgment Wait (Seconds)',
						name: 'ackWait',
						type: 'number',
						default: 30,
						description: 'How long to wait for acknowledgment before redelivery',
					},
					{
						displayName: 'Max Waiting',
						name: 'maxWaiting',
						type: 'number',
						default: 512,
						description: 'Maximum number of outstanding acknowledgments',
					},
					{
						displayName: 'Max Ack Pending',
						name: 'maxAckPending',
						type: 'number',
						default: 1000,
						description: 'Maximum number of pending acknowledgments',
					},
					{
						displayName: 'Idle Heartbeat (Seconds)',
						name: 'idleHeartbeat',
						type: 'number',
						default: 0,
						description: 'Interval for idle heartbeats (0 = disabled)',
					},
					{
						displayName: 'Flow Control',
						name: 'flowControl',
						type: 'boolean',
						default: false,
						description: 'Enable flow control for the consumer',
					},
					{
						displayName: 'Headers Only',
						name: 'headersOnly',
						type: 'boolean',
						default: false,
						description: 'Deliver only headers, not message bodies',
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
			const jsm = await jetstreamManager(nc);
			
			for (let i = 0; i < items.length; i++) {
				try {
					const operation = this.getNodeParameter('operation', i) as string;
					const streamName = this.getNodeParameter('streamName', i) as string;
					let result: any = {};
					
					// Validate stream name
					validateStreamName(streamName);
					
					switch (operation) {
						case 'createConsumer':
							const consumerName = this.getNodeParameter('consumerName', i) as string;
							const options = this.getNodeParameter('options', i, {}) as any;
							
							// Validate consumer name
							validateConsumerName(consumerName);
							
							// Validate options
							if (options.filterSubject) {
								validateSubject(options.filterSubject);
							}
							if (options.startSequence && options.startSequence < 0) {
								throw new NodeOperationError(this.getNode(), 'Start sequence must be non-negative', { itemIndex: i });
							}
							if (options.maxDeliver && options.maxDeliver < -1) {
								throw new NodeOperationError(this.getNode(), 'Max deliver must be -1 or positive', { itemIndex: i });
							}
							if (options.ackWait && options.ackWait <= 0) {
								throw new NodeOperationError(this.getNode(), 'Ack wait must be positive', { itemIndex: i });
							}
							if (options.maxWaiting) {
								validateNumberRange(options.maxWaiting, 1, Number.MAX_SAFE_INTEGER, 'Max waiting');
							}
							if (options.maxAckPending) {
								validateNumberRange(options.maxAckPending, 1, Number.MAX_SAFE_INTEGER, 'Max ack pending');
							}
							
							const consumerConfig: any = {
								durable_name: consumerName,
							};
							
							if (options.description) consumerConfig.description = options.description;
							if (options.deliverPolicy) {
								switch (options.deliverPolicy) {
									case 'all':
										consumerConfig.deliver_policy = 'all';
										break;
									case 'last':
										consumerConfig.deliver_policy = 'last';
										break;
									case 'new':
										consumerConfig.deliver_policy = 'new';
										break;
									case 'byStartSequence':
										consumerConfig.deliver_policy = 'by_start_sequence';
										consumerConfig.opt_start_seq = options.startSequence || 1;
										break;
									case 'byStartTime':
										consumerConfig.deliver_policy = 'by_start_time';
										if (options.startTime) {
											consumerConfig.opt_start_time = options.startTime;
										}
										break;
									case 'lastPerSubject':
										consumerConfig.deliver_policy = 'last_per_subject';
										break;
								}
							}
							if (options.ackPolicy) consumerConfig.ack_policy = options.ackPolicy;
							if (options.replayPolicy) consumerConfig.replay_policy = options.replayPolicy;
							if (options.filterSubject) consumerConfig.filter_subject = options.filterSubject;
							if (options.maxDeliver && options.maxDeliver > 0) consumerConfig.max_deliver = options.maxDeliver;
							if (options.ackWait) consumerConfig.ack_wait = options.ackWait * 1000000000; // Convert to nanoseconds
							if (options.maxWaiting) consumerConfig.max_waiting = options.maxWaiting;
							if (options.maxAckPending) consumerConfig.max_ack_pending = options.maxAckPending;
							if (options.idleHeartbeat) consumerConfig.idle_heartbeat = options.idleHeartbeat * 1000000000;
							if (options.flowControl) consumerConfig.flow_control = options.flowControl;
							if (options.headersOnly) consumerConfig.headers_only = options.headersOnly;
							
							const consumer = await jsm.consumers.add(streamName, consumerConfig);
							result = {
								success: true,
								operation: 'createConsumer',
								streamName,
								consumerName,
								info: consumer,
							};
							break;
							
						case 'deleteConsumer':
							const deleteConsumerName = this.getNodeParameter('consumerName', i) as string;
							validateConsumerName(deleteConsumerName);
							
							const deleted = await jsm.consumers.delete(streamName, deleteConsumerName);
							result = {
								success: deleted,
								operation: 'deleteConsumer',
								streamName,
								consumerName: deleteConsumerName,
							};
							break;
							
						case 'getInfo':
							const infoConsumerName = this.getNodeParameter('consumerName', i) as string;
							validateConsumerName(infoConsumerName);
							
							const info = await jsm.consumers.info(streamName, infoConsumerName);
							result = {
								success: true,
								operation: 'getInfo',
								streamName,
								consumerName: infoConsumerName,
								info,
							};
							break;
							
						case 'listConsumers':
							const consumers = [];
							for await (const consumer of jsm.consumers.list(streamName)) {
								consumers.push(consumer);
							}
							result = {
								success: true,
								operation: 'listConsumers',
								streamName,
								consumers,
								count: consumers.length,
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
								streamName: this.getNodeParameter('streamName', i) as string,
								consumerName: this.getNodeParameter('consumerName', i, '') as string,
							},
							pairedItem: { item: i },
						});
					} else {
						throw error;
					}
				}
			}
			
		} catch (error: any) {
			throw new NodeOperationError(this.getNode(), `NATS Consumer Manager failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
		}
		
		return [returnData];
	}
}