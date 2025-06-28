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
import { NatsConnection, Msg, jetstream } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { parseNatsMessage } from '../utils/NatsHelpers';
import { createReplyHandler, ManualReplyHandler } from '../utils/reply';
import { validateStreamName, validateConsumerName } from '../utils/ValidationHelpers';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsStreamConsumer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Stream Consumer',
		name: 'natsStreamConsumer',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Consume messages from existing NATS JetStream consumers',
		subtitle: '{{$parameter["streamName"]}} - {{$parameter["consumerName"]}}',
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
				displayName: 'Consumer Name',
				name: 'consumerName',
				type: 'string',
				default: '',
				required: true,
				description: 'Name of existing JetStream consumer (no spaces or dots)',
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
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
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
		const streamName = this.getNodeParameter('streamName') as string;
		const consumerName = this.getNodeParameter('consumerName') as string;
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
		validateStreamName(streamName);
		validateConsumerName(consumerName);

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
				subject: 'orders.new',
				data: { 
					orderId: 'ORD-12345',
					customerName: 'John Doe',
					amount: 99.99,
					status: 'confirmed'
				},
				headers: {
					'Nats-Msg-Id': 'sample-msg-123',
					'Nats-Stream': streamName,
					'Nats-Consumer': consumerName,
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

			// Use existing consumer (durable or ephemeral)
			const consumer = await js.consumers.get(streamName, consumerName);
			
			// Start consuming messages
			messageIterator = await consumer.consume();
			(async () => {
				for await (const msg of messageIterator) {
					await processMessage(msg as any);
					if (!options.manualAck) {
						msg.ack();
					}
				}
			})();

			// Store consumer for cleanup
			subscription = consumer as any;

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
				errorMessage = `Consumer '${consumerName}' not found in stream '${streamName}'. Please create the consumer first.`;
			}
			
			throw new ApplicationError(errorMessage, {
				level: 'error',
				tags: { nodeType: 'n8n-nodes-synadia.natsStreamConsumer' },
			});
		}
	}
}