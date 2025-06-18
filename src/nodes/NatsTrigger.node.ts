import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	IDataObject,
	ApplicationError,
	NodeConnectionType,
	INodeExecutionData,
} from 'n8n-workflow';
import { NatsConnection, Subscription, consumerOpts, Msg, jetstream } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { parseNatsMessage, validateSubject } from '../utils/NatsHelpers';
import { createReplyHandler, ManualReplyHandler } from '../utils/reply';
import { validateQueueGroup, validateStreamName, validateConsumerName, validateTimeout } from '../utils/ValidationHelpers';

export class NatsTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Trigger',
		name: 'natsTrigger',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Start workflows when messages arrive on NATS subjects',
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
						description: 'Fast, at-most-once message delivery',
					},
					{
						name: 'JetStream',
						value: 'jetstream',
						description: 'Reliable, exactly-once message delivery with replay',
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
				description: 'Subject pattern to subscribe to (no spaces allowed)',
				hint: 'Use * for single token wildcard, > for multi-token wildcard',
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
				description: 'Group name for load balancing multiple subscribers',
				placeholder: 'order-processors',
				hint: 'Only one subscriber in the group receives each message',
			},
			{
				displayName: 'Reply Mode',
				name: 'replyMode',
				type: 'options',
				options: [
					{
						name: 'Disabled',
						value: 'disabled',
						description: 'No reply functionality (default behavior)',
					},
					{
						name: 'Manual',
						value: 'manual',
						description: 'Store messages and reply after workflow completes',
					},
					{
						name: 'Automatic',
						value: 'automatic',
						description: 'Reply immediately with template-based response',
					},
				],
				default: 'disabled',
				description: 'How to respond to request/reply messages',
				hint: 'Only affects messages with a reply-to subject',
			},
			{
				displayName: 'Reply Options',
				name: 'replyOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						replyMode: ['manual'],
					},
				},
				options: [
					{
						displayName: 'Reply Field',
						name: 'replyField',
						type: 'string',
						default: 'reply',
						description: 'Output field containing the response data',
						placeholder: 'response',
						hint: 'If missing, entire output (minus internal fields) is sent',
					},
					{
						displayName: 'Include Request',
						name: 'includeRequest',
						type: 'boolean',
						default: false,
						description: 'Whether to wrap response with original request data',
						hint: 'Response format: {request: {...}, response: {...}}',
					},
					{
						displayName: 'Default Reply',
						name: 'defaultReply',
						type: 'json',
						default: '{"success": true}',
						description: 'Fallback response when output is empty',
						placeholder: '{"success": true, "message": "Processed"}',
					},
					{
						displayName: 'Reply Encoding',
						name: 'replyEncoding',
						type: 'options',
						options: [
							{
								name: 'JSON',
								value: 'json',
								description: 'Encode reply as JSON',
							},
							{
								name: 'String',
								value: 'string',
								description: 'Send as plain string',
							},
							{
								name: 'Binary',
								value: 'binary',
								description: 'Send as binary data',
							},
						],
						default: 'json',
					},
				],
			},
			{
				displayName: 'Automatic Reply',
				name: 'automaticReply',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						replyMode: ['automatic'],
					},
				},
				options: [
					{
						displayName: 'Response Template',
						name: 'responseTemplate',
						type: 'json',
						default: '{\n  "success": true,\n  "message": "Request processed",\n  "timestamp": "{{new Date().toISOString()}}",\n  "echo": "{{$json.data}}"\n}',
						description: 'Response template with access to request data',
						hint: 'Use {{$json.data}} for request data, {{new Date().toISOString()}} for timestamp',
					},
					{
						displayName: 'Response Encoding',
						name: 'responseEncoding',
						type: 'options',
						options: [
							{
								name: 'JSON',
								value: 'json',
								description: 'Send response as JSON',
							},
							{
								name: 'String',
								value: 'string',
								description: 'Send response as plain string',
							},
						],
						default: 'json',
					},
					{
						displayName: 'Include Request In Output',
						name: 'includeRequestInOutput',
						type: 'boolean',
						default: true,
						description: 'Whether to pass request data to workflow (for debugging/logging)',
						hint: 'Response is still sent automatically',
					},
					{
						displayName: 'Error Response',
						name: 'errorResponse',
						type: 'json',
						default: '{"success": false, "error": "An error occurred processing the request"}',
						description: 'Fallback response for template errors',
						placeholder: '{"success": false, "error": "Processing failed"}',
					},
				],
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
				description: 'Name of the JetStream stream (no spaces or dots)',
				placeholder: 'ORDERS',
				hint: 'Stream must exist and contain the specified subject',
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
						description: 'Create temporary consumer that disappears when disconnected',
					},
					{
						name: 'Durable',
						value: 'durable',
						description: 'Connect to existing consumer that persists across restarts',
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
				description: 'Existing consumer name (no spaces or dots)',
				placeholder: 'order-processor',
				hint: 'Consumer must already exist on the stream',
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
						description: 'Time to wait for acknowledgment before redelivery (milliseconds)',
						hint: 'Message will be redelivered if not acknowledged in time',
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
						description: 'Maximum delivery attempts before giving up',
						hint: 'Use -1 for unlimited attempts',
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
						description: 'Whether to require explicit acknowledgment in workflow',
						hint: 'Messages remain pending until acknowledged',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const subscriptionType = this.getNodeParameter('subscriptionType') as string;
		const subject = this.getNodeParameter('subject') as string;
		const replyMode = this.getNodeParameter('replyMode', 'disabled') as string;
		const replyOptions = this.getNodeParameter('replyOptions', {}) as IDataObject;
		const automaticReply = this.getNodeParameter('automaticReply', {}) as IDataObject;

		// Validate subject
		validateSubject(subject);

		let nc: NatsConnection;
		let subscription: Subscription;
		const replyHandler = createReplyHandler(replyMode);

		const closeFunction = async () => {
			if (subscription) {
				await subscription.drain();
			}
			if (nc) {
				await closeNatsConnection(nc);
			}
			if (replyHandler.cleanup) {
				replyHandler.cleanup();
			}
		};

		// Helper function to process messages based on reply mode
		const processMessage = async (msg: Msg) => {
			const parsedMessage = parseNatsMessage(msg);
			
			// Process message with reply handler
			await replyHandler.processMessage({
				msg,
				parsedMessage,
				automaticReply,
				replyOptions,
			});
			
			this.emit([[parsedMessage]]);
		};
		
		// Manual reply function (for manual mode)
		const manualReplyFunction = async () => {
			if (replyMode !== 'manual' || !(replyHandler instanceof ManualReplyHandler)) {
				return;
			}
			
			// Get the output items
			const items = (this as any).getInputData() as INodeExecutionData[];
			
			// Send replies using the handler
			await (replyHandler as ManualReplyHandler).sendReply(items, replyOptions, this.logger);
		};

		const manualTriggerFunction = async () => {
			// Provide sample data for testing
			const streamName = subscriptionType === 'jetstream' 
				? (this.getNodeParameter('streamName', '') as string) || 'SAMPLE_STREAM'
				: '';
			
			let sampleData: any = subscriptionType === 'jetstream' 
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
			
			// Add reply-specific fields based on mode
			if (replyMode !== 'disabled') {
				sampleData.replyTo = '_INBOX.sample.reply';
				
				if (replyMode === 'manual') {
					sampleData.requestId = 'sample-request-id';
				} else if (replyMode === 'automatic') {
					// Show what automatic reply would send
					const template = automaticReply.responseTemplate as string || '{"success": true}';
					try {
						const processedTemplate = template
							.replace(/\{\{new Date\(\)\.toISOString\(\)\}\}/g, new Date().toISOString())
							.replace(/\{\{\$json\.data\}\}/g, JSON.stringify(sampleData.data));
						sampleData.sentResponse = JSON.parse(processedTemplate);
					} catch {
						sampleData.sentResponse = { success: true };
					}
				}
			}
			
			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};

		try {
			nc = await createNatsConnection(credentials, this);

			if (subscriptionType === 'core') {
				// Core NATS subscription
				const queueGroup = this.getNodeParameter('queueGroup', '') as string;
				
				// Validate queue group if specified
				if (queueGroup) {
					validateQueueGroup(queueGroup);
				}
				
				const subOptions: any = {};
				if (queueGroup) {
					subOptions.queue = queueGroup;
				}

				subscription = nc.subscribe(subject, subOptions);

				(async () => {
					for await (const msg of subscription) {
						await processMessage(msg);
					}
				})();

			} else {
				// JetStream subscription
				const js = jetstream(nc);
				const streamName = this.getNodeParameter('streamName') as string;
				const consumerType = this.getNodeParameter('consumerType') as string;
				const options = this.getNodeParameter('options', {}) as IDataObject;
				
				// Validate stream name
				validateStreamName(streamName);
				
				// Validate ack wait timeout if specified
				if (options.ackWait) {
					validateTimeout(options.ackWait as number, 'Ack Wait');
				}

				if (consumerType === 'durable') {
					// Use existing durable consumer
					const consumerName = this.getNodeParameter('consumerName') as string;
					
					// Validate consumer name
					validateConsumerName(consumerName);
					const consumer = await js.consumers.get(streamName, consumerName);
					
					const messages = await consumer.consume();
					(async () => {
						for await (const msg of messages) {
							await processMessage(msg as any);
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

					// For now, cast to any to work around API differences
					const sub = await (js as any).subscribe(subject, opts);
					
					(async () => {
						for await (const msg of sub) {
							await processMessage(msg as any);
							if (!options.manualAck) {
								msg.ack();
							}
						}
					})();

					subscription = sub as any;
				}
			}

			const response: ITriggerResponse = {
				closeFunction,
				manualTriggerFunction,
			};
			
			// Add manual reply function if in manual mode
			if (replyMode === 'manual') {
				(response as any).manualReplyFunction = manualReplyFunction;
			}
			
			return response;

		} catch (error: any) {
			throw new ApplicationError(`Failed to setup NATS trigger: ${error.message}`);
		}
	}
}