import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	ApplicationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, Msg, jetstream } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { parseNatsMessage } from '../utils/NatsHelpers';
import { validateStreamName, validateConsumerName } from '../utils/ValidationHelpers';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsStreamConsumer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Stream Consumer',
		name: 'natsStreamConsumer',
		icon: 'file:../icons/nats.svg',
		group: ['trigger'],
		version: 1,
		description: 'Consume messages from existing NATS JetStream consumers',
		subtitle: '{{$parameter["streamName"]}} - {{$parameter["consumerName"]}}',
		defaults: {
			name: 'NATS Stream Consumer',
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
				description: 'Name of the JetStream stream (no spaces or dots)',
				placeholder: 'ORDERS',
				hint: 'Stream must exist and contain the specified subject',
			},
			{
				displayName: 'Consumer Name',
				name: 'consumerName',
				type: 'string',
				default: '',
				required: true,
				description: 'Name of existing JetStream consumer (no spaces or dots)',
				placeholder: 'order-processor',
				hint: 'Consumer must already exist in the stream',
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const streamName = this.getNodeParameter('streamName') as string;
		const consumerName = this.getNodeParameter('consumerName') as string;
		const credentials = await this.getCredentials('natsApi');

		let nc: NatsConnection;
		let consumer: any;
		let messageIterator: any;

		// Create NodeLogger once for the entire trigger
		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		// Validate inputs
		validateStreamName(streamName);
		validateConsumerName(consumerName);

		const closeFunction = async () => {
			if (messageIterator) {
				await messageIterator.return();
			}
			if (consumer && typeof consumer.stop === 'function') {
				await consumer.stop();
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
				subject: 'orders.new',
				data: { 
					orderId: 'ORD-12345',
					customerName: 'John Doe',
					amount: 99.99,
					status: 'confirmed'
				},
				headers: {
					'Nats-Msg-Id': 'sample-msg-123',
					'Nats-Stream': streamName,
					'Nats-Consumer': consumerName,
					'Nats-Sequence': '42'
				},
				seq: 42,
				timestamp: new Date().toISOString(),
			};
			
			
			this.emit([this.helpers.returnJsonArray([sampleData])]);
		};

		try {
			nc = await createNatsConnection(credentials, nodeLogger);
			const js = jetstream(nc);

			// Use existing consumer (durable or ephemeral)
			consumer = await js.consumers.get(streamName, consumerName);
			
			// Start consuming messages
			messageIterator = await consumer.consume();
			(async () => {
				for await (const msg of messageIterator) {
					await processMessage(msg as any);
					msg.ack();
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
			
			let errorMessage = `NATS Stream Consumer failed: ${error.message}`;
			if (error.code === 'STREAM_NOT_FOUND') {
				errorMessage = `Stream '${streamName}' not found. Please create the stream first.`;
			} else if (error.code === 'CONSUMER_NOT_FOUND') {
				errorMessage = `Consumer '${consumerName}' not found in stream '${streamName}'. Please create the consumer first.`;
			}
			
			throw new ApplicationError(errorMessage, {
				level: 'error',
				tags: { nodeType: 'n8n-nodes-synadia.natsStreamConsumer' },
			});
		}
	}
}