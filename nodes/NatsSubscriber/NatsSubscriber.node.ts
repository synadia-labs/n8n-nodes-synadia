import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	ApplicationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, Subscription, Msg, SubscriptionOptions } from '../../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { parseNatsMessage, validateSubject, validateQueueGroup } from '../../utils/NatsHelpers';
import { NodeLogger } from '../../utils/NodeLogger';

export class NatsSubscriber implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Subscriber',
		name: 'natsSubscriber',
		icon: 'file:../../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Subscribe to NATS subjects and trigger workflows on messages',
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
				displayOptions: {
					show: {
						subscriptionType: ['core'],
					},
				},
				description: 'Group name for load balancing multiple subscribers',
				placeholder: 'order-processors',
				hint: 'Only one subscriber in the group receives each message',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const subject = this.getNodeParameter('subject') as string;
		const queueGroup = this.getNodeParameter('queueGroup') as string;

		// Validate subject and queue group
		validateSubject(subject);
		validateQueueGroup(queueGroup);

		let nc: NatsConnection;
		let subscription: Subscription | any;
		let messageIterator: any;

		// Create NodeLogger once for the entire trigger lifecycle
		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		const closeFunction = async () => {
			// Stop message iteration if JetStream consumer
			if (messageIterator && messageIterator.stop) {
				await messageIterator.stop();
			}

			// Unsubscribe from Core NATS subscription
			if (subscription && subscription.unsubscribe) {
				subscription.unsubscribe();
			}

			if (nc) {
				await closeNatsConnection(nc, nodeLogger);
			}
		};

		// Helper function to process messages based on reply mode
		const processMessage = async (msg: Msg) => {
			this.emit([[parseNatsMessage(msg)]]);
		};

		const manualTriggerFunction = async () => {
			let sampleData: any = {
				subject,
				data: {
					message: 'Sample NATS message',
					timestamp: Date.now(),
					source: 'manual-trigger',
				},
				headers: {
					'X-Sample-Header': 'sample-value',
				},
				timestamp: new Date().toISOString(),
			};

			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};

		try {
			// Create connection with monitoring for long-running trigger
			nc = await createNatsConnection(credentials, nodeLogger, {
				monitor: true,
				onError: (error) => {
					nodeLogger.error('Subscriber connection lost:', { error });
				},
				onReconnect: (server) => {
					nodeLogger.info(`Subscriber reconnected to ${server}`);
				},
				onDisconnect: (server) => {
					nodeLogger.warn(`Subscriber disconnected from ${server}`);
				},
				onAsyncError: (error) => {
					nodeLogger.error('Subscriber async error (e.g. permission):', { error });
				},
			});

			const subOptions: SubscriptionOptions = {};
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
			throw new ApplicationError(`Failed to setup NATS subscriber: ${error.message}`);
		}
	}
}
