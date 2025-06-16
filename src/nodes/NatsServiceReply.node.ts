import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	INodeExecutionData,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, Msg, StringCodec } from '../bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { encodeMessage, createNatsHeaders, validateSubject, parseNatsMessage } from '../utils/NatsHelpers';

export class NatsServiceReply implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Service Reply',
		name: 'natsServiceReply',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Responds to NATS request/reply messages as a service',
		subtitle: '={{$parameter["subject"]}}',
		defaults: {
			name: 'NATS Service Reply',
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
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'api.users.get',
				description: 'The subject to listen for requests on',
			},
			{
				displayName: 'Queue Group',
				name: 'queueGroup',
				type: 'string',
				default: '',
				placeholder: 'api-service',
				description: 'Optional queue group for load balancing service instances',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Request Encoding',
						name: 'requestEncoding',
						type: 'options',
						options: [
							{
								name: 'Auto',
								value: 'auto',
								description: 'Automatically detect encoding',
							},
							{
								name: 'JSON',
								value: 'json',
								description: 'Parse request as JSON',
							},
							{
								name: 'String',
								value: 'string',
								description: 'Parse as plain string',
							},
							{
								name: 'Binary',
								value: 'binary',
								description: 'Return as base64 encoded binary',
							},
						],
						default: 'auto',
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
					{
						displayName: 'Default Reply',
						name: 'defaultReply',
						type: 'string',
						default: '{"success": true}',
						typeOptions: {
							rows: 4,
						},
						description: 'Default reply if workflow produces no output',
					},
					{
						displayName: 'Max Messages',
						name: 'maxMessages',
						type: 'number',
						default: 0,
						description: 'Maximum number of messages to process (0 = unlimited)',
					},
					{
						displayName: 'Reply Field',
						name: 'replyField',
						type: 'string',
						default: 'reply',
						description: 'The field in the output to use as reply data',
					},
					{
						displayName: 'Include Request In Reply',
						name: 'includeRequest',
						type: 'boolean',
						default: false,
						description: 'Whether to include the original request in the reply',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const subject = this.getNodeParameter('subject') as string;
		const queueGroup = this.getNodeParameter('queueGroup', '') as string;
		const options = this.getNodeParameter('options', {}) as any;
		
		// Validate subject
		validateSubject(subject);
		
		let nc: NatsConnection;
		let subscription: any;
		let messageCount = 0;
		const pendingMessages = new Map<string, Msg>();
		
		const processRequest = async (msg: Msg) => {
			try {
				// Check if this is a request (has reply subject)
				if (!msg.reply) {
					// Not a request, ignore
					return;
				}
				
				// Check max messages limit
				if (options.maxMessages > 0 && messageCount >= options.maxMessages) {
					if (subscription) {
						await subscription.unsubscribe();
					}
					return;
				}
				messageCount++;
				
				// Generate unique ID for this request
				const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				
				// Store the message for manual trigger function
				pendingMessages.set(requestId, msg);
				
				// Use the same parseNatsMessage function as NatsTrigger
				const parsedMessage = parseNatsMessage(msg);
				
				// Add the requestId to the parsed message
				parsedMessage.json.requestId = requestId;
				
				// Emit the message in the same format as NatsTrigger
				this.emit([[parsedMessage]]);
				
			} catch (error: any) {
				this.logger.error('Error processing request:', error);
				// Try to send error reply if possible
				if (msg.reply) {
					try {
						const errorReply = JSON.stringify({ error: error.message });
						const sc = StringCodec();
						msg.respond(sc.encode(errorReply));
					} catch {
						// Ignore reply errors
					}
				}
			}
		};
		
		const startService = async () => {
			try {
				nc = await createNatsConnection(credentials, this);
				
				// Subscribe to subject
				const subOptions: any = {};
				if (queueGroup) {
					subOptions.queue = queueGroup;
				}
				
				subscription = nc.subscribe(subject, subOptions);
				
				// Process messages
				(async () => {
					for await (const msg of subscription) {
						await processRequest(msg);
					}
				})().catch((error) => {
					this.logger.error('Service error:', error);
				});
				
			} catch (error: any) {
				throw new NodeOperationError(this.getNode(), `Failed to start service: ${error.message}`);
			}
		};
		
		await startService();
		
		// Manual trigger function to send replies
		const manualTriggerFunction = async () => {
			// If no pending messages, emit sample data for testing
			if (pendingMessages.size === 0) {
				const sampleData = {
					subject,
					data: {
						userId: '12345',
						action: 'getUser',
						includeDetails: true
					},
					headers: {
						'X-Request-ID': 'sample-req-123',
						'X-Client-Version': '1.0.0'
					},
					replyTo: '_INBOX.sample.reply',
					requestId: 'sample-request-id',
					timestamp: new Date().toISOString(),
				};
				
				this.emit([this.helpers.returnJsonArray([sampleData])]);
				return;
			}
			
			// Get the output items that should be available in the context
			const items = (this as any).getInputData() as INodeExecutionData[];
			
			// Process each item
			for (const item of items) {
				const requestId = item.json.requestId as string;
				const msg = pendingMessages.get(requestId);
				
				if (msg && msg.reply) {
					try {
						// Determine reply data
						let replyData: any;
						const replyField = options.replyField || 'reply';
						
						// Check if reply field exists
						if (item.json[replyField] !== undefined) {
							replyData = item.json[replyField];
						} else {
							// Use entire output minus internal fields
							const { requestId: _, subject: _subject, data: _data, headers: _headers, replyTo: _replyTo, timestamp: _timestamp, seq: _seq, ...cleanReply } = item.json;
							
							// Use clean reply or default reply
							if (Object.keys(cleanReply).length === 0) {
								replyData = options.defaultReply || '{"success": true}';
								if (typeof replyData === 'string') {
									try {
										replyData = JSON.parse(replyData);
									} catch {
										// Keep as string
									}
								}
							} else {
								replyData = cleanReply;
							}
						}
						
						// Include request if option is set
						if (options.includeRequest && item.json.data) {
							replyData = {
								request: item.json.data,
								response: replyData,
							};
						}
						
						// Extract custom headers if provided
						let replyHeaders;
						if (item.json.replyHeaders && typeof item.json.replyHeaders === 'object') {
							replyHeaders = createNatsHeaders(item.json.replyHeaders as Record<string, string>);
						}
						
						// Encode and send reply
						const encodedReply = encodeMessage(replyData, options.replyEncoding || 'json');
						msg.respond(encodedReply, { headers: replyHeaders });
						
					} catch (error: any) {
						this.logger.error('Error sending reply:', error);
						// Try to send error reply
						if (msg.reply) {
							try {
								const errorReply = JSON.stringify({ error: error.message });
								const sc = StringCodec();
								msg.respond(sc.encode(errorReply));
							} catch {
								// Ignore reply errors
							}
						}
					} finally {
						pendingMessages.delete(requestId);
					}
				}
			}
			
			// Return nothing for trigger functions
		};
		
		async function closeFunction() {
			try {
				// Clear pending messages
				pendingMessages.clear();
				
				if (subscription) {
					await subscription.unsubscribe();
				}
				if (nc) {
					await closeNatsConnection(nc);
				}
			} catch (error) {
				console.error('Error closing service:', error);
			}
		}
		
		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}