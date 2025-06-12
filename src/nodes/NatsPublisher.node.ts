import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection } from 'nats';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { encodeMessage, createNatsHeaders, validateSubject } from '../utils/NatsHelpers';

export class NatsPublisher implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Publisher',
		name: 'natsPublisher',
		icon: 'file:../icons/nats.svg',
		group: ['output'],
		version: 1,
		description: 'Publish messages to NATS',
		subtitle: '={{$parameter["subject"]}}',
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
						description: 'Publish to regular NATS subjects',
					},
					{
						name: 'JetStream',
						value: 'jetstream',
						description: 'Publish to JetStream streams',
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
				description: 'The subject to publish to',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '={{ $json }}',
				description: 'The message to send',
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
				description: 'JetStream stream name (optional, will auto-detect if not specified)',
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
						description: 'Optional headers to include with the message',
					},
					{
						displayName: 'Reply To',
						name: 'replyTo',
						type: 'string',
						default: '',
						description: 'Optional reply-to subject',
					},
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						type: 'number',
						default: 5000,
						description: 'Publish timeout in milliseconds',
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
						description: 'Optional message ID for deduplication',
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
						description: 'Expected last message ID for optimistic concurrency',
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
						description: 'Expected last sequence for optimistic concurrency',
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
						description: 'Expected stream name for validation',
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
		
		try {
			nc = await createNatsConnection(credentials, this);
			const publishType = this.getNodeParameter('publishType', 0) as string;
			
			for (let i = 0; i < items.length; i++) {
				try {
					const subject = this.getNodeParameter('subject', i) as string;
					const message = this.getNodeParameter('message', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					// Validate subject
					validateSubject(subject);
					
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
						const js = nc.jetstream();
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
				await closeNatsConnection(nc);
			}
		}
		
		return [returnData];
	}
}