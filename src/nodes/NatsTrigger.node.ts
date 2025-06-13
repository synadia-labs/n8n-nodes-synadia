import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	IDataObject,
	ApplicationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, Subscription, consumerOpts } from 'nats';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { parseNatsMessage, validateSubject } from '../utils/NatsHelpers';

export class NatsTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Trigger',
		name: 'natsTrigger',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Trigger workflows on NATS messages',
		subtitle: '={{$parameter["subject"]}}',
		defaults: {
			name: 'NATS Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'natsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Subscription Type',
				name: 'subscriptionType',
				type: 'options',
				options: [
					{
						name: 'Core NATS',
						value: 'core',
						description: 'Subscribe to regular NATS subjects',
					},
					{
						name: 'JetStream',
						value: 'jetstream',
						description: 'Subscribe using JetStream consumers',
					},
				],
				default: 'core',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'orders.>',
				description: 'The subject to subscribe to. Supports wildcards (* and >).',
			},
			{
				displayName: 'Queue Group',
				name: 'queueGroup',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						subscriptionType: ['core'],
					},
				},
				description: 'Optional queue group for load balancing',
			},
			{
				displayName: 'Stream Name',
				name: 'streamName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						subscriptionType: ['jetstream'],
					},
				},
				description: 'JetStream stream to consume from',
			},
			{
				displayName: 'Consumer Type',
				name: 'consumerType',
				type: 'options',
				displayOptions: {
					show: {
						subscriptionType: ['jetstream'],
					},
				},
				options: [
					{
						name: 'Ephemeral',
						value: 'ephemeral',
						description: 'Create temporary consumer',
					},
					{
						name: 'Durable',
						value: 'durable',
						description: 'Use existing durable consumer',
					},
				],
				default: 'ephemeral',
			},
			{
				displayName: 'Consumer Name',
				name: 'consumerName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						subscriptionType: ['jetstream'],
						consumerType: ['durable'],
					},
				},
				required: true,
				description: 'Name of the durable consumer',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Deliver Policy',
						name: 'deliverPolicy',
						type: 'options',
						displayOptions: {
							show: {
								'/subscriptionType': ['jetstream'],
								'/consumerType': ['ephemeral'],
							},
						},
						options: [
							{
								name: 'All',
								value: 'all',
								description: 'Deliver all messages',
							},
							{
								name: 'By Start Sequence',
								value: 'startSequence',
								description: 'Start at specific sequence',
							},
							{
								name: 'By Start Time',
								value: 'startTime',
								description: 'Start at specific time',
							},
							{
								name: 'Last',
								value: 'last',
								description: 'Start with last message',
							},
							{
								name: 'New',
								value: 'new',
								description: 'Only new messages',
							},
						],
						default: 'new',
					},
					{
						displayName: 'Start Sequence',
						name: 'startSequence',
						type: 'number',
						displayOptions: {
							show: {
								'/subscriptionType': ['jetstream'],
								deliverPolicy: ['startSequence'],
							},
						},
						default: 1,
						description: 'Sequence number to start from',
					},
					{
						displayName: 'Start Time',
						name: 'startTime',
						type: 'dateTime',
						displayOptions: {
							show: {
								'/subscriptionType': ['jetstream'],
								deliverPolicy: ['startTime'],
							},
						},
						default: '',
						description: 'Time to start from',
					},
					{
						displayName: 'Ack Wait (Ms)',
						name: 'ackWait',
						type: 'number',
						displayOptions: {
							show: {
								'/subscriptionType': ['jetstream'],
							},
						},
						default: 30000,
						description: 'Time to wait for message acknowledgment',
					},
					{
						displayName: 'Max Deliver',
						name: 'maxDeliver',
						type: 'number',
						displayOptions: {
							show: {
								'/subscriptionType': ['jetstream'],
							},
						},
						default: -1,
						description: 'Maximum delivery attempts (-1 for unlimited)',
					},
					{
						displayName: 'Manual Ack',
						name: 'manualAck',
						type: 'boolean',
						displayOptions: {
							show: {
								'/subscriptionType': ['jetstream'],
							},
						},
						default: false,
						description: 'Whether to manually acknowledge messages',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const subscriptionType = this.getNodeParameter('subscriptionType') as string;
		const subject = this.getNodeParameter('subject') as string;

		// Validate subject
		validateSubject(subject);

		let nc: NatsConnection;
		let subscription: Subscription;

		const closeFunction = async () => {
			if (subscription) {
				await subscription.drain();
			}
			if (nc) {
				await closeNatsConnection(nc);
			}
		};

		const manualTriggerFunction = async () => {
			// Provide sample data for testing
			const streamName = subscriptionType === 'jetstream' 
				? (this.getNodeParameter('streamName', '') as string) || 'SAMPLE_STREAM'
				: '';
			
			const sampleData = subscriptionType === 'jetstream' 
				? {
					subject,
					data: { 
						orderId: 'ORD-12345',
						customerName: 'John Doe',
						amount: 99.99,
						status: 'confirmed'
					},
					headers: {
						'Nats-Msg-Id': 'sample-msg-123',
						'Nats-Stream': streamName,
						'Nats-Sequence': '42'
					},
					seq: 42,
					timestamp: new Date().toISOString(),
				}
				: {
					subject,
					data: {
						message: 'Sample NATS message',
						timestamp: Date.now(),
						source: 'manual-trigger'
					},
					headers: {
						'X-Sample-Header': 'sample-value'
					},
					timestamp: new Date().toISOString(),
				};
			
			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};

		try {
			nc = await createNatsConnection(credentials, this);

			if (subscriptionType === 'core') {
				// Core NATS subscription
				const queueGroup = this.getNodeParameter('queueGroup', '') as string;
				
				const subOptions: any = {};
				if (queueGroup) {
					subOptions.queue = queueGroup;
				}

				subscription = nc.subscribe(subject, subOptions);

				(async () => {
					for await (const msg of subscription) {
						this.emit([[parseNatsMessage(msg)]]);
					}
				})();

			} else {
				// JetStream subscription
				const js = nc.jetstream();
				const streamName = this.getNodeParameter('streamName') as string;
				const consumerType = this.getNodeParameter('consumerType') as string;
				const options = this.getNodeParameter('options', {}) as IDataObject;

				if (consumerType === 'durable') {
					// Use existing durable consumer
					const consumerName = this.getNodeParameter('consumerName') as string;
					const consumer = await js.consumers.get(streamName, consumerName);
					
					const messages = await consumer.consume();
					(async () => {
						for await (const msg of messages) {
							this.emit([[parseNatsMessage(msg as any)]]);
							if (!options.manualAck) {
								msg.ack();
							}
						}
					})();

				} else {
					// Create ephemeral consumer
					const opts = consumerOpts();
					
					// Configure delivery policy
					switch (options.deliverPolicy) {
						case 'all':
							opts.deliverAll();
							break;
						case 'last':
							opts.deliverLast();
							break;
						case 'new':
							opts.deliverNew();
							break;
						case 'startSequence':
							opts.startSequence(options.startSequence as number);
							break;
						case 'startTime':
							opts.startTime(new Date(options.startTime as string));
							break;
					}

					if (options.ackWait) {
						opts.ackWait(options.ackWait as number);
					}

					if (options.maxDeliver) {
						opts.maxDeliver(options.maxDeliver as number);
					}

					if (options.manualAck) {
						opts.manualAck();
					}

					const sub = await js.subscribe(subject, opts);
					
					(async () => {
						for await (const msg of sub) {
							this.emit([[parseNatsMessage(msg as any)]]);
							if (!options.manualAck) {
								msg.ack();
							}
						}
					})();

					subscription = sub as any;
				}
			}

			return {
				closeFunction,
				manualTriggerFunction,
			};

		} catch (error: any) {
			throw new ApplicationError(`Failed to setup NATS trigger: ${error.message}`);
		}
	}
}