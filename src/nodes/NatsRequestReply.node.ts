import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, StringCodec, Empty } from 'nats';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { encodeMessage, parseMessage, createNatsHeaders, validateSubject } from '../utils/NatsHelpers';

export class NatsRequestReply implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Request/Reply',
		name: 'natsRequestReply',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Send a request and wait for a reply from NATS services',
		subtitle: '={{$parameter["subject"]}}',
		defaults: {
			name: 'NATS Request/Reply',
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
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'api.users.get',
				description: 'The subject to send the request to',
			},
			{
				displayName: 'Request Data',
				name: 'requestData',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '={{ $json }}',
				description: 'The request data to send',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						type: 'number',
						default: 5000,
						description: 'Request timeout in milliseconds',
					},
					{
						displayName: 'Request Encoding',
						name: 'requestEncoding',
						type: 'options',
						options: [
							{
								name: 'JSON',
								value: 'json',
								description: 'Encode request as JSON',
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
						displayName: 'Response Encoding',
						name: 'responseEncoding',
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
								description: 'Parse response as JSON',
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
						displayName: 'Headers',
						name: 'headers',
						type: 'json',
						typeOptions: {
							rows: 4,
						},
						default: '{}',
						description: 'Optional headers to include with the request',
					},
					{
						displayName: 'No Reply Expected',
						name: 'noReply',
						type: 'boolean',
						default: false,
						description: 'Whether to send request without waiting for reply',
					},
					{
						displayName: 'Max Replies',
						name: 'maxReplies',
						type: 'number',
						default: 1,
						displayOptions: {
							show: {
								noReply: [false],
							},
						},
						description: 'Maximum number of replies to wait for (for scatter-gather pattern)',
					},
					{
						displayName: 'Reply Subject',
						name: 'replySubject',
						type: 'string',
						default: '',
						description: 'Custom reply subject (auto-generated if not specified)',
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
			
			for (let i = 0; i < items.length; i++) {
				try {
					const subject = this.getNodeParameter('subject', i) as string;
					const requestData = this.getNodeParameter('requestData', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					// Validate subject
					validateSubject(subject);
					
					// Prepare request data
					let data: any;
					if (options.requestEncoding === 'json') {
						try {
							data = typeof requestData === 'string' ? JSON.parse(requestData) : requestData;
						} catch {
							data = requestData;
						}
					} else {
						data = requestData;
					}
					
					// Encode request
					const encodedRequest = encodeMessage(data, options.requestEncoding || 'json');
					
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
					
					if (options.noReply) {
						// Send without waiting for reply
						const pubOptions: any = { headers };
						if (options.replySubject) {
							pubOptions.reply = options.replySubject;
						}
						
						nc.publish(subject, encodedRequest, pubOptions);
						
						returnData.push({
							json: {
								success: true,
								subject,
								request: data,
								replyExpected: false,
								timestamp: new Date().toISOString(),
							},
						});
					} else {
						// Request with reply
						const timeout = options.timeout || 5000;
						const maxReplies = options.maxReplies || 1;
						
						if (maxReplies === 1) {
							// Single reply
							try {
								const msg = await nc.request(
									subject,
									encodedRequest,
									{
										timeout,
										headers,
										reply: options.replySubject,
									}
								);
								
								// Parse response
								const responseData = parseMessage(msg.data, options.responseEncoding || 'auto');
								
								returnData.push({
									json: {
										success: true,
										subject,
										request: data,
										response: responseData,
										responseHeaders: msg.headers ? Object.fromEntries(msg.headers) : {},
										responseSubject: msg.subject,
										timestamp: new Date().toISOString(),
									},
								});
							} catch (error: any) {
								if (error.code === 'NO_RESPONDERS') {
									throw new NodeOperationError(
										this.getNode(),
										`No responders available for subject: ${subject}`,
										{ itemIndex: i }
									);
								} else if (error.code === 'TIMEOUT') {
									throw new NodeOperationError(
										this.getNode(),
										`Request timeout after ${timeout}ms for subject: ${subject}`,
										{ itemIndex: i }
									);
								} else {
									throw error;
								}
							}
						} else {
							// Multiple replies (scatter-gather)
							const replies: any[] = [];
							const startTime = Date.now();
							
							try {
								const iter = await nc.requestMany(
									subject,
									encodedRequest,
									{
										maxMessages: maxReplies,
										maxWait: timeout,
										headers,
									}
								);
								
								for await (const msg of iter) {
									const responseData = parseMessage(msg.data, options.responseEncoding || 'auto');
									replies.push({
										response: responseData,
										headers: msg.headers ? Object.fromEntries(msg.headers) : {},
										subject: msg.subject,
										timestamp: new Date().toISOString(),
									});
								}
							} catch (error: any) {
								// requestMany may timeout without error if no messages received
								if (replies.length === 0 && error.code === 'NO_RESPONDERS') {
									throw new NodeOperationError(
										this.getNode(),
										`No responders available for subject: ${subject}`,
										{ itemIndex: i }
									);
								}
							}
							
							const elapsed = Date.now() - startTime;
							
							returnData.push({
								json: {
									success: true,
									subject,
									request: data,
									replies,
									repliesReceived: replies.length,
									maxReplies,
									elapsedMs: elapsed,
									timestamp: new Date().toISOString(),
								},
							});
						}
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
			throw new NodeOperationError(this.getNode(), `NATS request/reply failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc);
			}
		}
		
		return [returnData];
	}
}