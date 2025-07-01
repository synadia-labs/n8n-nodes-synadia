import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	ApplicationError,
} from 'n8n-workflow';
import { NatsConnection, jetstream, jetstreamManager } from '../../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { createNatsHeaders, validateSubject } from '../../utils/NatsHelpers';
import { NodeLogger } from '../../utils/NodeLogger';

import { streamDescription } from './StreamDescription';
import { messagesDescription } from './MessagesDescription';
import { consumersDescription } from './ConsumersDescription';

import {
	streamOperationHandlers,
	consumerOperationHandlers,
	messageOperationHandlers,
	StreamOperationParams,
	ConsumerOperationParams,
	MessageOperationParams,
} from './operations';

export class NatsJetstream implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS JetStream',
		name: 'natsJetstream',
		icon: 'file:../../icons/nats.svg',
		group: ['output'],
		version: 1,
		description: 'Manage NATS JetStream streams, consumers, and publish messages',
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		defaults: {
			name: 'NATS JetStream',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Stream',
						value: 'stream',
						description: 'Manage JetStream streams',
					},
					{
						name: 'Message',
						value: 'messages',
						description: 'Publish messages to JetStream',
					},
					{
						name: 'Consumer',
						value: 'consumers',
						description: 'Manage JetStream consumers',
					},
				],
				default: 'messages',
			},
			...streamDescription,
			...messagesDescription,
			...consumersDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('natsApi');

		let nc: NatsConnection;
		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		try {
			nc = await createNatsConnection(credentials, nodeLogger);
			const js = jetstream(nc);
			const jsm = await jetstreamManager(nc);

			for (let i = 0; i < items.length; i++) {
				try {
					const resource = this.getNodeParameter('resource', i) as string;
					const operation = this.getNodeParameter('operation', i) as string;

					let result: any;

					if (resource === 'stream') {
						const streamName = this.getNodeParameter('streamName', i, '') as string;
						const subject = this.getNodeParameter('subject', i, '') as string;
						const streamConfig = this.getNodeParameter('streamConfig', i, {}) as any;

						const handler = streamOperationHandlers[operation];
						if (!handler) {
							throw new ApplicationError(`Unknown stream operation: ${operation}`);
						}

						// For create/update operations, include the streamName in the config
						let finalStreamConfig = streamConfig;
						if ((operation === 'create' || operation === 'update') && streamName) {
							finalStreamConfig = { name: streamName, ...streamConfig };
						}

						const params: StreamOperationParams = {
							streamName,
							subject,
							streamConfig: finalStreamConfig,
						};

						result = await handler.execute(jsm, params);
					} else if (resource === 'messages') {
						const subject = this.getNodeParameter('subject', i) as string;
						const data = this.getNodeParameter('data', i) as string;
						const headers = this.getNodeParameter('headers', i, {}) as any;
						const options = this.getNodeParameter('options', i, {}) as any;

						validateSubject(subject);

						const handler = messageOperationHandlers[operation];
						if (!handler) {
							throw new ApplicationError(`Unknown message operation: ${operation}`);
						}

						const params: MessageOperationParams = {
							subject,
							data,
							headers: createNatsHeaders(headers),
							options,
						};

						result = await handler.execute(js, params);
					} else if (resource === 'consumers') {
						const streamName = this.getNodeParameter('streamName', i) as string;
						const consumerName = this.getNodeParameter('consumerName', i, '') as string;
						const consumerConfig = this.getNodeParameter('consumerConfig', i, {}) as any;

						const handler = consumerOperationHandlers[operation];
						if (!handler) {
							throw new ApplicationError(`Unknown consumer operation: ${operation}`);
						}

						const params: ConsumerOperationParams = {
							streamName,
							consumerName,
							consumerConfig,
						};

						result = await handler.execute(jsm, params);
					} else {
						throw new ApplicationError(`Unknown resource: ${resource}`);
					}

					returnData.push({
						json: result,
						pairedItem: { item: i },
					});
				} catch (error: any) {
					if (this.continueOnFail()) {
						returnData.push({
							json: {
								error: error.message,
								resource: this.getNodeParameter('resource', i),
								operation: this.getNodeParameter('operation', i),
							},
							pairedItem: { item: i },
						});
					} else {
						throw error;
					}
				}
			}

			// Flush any pending messages for message operations
			await nc.flush();
		} catch (error: any) {
			throw new NodeOperationError(this.getNode(), `NATS JetStream operation failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
		}

		return [returnData];
	}
}