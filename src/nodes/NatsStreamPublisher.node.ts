import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { NatsConnection, jetstream } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { encodeMessage, createNatsHeaders, validateSubject } from '../utils/NatsHelpers';
import { NodeLogger } from '../utils/NodeLogger';
import { validateStreamName, validateTimeout } from '../utils/ValidationHelpers';

export class NatsStreamPublisher implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Stream Publisher',
		name: 'natsStreamPublisher',
		icon: 'file:../icons/nats.svg',
		group: ['output'],
		version: 1,
		description: 'Publish messages to NATS JetStream streams with guaranteed delivery',
		subtitle: '{{$parameter["streamName"]}} - {{$parameter["subject"]}}',
		defaults: {
			name: 'NATS Stream Publisher',
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
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '{{ $json }}',
				description: 'Message content to publish',
				hint: 'Supports expressions like {{ $json }} to use input data',
			},
			{
				displayName: 'Stream Name',
				name: 'streamName',
				type: 'string',
				default: '',
				description: 'Target stream name (auto-detected if not specified)',
				placeholder: 'ORDERS',
				hint: 'Leave empty to let JetStream find the appropriate stream',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Headers',
						name: 'headers',
						type: 'json',
						typeOptions: {
							rows: 4,
						},
						default: '{}',
						description: 'Custom headers as JSON object',
						placeholder: '{"X-Order-Type": "express", "X-Priority": "high"}',
						hint: 'Headers can be used for routing and metadata',
					},
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						type: 'number',
						default: 5000,
						description: 'Maximum time to wait for acknowledgment (milliseconds)',
						hint: 'Message will timeout if not acknowledged in time',
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
			const js = jetstream(nc);
			
			for (let i = 0; i < items.length; i++) {
				try {
					const subject = this.getNodeParameter('subject', i) as string;
					const message = this.getNodeParameter('message', i) as string;
					const streamName = this.getNodeParameter('streamName', i, '') as string;
					const options = this.getNodeParameter('options', i, {}) as any;
					
					// Validate subject
					validateSubject(subject);
					
					// Validate timeout if specified
					if (options.timeout) {
						validateTimeout(options.timeout, 'Timeout');
					}
					
					// Validate stream name if specified
					if (streamName) {
						validateStreamName(streamName);
					}
					
					
					// Encode message using JSON encoding
					const encodedMessage = encodeMessage(message, 'json');
					
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
					
					// JetStream publish
					const pubOptions: any = { 
						headers,
						timeout: options.timeout || 5000,
					};
					
					
					const ack = await js.publish(subject, encodedMessage, pubOptions);
					
					returnData.push({
						json: {
							success: true,
							subject,
							message: message,
							stream: ack.stream,
							sequence: ack.seq,
							duplicate: ack.duplicate,
							timestamp: new Date().toISOString(),
						},
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
			throw new NodeOperationError(this.getNode(), `NATS Stream Publisher failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
		}
		
		return [returnData];
	}
}