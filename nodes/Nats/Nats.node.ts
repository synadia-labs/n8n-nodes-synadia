import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection } from '../../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { createNatsHeaders, validateSubject } from '../../utils/NatsHelpers';
import { NodeLogger } from '../../utils/NodeLogger';
import { PublishOptions } from '@nats-io/nats-core';

export class Nats implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS',
		name: 'nats',
		icon: 'file:../../icons/nats.svg',
		group: ['output'],
		version: 1,
		description: 'Send messages to NATS subjects',
		subtitle: '={{$parameter["subject"]}}',
		defaults: {
			name: 'NATS',
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
				placeholder: 'orders.new',
				description: 'Subject name for message routing (no spaces allowed)',
				hint: 'Use dots for hierarchy: orders.new, sensors.temperature.room1',
			},
			{
				displayName: 'Data',
				name: 'data',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '={{ $json }}',
				description: 'Message content to publish',
			},
			{
				displayName: 'Headers',
				name: 'headers',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Headers to add to the message',
				placeholder: 'Add Headers',
				hint: 'Headers can be used for routing and metadata',
				options: [
					{
						name: 'headerValues',
						displayName: 'Header',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: 'Name of the header',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to set for the header',
							},
						],
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Reply To',
						name: 'replyTo',
						type: 'string',
						default: '',
						description: 'Subject for receiving replies',
						placeholder: 'orders.replies',
						hint: 'Used with request-reply pattern',
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

		// Create NodeLogger once for the entire execution
		const nodeLogger = new NodeLogger(this.logger, this.getNode());

		try {
			nc = await createNatsConnection(credentials, nodeLogger);

			for (let i = 0; i < items.length; i++) {
				try {
					const subject = this.getNodeParameter('subject', i) as string;
					const data = this.getNodeParameter('data', i) as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					const headers = this.getNodeParameter('headers', i) as any;

					// Validate subject
					validateSubject(subject);

					const pubOptions: Partial<PublishOptions> = {
						headers: createNatsHeaders(headers),
					};
					if (options.replyTo) {
						pubOptions.reply = options.replyTo;
					}

					nc.publish(subject, data, pubOptions);

					returnData.push({
						json: {
							success: true,
							subject,
							timestamp: new Date().toISOString(),
						},
						pairedItem: { item: i },
					});
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
			throw new NodeOperationError(this.getNode(), `NATS publish failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
		}

		return [returnData];
	}
}
