import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	IDataObject,
	ApplicationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection } from '../bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { validateSubject } from '../utils/NatsHelpers';

export class NatsService implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Service',
		name: 'natsService',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Receive NATS requests and automatically send responses',
		subtitle: '={{$parameter["subject"]}}',
		defaults: {
			name: 'NATS Service',
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
				description: 'Optional queue group for load balancing across multiple instances',
			},
			{
				displayName: 'Response Data',
				name: 'responseData',
				type: 'json',
				default: '{\n  "success": true,\n  "message": "Request processed",\n  "timestamp": "{{new Date().toISOString()}}",\n  "echo": "{{$json.request}}"\n}',
				description: 'JSON response to send back. You can use expressions like {{$JSON.request}} to access request data.',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
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
						name: 'includeRequest',
						type: 'boolean',
						default: true,
						description: 'Whether to include the original request in the output data',
					},
					{
						displayName: 'Error Response',
						name: 'errorResponse',
						type: 'json',
						default: '{"success": false, "error": "An error occurred processing the request"}',
						description: 'JSON response to send when an error occurs',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const subject = this.getNodeParameter('subject') as string;
		const queueGroup = this.getNodeParameter('queueGroup', '') as string;
		const responseData = this.getNodeParameter('responseData') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		// Validate subject
		validateSubject(subject);

		let nc: NatsConnection;
		let isActive = true;

		const closeFunction = async () => {
			isActive = false;
			if (nc) {
				await closeNatsConnection(nc);
			}
		};

		const manualTriggerFunction = async () => {
			// Provide sample data for testing
			const sampleRequest = {
				userId: '12345',
				action: 'getUser',
				includeDetails: true,
			};

			// Parse and process the response template
			let sampleResponse: any;
			try {
				// Simple template processing for the sample
				let processedResponse = responseData
					.replace(/\{\{new Date\(\)\.toISOString\(\)\}\}/g, new Date().toISOString())
					.replace(/\{\{\$json\.request\}\}/g, JSON.stringify(sampleRequest));
				sampleResponse = JSON.parse(processedResponse);
			} catch {
				sampleResponse = { success: true, message: 'Sample response' };
			}

			const outputData = {
				subject,
				data: sampleRequest,
				replyTo: '_INBOX.sample.reply',
				timestamp: new Date().toISOString(),
			} as IDataObject;

			if (options.includeRequest !== false) {
				outputData.sentRequest = sampleRequest;
			}
			outputData.sentResponse = sampleResponse;

			this.emit([[{ json: outputData }]]);
		};

		try {
			nc = await createNatsConnection(credentials, this);

			// Subscribe to the subject
			const subOptions: any = {};
			if (queueGroup) {
				subOptions.queue = queueGroup;
			}

			const subscription = nc.subscribe(subject, subOptions);

			// Process messages
			(async () => {
				for await (const msg of subscription) {
					if (!isActive) break;

					try {
						// Parse the request
						let requestData: any;
						try {
							const decoder = new TextDecoder();
							const dataStr = decoder.decode(msg.data);
							requestData = JSON.parse(dataStr);
						} catch {
							// If not JSON, treat as string
							const decoder = new TextDecoder();
							requestData = decoder.decode(msg.data);
						}

						// Prepare the output data (matching NatsTrigger format)
						const outputData = {
							subject: msg.subject,
							data: requestData,
							replyTo: msg.reply,
							timestamp: new Date().toISOString(),
						} as IDataObject;

						if (options.includeRequest !== false) {
							outputData.sentRequest = requestData;
						}

						// Generate the response
						if (msg.reply) {
							try {
								// Process the response template
								let processedResponse = responseData;
								
								// Simple template replacement
								processedResponse = processedResponse
									.replace(/\{\{new Date\(\)\.toISOString\(\)\}\}/g, new Date().toISOString())
									.replace(/\{\{\$json\.request\}\}/g, JSON.stringify(requestData))
									.replace(/\{\{\$json\}\}/g, JSON.stringify(requestData));

								// Handle nested property access like {{$json.request.userId}}
								const propertyMatches = processedResponse.match(/\{\{\$json\.request\.([^}]+)\}\}/g);
								if (propertyMatches) {
									propertyMatches.forEach(match => {
										const propertyPath = match.match(/\{\{\$json\.request\.([^}]+)\}\}/)?.[1];
										if (propertyPath && requestData) {
											const value = propertyPath.split('.').reduce((obj, key) => obj?.[key], requestData);
											processedResponse = processedResponse.replace(match, JSON.stringify(value ?? null));
										}
									});
								}

								let response: any;
								const responseEncoding = options.responseEncoding || 'json';
								
								if (responseEncoding === 'json') {
									response = JSON.parse(processedResponse);
									outputData.sentResponse = response;
									const responseBytes = new TextEncoder().encode(JSON.stringify(response));
									msg.respond(responseBytes);
								} else {
									outputData.sentResponse = processedResponse;
									const responseBytes = new TextEncoder().encode(processedResponse);
									msg.respond(responseBytes);
								}
							} catch (error: any) {
								// Handle errors in response generation
								console.error('Error generating response:', error);
								if (options.errorResponse) {
									try {
										const errorResp = JSON.parse(options.errorResponse as string);
										const errorData = new TextEncoder().encode(JSON.stringify(errorResp));
										msg.respond(errorData);
										outputData.sentResponse = errorResp;
										outputData.error = error.message;
									} catch {
										// If error response is invalid, send generic error
										const genericError = { error: 'Internal service error' };
										msg.respond(new TextEncoder().encode(JSON.stringify(genericError)));
										outputData.sentResponse = genericError;
										outputData.error = error.message;
									}
								}
							}
						}

						// Emit the data
						this.emit([[{ json: outputData }]]);
					} catch (error: any) {
						console.error('Error processing NATS service request:', error);
					}
				}
			})();

			return {
				closeFunction,
				manualTriggerFunction,
			};
		} catch (error: any) {
			throw new ApplicationError(`Failed to setup NATS service: ${error.message}`);
		}
	}
}