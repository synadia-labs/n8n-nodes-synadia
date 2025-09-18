import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	ApplicationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, jetstream, jetstreamManager } from '../../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import {
	parseNatsMessage,
	validateStreamName,
	validateConsumerName,
} from '../../utils/NatsHelpers';
import { NodeLogger } from '../../utils/NodeLogger';

export class NatsJetstreamTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS JetStream Trigger',
		name: 'natsJetstreamTrigger',
		icon: 'file:../../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Consume messages from NATS JetStream streams and trigger workflows',
		subtitle: '={{$parameter["streamName"] + " / " + $parameter["consumerName"]}}',
		defaults: {
			name: 'NATS JetStream Trigger',
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
				placeholder: 'EVENTS',
				description: 'Name of the JetStream stream to consume from',
				hint: 'The stream must exist before consuming',
			},
			{
				displayName: 'Consumer Name',
				name: 'consumerName',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'order-processor',
				description: 'Name of the JetStream consumer to use',
				hint: 'The consumer must exist before consuming',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Max Messages',
						name: 'maxMessages',
						type: 'number',
						default: 100,
						description: 'Maximum number of messages to fetch in each pull',
						hint: 'Used when Max Bytes is not set. Higher values can improve performance but use more memory',
					},
					{
						displayName: 'Max Bytes',
						name: 'maxBytes',
						type: 'number',
						default: 0,
						description:
							'Maximum bytes to fetch in each pull. If set, takes priority over Max Messages.',
						hint: 'Set to 0 to use Max Messages instead. These options are mutually exclusive',
					},
					{
						displayName: 'Expires (Seconds)',
						name: 'expires',
						type: 'number',
						default: 30,
						description: 'Timeout for pull requests in seconds',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('natsApi');
		const streamName = this.getNodeParameter('streamName') as string;
		const consumerName = this.getNodeParameter('consumerName') as string;
		const options = this.getNodeParameter('options', {}) as any;

		// Validate input parameters
		validateStreamName(streamName);
		validateConsumerName(consumerName);

		let nc: NatsConnection;
		let consumer: any;
		let messageIterator: any;

		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		const closeFunction = async () => {
			try {
				// Stop message iteration
				if (messageIterator && messageIterator.stop) {
					await messageIterator.stop();
				}

				if (nc) {
					await closeNatsConnection(nc, nodeLogger);
				}
			} catch (error: any) {
				// Log error but don't throw - connection may already be closed
				if (error.message && !error.message.includes('closed')) {
					nodeLogger.error('Error closing JetStream consumer:', { error });
				}
			}
		};

		const manualTriggerFunction = async () => {
			// Provide comprehensive sample data matching JetStream message format
			const sampleData = {
				subject: 'events.orders.new',
				data: {
					orderId: 'order-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
					customerId: 'customer-67890',
					amount: 99.99,
					currency: 'USD',
					items: [
						{
							sku: 'WIDGET-001',
							name: 'Premium Widget',
							quantity: 2,
							price: 49.99,
						},
					],
					shipping: {
						address: '123 Main St, Anytown, NY 12345',
						method: 'standard',
						cost: 9.99,
					},
					payment: {
						method: 'credit_card',
						last4: '4242',
						status: 'authorized',
					},
					status: 'confirmed',
					timestamp: Date.now(),
				},
				headers: {
					'Content-Type': 'application/json',
					'X-Order-Source': 'web-app',
					'X-User-Agent': 'Mozilla/5.0 (example)',
					'X-Request-ID': 'req-' + Math.random().toString(36).substr(2, 12),
					'X-Correlation-ID': 'corr-' + Math.random().toString(36).substr(2, 12),
				},
				// JetStream specific metadata
				seq: Math.floor(Math.random() * 10000) + 1000,
				stream: streamName,
				consumer: consumerName,
				pending: Math.floor(Math.random() * 5),
				timestamp: new Date().toISOString(),
				redelivered: false,
				redeliveryCount: 0,
				ackWait: 30000, // 30 seconds in milliseconds
			};

			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};

		try {
			// Create connection with monitoring for long-running trigger
			nc = await createNatsConnection(credentials, nodeLogger, {
				monitor: true,
				onError: (error) => {
					nodeLogger.error('JetStream consumer connection lost:', { error });
				},
				onReconnect: (server) => {
					nodeLogger.info(`JetStream consumer reconnected to ${server}`);
				},
				onDisconnect: (server) => {
					nodeLogger.warn(`JetStream consumer disconnected from ${server}`);
				},
				onAsyncError: (error) => {
					nodeLogger.error('JetStream consumer async error (e.g. permission):', { error });
				},
			});

			const js = jetstream(nc);
			const jsm = await jetstreamManager(nc);

			// Verify stream exists
			try {
				await jsm.streams.info(streamName);
			} catch (error: any) {
				if (error.code === 'STREAM_NOT_FOUND') {
					throw new ApplicationError(
						`JetStream stream '${streamName}' not found. Please create the stream first.`,
					);
				}
				throw error;
			}

			// Get consumer
			try {
				consumer = await js.consumers.get(streamName, consumerName);
			} catch (error: any) {
				if (error.code === 'CONSUMER_NOT_FOUND') {
					throw new ApplicationError(
						`JetStream consumer '${consumerName}' not found in stream '${streamName}'. Please create the consumer first.`,
					);
				}
				throw error;
			}

			// Configure pull options - max_messages and max_bytes are mutually exclusive
			const pullOptions: any = {
				expires: (options.expires || 30) * 1000, // Convert to milliseconds
			};

			// Set either max_messages or max_bytes, but not both (they are mutually exclusive)
			if (options.maxBytes && options.maxBytes > 0) {
				// If maxBytes is explicitly set, use it
				pullOptions.max_bytes = options.maxBytes;
			} else {
				// Default to max_messages
				pullOptions.max_messages = options.maxMessages || 100;
			}

			// Start consuming messages
			messageIterator = await consumer.consume(pullOptions);

			// Process messages asynchronously
			(async () => {
				try {
					for await (const msg of messageIterator) {
						try {
							const parsedMessage = parseNatsMessage(msg);

							// Add JetStream-specific metadata
							const jetstreamMessage = {
								...parsedMessage,
								seq: msg.seq,
								stream: msg.info?.stream,
								consumer: msg.info?.consumer,
								redelivered: msg.info?.redelivered || false,
								redeliveryCount: msg.info?.delivered || 0,
							};

							this.emit([this.helpers.returnJsonArray([jetstreamMessage])]);

							// Acknowledge the message
							msg.ack();
						} catch (messageError: any) {
							nodeLogger.error('Error processing JetStream message:', {
								error: messageError,
								seq: msg.seq,
							});
							// NAK the message for redelivery
							msg.nak();
						}
					}
				} catch (iteratorError: any) {
					nodeLogger.error('JetStream message iterator error:', { error: iteratorError });
				}
			})();

			return {
				closeFunction,
				manualTriggerFunction,
			};
		} catch (error: any) {
			throw new ApplicationError(`Failed to setup JetStream consumer: ${error.message}`);
		}
	}
}
