import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	ApplicationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, Subscription, Msg } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { parseNatsMessage, validateSubject } from '../utils/NatsHelpers';
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
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const subject = this.getNodeParameter('subject') as string;
		const queueGroup = this.getNodeParameter('queueGroup', '') as string;
		const credentials = await this.getCredentials('natsApi');

		let nc: NatsConnection;
		let subscription: Subscription;

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
			if (nc) {
				await closeNatsConnection(nc, nodeLogger);
			}
		};

		// Helper function to process messages
		const processMessage = async (msg: Msg) => {
			const parsedMessage = parseNatsMessage(msg);
			this.emit([[parsedMessage]]);
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

			return {
				closeFunction,
				manualTriggerFunction,
			};

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