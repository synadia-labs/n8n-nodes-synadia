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
import { NatsConnection, Msg, jetstream, jetstreamManager } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { parseNatsMessage, validateSubject } from '../utils/NatsHelpers';
import { createReplyHandler, ManualReplyHandler } from '../utils/reply';
import { validateStreamName, validateConsumerName, validateTimeout } from '../utils/ValidationHelpers';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsStreamConsumer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Stream Consumer',
		name: 'natsStreamConsumer',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Consume messages from NATS JetStream streams with guaranteed delivery',
		subtitle: '{{$parameter["streamName"]}} - {{$parameter["subject"]}}',
		defaults: {
			name: 'NATS Stream Consumer',
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
				displayName: 'Stream Name',
				name: 'streamName',
				type: 'string',
				default: '',
				required: true,
				description: 'Name of the JetStream stream (no spaces or dots)',
				placeholder: 'ORDERS',
				hint: 'Stream must exist and contain the specified subject',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'orders.>',
				description: 'Subject pattern to consume from (no spaces allowed)',
				hint: 'Use * for single token wildcard, > for multi-token wildcard',
			},
			{
				displayName: 'Consumer Type',
				name: 'consumerType',
				type: 'options',
				options: [
					{
						name: 'Ephemeral',
						value: 'ephemeral',
						description: 'Temporary consumer, deleted when connection closes',
					},
					{
						name: 'Durable',
						value: 'durable',
						description: 'Persistent consumer, maintains state across restarts',
					},
				],
				default: 'ephemeral',
				description: 'Type of JetStream consumer to use',
			},
			{
				displayName: 'Consumer Name',
				name: 'consumerName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						consumerType: ['durable'],
					},
				},
				required: true,
				description: 'Existing consumer name (no spaces or dots)',
				placeholder: 'order-processor',
				hint: 'Consumer must already exist in the stream',
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
						displayName: 'Include Request In Output',
						name: 'includeRequestInOutput',
						type: 'boolean',
						default: true,
						description: 'Whether to pass request data to workflow (for debugging/logging)',
						hint: 'Response is still sent automatically',
					},
				],
			},
			{
				displayName: 'Consumer Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Delivery Policy',
						name: 'deliverPolicy',
						type: 'options',
						displayOptions: {
							show: {
								'/consumerType': ['ephemeral'],
							},
						},
						options: [
							{
								name: 'All',
								value: 'all',
								description: 'Deliver all messages from the beginning',
							},
							{
								name: 'Last',
								value: 'last',
								description: 'Deliver only the last message',
							},
							{
								name: 'New',
								value: 'new',
								description: 'Deliver only new messages',
							},
							{
								name: 'Start from Sequence',
								value: 'startSequence',
								description: 'Start from specific sequence number',
							},
							{
								name: 'Start from Time',
								value: 'startTime',
								description: 'Start from specific timestamp',
							},
						],
						default: 'new',
						description: 'Where to start message delivery from',
						hint: 'Determines which messages the consumer will receive',
					},
					{
						displayName: 'Start Sequence',
						name: 'startSequence',
						type: 'number',
						displayOptions: {
							show: {
								deliverPolicy: ['startSequence'],
							},
						},
						default: 1,
						description: 'Sequence number to start from',
						hint: 'Must be a valid sequence in the stream',
					},
					{
						displayName: 'Start Time',
						name: 'startTime',
						type: 'string',
						displayOptions: {
							show: {
								deliverPolicy: ['startTime'],
							},
						},
						default: '',
						description: 'Time to start from',
						placeholder: '2023-01-01T00:00:00Z',
						hint: 'ISO 8601 format timestamp',
					},
					{
						displayName: 'Ack Wait (Ms)',
						name: 'ackWait',
						type: 'number',
						default: 30000,
						description: 'Time to wait for acknowledgment before redelivery (milliseconds)',
						hint: 'Message will be redelivered if not acknowledged in time',
					},
					{
						displayName: 'Max Delivery Attempts',
						name: 'maxDeliver',
						type: 'number',
						default: -1,
						description: 'Maximum delivery attempts before giving up',
						hint: 'Use -1 for unlimited attempts',
					},
					{
						displayName: 'Manual Acknowledgment',
						name: 'manualAck',
						type: 'boolean',
						default: false,
						description: 'Whether to require explicit acknowledgment in workflow',
						hint: 'Messages remain pending until acknowledged',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const subject = this.getNodeParameter('subject') as string;
		const streamName = this.getNodeParameter('streamName') as string;
		const consumerType = this.getNodeParameter('consumerType') as string;
		const replyMode = this.getNodeParameter('replyMode', 'disabled') as string;
		const replyOptions = this.getNodeParameter('replyOptions', {}) as IDataObject;
		const automaticReply = this.getNodeParameter('automaticReply', {}) as IDataObject;
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const credentials = await this.getCredentials('natsApi');

		let nc: NatsConnection;
		let subscription: any;
		let messageIterator: any;
		let replyHandler: any;

		// Create NodeLogger once for the entire trigger
		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		// Validate inputs
		validateSubject(subject);
		validateStreamName(streamName);

		if (options.ackWait) {
			validateTimeout(options.ackWait as number, 'Ack Wait');
		}

		if (consumerType === 'durable') {
			const consumerName = this.getNodeParameter('consumerName') as string;
			validateConsumerName(consumerName);
		}

		const closeFunction = async () => {
			if (messageIterator) {
				await messageIterator.return();
			}
			if (subscription && typeof subscription.stop === 'function') {
				await subscription.stop();
			}
			if (replyHandler) {
				replyHandler.cleanup();
			}
			if (nc) {
				await closeNatsConnection(nc, nodeLogger);
			}
		};

		// Create reply handler based on mode
		if (replyMode !== 'disabled') {
			replyHandler = createReplyHandler(replyMode);
		}

		// Helper function to process messages based on reply mode
		const processMessage = async (msg: Msg) => {
			const parsedMessage = parseNatsMessage(msg);
			
			// Process message with reply handler
			if (replyHandler) {
				await replyHandler.processMessage({ 
					msg, 
					parsedMessage,
					automaticReply,
					replyOptions,
				});
			}
			
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
			const sampleData: any = {
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
			nc = await createNatsConnection(credentials, nodeLogger);
			const js = jetstream(nc);

			if (consumerType === 'durable') {
				// Use existing durable consumer
				const consumerName = this.getNodeParameter('consumerName') as string;
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
				// Create ephemeral consumer configuration
				const consumerConfig: any = {
					filter_subject: subject,
					ack_policy: options.manualAck ? 'explicit' : 'all',
				};

				// Configure delivery policy
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
					case 'startSequence':
						consumerConfig.deliver_policy = 'by_start_sequence';
						consumerConfig.opt_start_seq = options.startSequence as number;
						break;
					case 'startTime':
						consumerConfig.deliver_policy = 'by_start_time';
						consumerConfig.opt_start_time = new Date(options.startTime as string).toISOString();
						break;
				}

				if (options.ackWait) {
					consumerConfig.ack_wait = (options.ackWait as number) * 1_000_000; // Convert to nanoseconds
				}

				if (options.maxDeliver) {
					consumerConfig.max_deliver = options.maxDeliver as number;
				}

				// Get JetStream manager and create ephemeral consumer
				const jsm = await jetstreamManager(nc);
				const consumerInfo = await jsm.consumers.add(streamName, consumerConfig);
				
				// Get consumer reference
				const consumer = await js.consumers.get(consumerInfo.stream_name, consumerInfo.name);
				
				// Start consuming messages
				(async () => {
					messageIterator = await consumer.consume();
					for await (const msg of messageIterator) {
						await processMessage(msg as any);
						if (!options.manualAck) {
							msg.ack();
						}
					}
				})();

				// Store consumer for cleanup
				subscription = consumer as any;
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
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
			
			let errorMessage = `NATS Stream Consumer failed: ${error.message}`;
			if (error.code === 'STREAM_NOT_FOUND') {
				errorMessage = `Stream '${streamName}' not found. Please create the stream first.`;
			} else if (error.code === 'CONSUMER_NOT_FOUND') {
				errorMessage = `Consumer '${this.getNodeParameter('consumerName', '')}' not found in stream '${streamName}'.`;
			}
			
			throw new ApplicationError(errorMessage, {
				level: 'error',
				tags: { nodeType: 'n8n-nodes-synadia.natsStreamConsumer' },
			});
		}
	}
}