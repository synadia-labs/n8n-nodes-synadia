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
import { NatsConnection, Subscription, Msg } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { parseNatsMessage, validateSubject } from '../utils/NatsHelpers';
import { createReplyHandler, ManualReplyHandler } from '../utils/reply';
import { validateQueueGroup } from '../utils/ValidationHelpers';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsSubscriber implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Subscriber',
		name: 'natsSubscriber',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Subscribe to Core NATS subjects with fast, at-most-once delivery',
		subtitle: '{{$parameter["subject"]}}',
		defaults: {
			name: 'NATS Subscriber',
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
				placeholder: 'orders.>',
				description: 'Subject pattern to subscribe to (no spaces allowed)',
				hint: 'Use * for single token wildcard, > for multi-token wildcard',
			},
			{
				displayName: 'Queue Group',
				name: 'queueGroup',
				type: 'string',
				default: '',
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
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const subject = this.getNodeParameter('subject') as string;
		const queueGroup = this.getNodeParameter('queueGroup', '') as string;
		const replyMode = this.getNodeParameter('replyMode', 'disabled') as string;
		const replyOptions = this.getNodeParameter('replyOptions', {}) as IDataObject;
		const automaticReply = this.getNodeParameter('automaticReply', {}) as IDataObject;
		const credentials = await this.getCredentials('natsApi');

		let nc: NatsConnection;
		let subscription: Subscription;
		let replyHandler: any;

		// Create NodeLogger once for the entire trigger
		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		// Validate inputs
		validateSubject(subject);

		if (queueGroup) {
			validateQueueGroup(queueGroup);
		}

		const closeFunction = async () => {
			if (subscription) {
				subscription.unsubscribe();
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
			nc = await createNatsConnection(credentials, nodeLogger);

			// Core NATS subscription
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
			
			throw new ApplicationError(`NATS Subscriber failed: ${error.message}`, {
				level: 'error',
				tags: { nodeType: 'n8n-nodes-synadia.natsSubscriber' },
			});
		}
	}
}