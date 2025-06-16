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
import { NatsConnection, Subscription, consumerOpts, Msg, StringCodec } from '../bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { parseNatsMessage, validateSubject, encodeMessage, createNatsHeaders } from '../utils/NatsHelpers';

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
				description: 'How to handle messages that have a reply subject',
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
						description: 'Field name containing the reply data. If not found, entire output is used.',
					},
					{
						displayName: 'Include Request',
						name: 'includeRequest',
						type: 'boolean',
						default: false,
						description: 'Whether to include the original request in the reply',
					},
					{
						displayName: 'Default Reply',
						name: 'defaultReply',
						type: 'json',
						default: '{"success": true}',
						description: 'Default reply if no data is provided',
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
						description: 'Template for the response. Use {{$JSON.data}} to access request data.',
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
						description: 'Whether to include the original request in the workflow output',
					},
					{
						displayName: 'Error Response',
						name: 'errorResponse',
						type: 'json',
						default: '{"success": false, "error": "An error occurred processing the request"}',
						description: 'Response to send when template processing fails',
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
		const replyMode = this.getNodeParameter('replyMode', 'disabled') as string;
		const replyOptions = this.getNodeParameter('replyOptions', {}) as IDataObject;
		const automaticReply = this.getNodeParameter('automaticReply', {}) as IDataObject;

		// Validate subject
		validateSubject(subject);

		let nc: NatsConnection;
		let subscription: Subscription;
		const pendingMessages = new Map<string, Msg>();

		const closeFunction = async () => {
			if (subscription) {
				await subscription.drain();
			}
			if (nc) {
				await closeNatsConnection(nc);
			}
		};

		// Helper function to process messages based on reply mode
		const processMessage = async (msg: Msg) => {
			const parsedMessage = parseNatsMessage(msg);
			
			// Handle automatic reply mode
			if (replyMode === 'automatic' && msg.reply) {
				try {
					// Process the response template
					let responseTemplate = automaticReply.responseTemplate as string || '{"success": true}';
					const requestData = parsedMessage.json.data;
					
					// Simple template replacement
					responseTemplate = responseTemplate
						.replace(/\{\{new Date\(\)\.toISOString\(\)\}\}/g, new Date().toISOString())
						.replace(/\{\{\$json\.data\}\}/g, JSON.stringify(requestData))
						.replace(/\{\{\$json\}\}/g, JSON.stringify(requestData));
					
					// Handle nested property access
					const propertyMatches = responseTemplate.match(/\{\{\$json\.data\.([^}]+)\}\}/g);
					if (propertyMatches) {
						propertyMatches.forEach(match => {
							const propertyPath = match.match(/\{\{\$json\.data\.([^}]+)\}\}/)?.[1];
							if (propertyPath && requestData && typeof requestData === 'object') {
								const value = propertyPath.split('.').reduce((obj: any, key) => obj?.[key], requestData as any);
								responseTemplate = responseTemplate.replace(match, JSON.stringify(value ?? null));
							}
						});
					}
					
					// Send the response
					const responseEncoding = automaticReply.responseEncoding || 'json';
					let responseData: Uint8Array;
					
					if (responseEncoding === 'json') {
						const response = JSON.parse(responseTemplate);
						responseData = new TextEncoder().encode(JSON.stringify(response));
						// Add sent response to output if requested
						if (automaticReply.includeRequestInOutput !== false) {
							parsedMessage.json.sentResponse = response;
						}
					} else {
						responseData = new TextEncoder().encode(responseTemplate);
						if (automaticReply.includeRequestInOutput !== false) {
							parsedMessage.json.sentResponse = responseTemplate;
						}
					}
					
					msg.respond(responseData);
				} catch (error: any) {
					// Send error response
					if (automaticReply.errorResponse) {
						try {
							const errorResp = JSON.parse(automaticReply.errorResponse as string);
							const errorData = new TextEncoder().encode(JSON.stringify(errorResp));
							msg.respond(errorData);
							parsedMessage.json.sentResponse = errorResp;
							parsedMessage.json.error = error.message;
						} catch {
							// Send generic error
							const genericError = { error: 'Internal service error' };
							msg.respond(new TextEncoder().encode(JSON.stringify(genericError)));
							parsedMessage.json.sentResponse = genericError;
							parsedMessage.json.error = error.message;
						}
					}
				}
			}
			
			// Handle manual reply mode
			if (replyMode === 'manual' && msg.reply) {
				// Generate unique ID for this request
				const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				parsedMessage.json.requestId = requestId;
				pendingMessages.set(requestId, msg);
			}
			
			this.emit([[parsedMessage]]);
		};
		
		// Manual reply function (for manual mode)
		const manualReplyFunction = async () => {
			if (replyMode !== 'manual' || pendingMessages.size === 0) {
				return;
			}
			
			// Get the output items
			const items = (this as any).getInputData() as INodeExecutionData[];
			
			// Process each item
			for (const item of items) {
				const requestId = item.json.requestId as string;
				const msg = pendingMessages.get(requestId);
				
				if (msg && msg.reply) {
					try {
						// Determine reply data
						let replyData: any;
						const replyField = (replyOptions.replyField as string) || 'reply';
						
						// Check if reply field exists
						if ((item.json as any)[replyField] !== undefined) {
							replyData = (item.json as any)[replyField];
						} else {
							// Use entire output minus internal fields
							const { requestId: _, subject: _subject, data: _data, headers: _headers, replyTo: _replyTo, timestamp: _timestamp, seq: _seq, ...cleanReply } = item.json;
							
							// Use clean reply or default reply
							if (Object.keys(cleanReply).length === 0) {
								replyData = replyOptions.defaultReply || '{"success": true}';
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
						if (replyOptions.includeRequest && item.json.data) {
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
						const encodedReply = encodeMessage(replyData, replyOptions.replyEncoding as any || 'json');
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
						// Remove processed message
						pendingMessages.delete(requestId);
					}
				}
			}
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

					const sub = await js.subscribe(subject, opts);
					
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