import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, jetstream } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { encodeMessage, createNatsHeaders, validateSubject } from '../utils/NatsHelpers';
import { NodeLogger } from '../utils/NodeLogger';
import { validateStreamName, validateTimeout } from '../utils/ValidationHelpers';

export class NatsPublisher implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Publisher',
		name: 'natsPublisher',
		icon: 'file:../icons/nats.svg',
		group: ['output'],
		version: 1,
		description: 'Send messages to NATS subjects or JetStream streams',
		subtitle: '{{$parameter["subject"]}}',
		defaults: {
			name: 'NATS Publisher',
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
				displayName: 'Publish Type',
				name: 'publishType',
				type: 'options',
				options: [
					{
						name: 'Core NATS',
						value: 'core',
						description: 'Fast, at-most-once delivery to subscribers',
					},
					{
						name: 'JetStream',
						value: 'jetstream',
						description: 'Guaranteed delivery with persistence and replay',
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
				placeholder: 'orders.new',
				description: 'Subject name for message routing (no spaces allowed)',
				hint: 'Use dots for hierarchy: orders.new, sensors.temperature.room1',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '{{ $json }}',
				description: 'Message content to publish',
				hint: 'Supports expressions like {{ $json }} to use input data',
			},
			{
				displayName: 'Stream Name',
				name: 'streamName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						publishType: ['jetstream'],
					},
				},
				description: 'Target stream name (auto-detected if not specified)',
				placeholder: 'ORDERS',
				hint: 'Leave empty to let JetStream find the appropriate stream',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Message Encoding',
						name: 'encoding',
						type: 'options',
						options: [
							{
								name: 'JSON',
								value: 'json',
								description: 'Encode message as JSON',
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
					{
						displayName: 'Headers',
						name: 'headers',
						type: 'json',
						typeOptions: {
							rows: 4,
						},
						default: '{}',
						description: 'Custom headers as JSON object',
						placeholder: '{"X-Order-Type": "express", "X-Priority": "high"}',
						hint: 'Headers can be used for routing and metadata',
					},
					{
						displayName: 'Reply To',
						name: 'replyTo',
						type: 'string',
						default: '',
						description: 'Subject for receiving replies',
						placeholder: 'orders.replies',
						hint: 'Used with request-reply pattern',
					},
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						type: 'number',
						default: 5000,
						description: 'Maximum time to wait for acknowledgment (milliseconds)',
						hint: 'Only applies to JetStream publishes',
					},
					{
						displayName: 'Message ID',
						name: 'messageId',
						type: 'string',
						displayOptions: {
							show: {
								'/publishType': ['jetstream'],
							},
						},
						default: '',
						description: 'Unique ID to prevent duplicate messages',
						placeholder: 'order-12345',
						hint: 'JetStream will reject duplicates within the deduplication window',
					},
					{
						displayName: 'Expected Last Message ID',
						name: 'expectedLastMsgId',
						type: 'string',
						displayOptions: {
							show: {
								'/publishType': ['jetstream'],
							},
						},
						default: '',
						description: 'Only publish if this was the last message ID',
						placeholder: 'order-12344',
						hint: 'Prevents concurrent updates - fails if another message was published',
					},
					{
						displayName: 'Expected Last Sequence',
						name: 'expectedLastSeq',
						type: 'number',
						displayOptions: {
							show: {
								'/publishType': ['jetstream'],
							},
						},
						default: 0,
						description: 'Only publish if stream is at this sequence number',
						hint: 'Prevents concurrent updates - fails if stream has advanced',
					},
					{
						displayName: 'Expected Stream',
						name: 'expectedStream',
						type: 'string',
						displayOptions: {
							show: {
								'/publishType': ['jetstream'],
							},
						},
						default: '',
						description: 'Verify message goes to this specific stream',
						placeholder: 'ORDERS',
						hint: 'Fails if subject would be stored in a different stream',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('natsApi');
		
		let nc: NatsConnection;
		
		// Create NodeLogger once for the entire execution
		const nodeLogger = new NodeLogger(this.logger, this.getNode());
		
		try {
			nc = await createNatsConnection(credentials, nodeLogger);
			const publishType = this.getNodeParameter('publishType', 0) as string;
			
			for (let i = 0; i < items.length; i++) {
				try {
					const subject = this.getNodeParameter('subject', i) as string;
					const message = this.getNodeParameter('message', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					// Validate subject
					validateSubject(subject);
					
					// Validate timeout if specified
					if (options.timeout) {
						validateTimeout(options.timeout, 'Timeout');
					}
					
					// Validate stream name if specified
					if (publishType === 'jetstream' && options.expectedStream) {
						validateStreamName(options.expectedStream);
					}
					
					// Prepare message data
					let messageData: any;
					if (options.encoding === 'json') {
						try {
							messageData = typeof message === 'string' ? JSON.parse(message) : message;
						} catch {
							messageData = message;
						}
					} else {
						messageData = message;
					}
					
					// Encode message
					const encodedMessage = encodeMessage(messageData, options.encoding || 'json');
					
					// Prepare headers
					let headers;
					if (options.headers) {
						try {
							const headersObj = typeof options.headers === 'string' 
								? JSON.parse(options.headers) 
								: options.headers;
							headers = createNatsHeaders(headersObj);
						} catch (e: any) {
							throw new NodeOperationError(this.getNode(), `Invalid headers JSON: ${e.message}`, { itemIndex: i });
						}
					}
					
					if (publishType === 'core') {
						// Core NATS publish
						const pubOptions: any = { headers };
						if (options.replyTo) {
							pubOptions.reply = options.replyTo;
						}
						
						nc.publish(subject, encodedMessage, pubOptions);
						
						returnData.push({
							json: {
								success: true,
								subject,
								message: messageData,
								timestamp: new Date().toISOString(),
							},
						});
						
					} else {
						// JetStream publish
						const js = jetstream(nc);
						const pubOptions: any = { 
							headers,
							timeout: options.timeout || 5000,
						};
						
						if (options.messageId) {
							pubOptions.msgID = options.messageId;
						}
						
						if (options.expectedLastMsgId) {
							pubOptions.expect = { lastMsgID: options.expectedLastMsgId };
						} else if (options.expectedLastSeq) {
							pubOptions.expect = { lastSequence: options.expectedLastSeq };
						}
						
						if (options.expectedStream) {
							pubOptions.expect = { ...pubOptions.expect, streamName: options.expectedStream };
						}
						
						const ack = await js.publish(subject, encodedMessage, pubOptions);
						
						returnData.push({
							json: {
								success: true,
								subject,
								message: messageData,
								stream: ack.stream,
								sequence: ack.seq,
								duplicate: ack.duplicate,
								timestamp: new Date().toISOString(),
							},
						});
					}
					
				} catch (error: any) {
					if (this.continueOnFail()) {
						returnData.push({
							json: {
								error: error.message,
								subject: this.getNodeParameter('subject', i) as string,
							},
							pairedItem: { item: i },
						});
					} else {
						throw error;
					}
				}
			}
			
			// Ensure messages are flushed before closing
			await nc.flush();
			
		} catch (error: any) {
			throw new NodeOperationError(this.getNode(), `NATS publish failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
		}
		
		return [returnData];
	}
}