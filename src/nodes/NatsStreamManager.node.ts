import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';
import { jetstreamManager } from '../bundled/nats-bundled';
import { createNatsConnection, closeNatsConnection } from '../utils/NatsConnection';
import { validateStreamName, validateNumberRange } from '../utils/ValidationHelpers';
import { validateSubject } from '../utils/NatsHelpers';
import { NodeLogger } from '../utils/NodeLogger';

export class NatsStreamManager implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NATS Stream Manager',
		name: 'natsStreamManager',
		icon: 'file:../icons/nats.svg',
		group: ['transform'],
		version: 1,
		description: 'Manage NATS JetStream streams',
		subtitle: '{{$parameter["operation"]}} - {{$parameter["streamName"]}}',
		defaults: {
			name: 'NATS Stream Manager',
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Stream',
						value: 'createStream',
						description: 'Create a new JetStream stream',
						action: 'Create a new jet stream stream',
					},
					{
						name: 'Delete Stream',
						value: 'deleteStream',
						description: 'Delete a JetStream stream',
						action: 'Delete a jet stream stream',
					},
					{
						name: 'Get Info',
						value: 'getInfo',
						description: 'Get information about a stream',
						action: 'Get information about a stream',
					},
					{
						name: 'List Streams',
						value: 'listStreams',
						description: 'List all streams',
						action: 'List all streams',
					},
					{
						name: 'Purge Stream',
						value: 'purgeStream',
						description: 'Purge all messages from a stream',
						action: 'Purge all messages from a stream',
					},
					{
						name: 'Update Stream',
						value: 'updateStream',
						description: 'Update stream configuration',
						action: 'Update stream configuration',
					},
				],
				default: 'getInfo',
			},
			{
				displayName: 'Stream Name',
				name: 'streamName',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'ORDERS',
				description: 'Name of the JetStream stream',
				hint: 'Stream names should be uppercase and contain no spaces or dots',
				displayOptions: {
					hide: {
						operation: ['listStreams'],
					},
				},
			},
			{
				displayName: 'Subjects',
				name: 'subjects',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'orders.>, payments.*',
				description: 'Comma-separated list of subjects for the stream',
				hint: 'Use > for multi-token wildcard, * for single token wildcard',
				displayOptions: {
					show: {
						operation: ['createStream', 'updateStream'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['createStream', 'updateStream'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the stream',
						placeholder: 'Order processing stream',
					},
					{
						displayName: 'Retention Policy',
						name: 'retention',
						type: 'options',
						options: [
							{
								name: 'Limits',
								value: 'limits',
								description: 'Retain based on limits (default)',
							},
							{
								name: 'Interest',
								value: 'interest',
								description: 'Retain while consumers are interested',
							},
							{
								name: 'Work Queue',
								value: 'workqueue',
								description: 'Messages are removed after acknowledgment',
							},
						],
						default: 'limits',
						description: 'Message retention policy',
					},
					{
						displayName: 'Storage Type',
						name: 'storage',
						type: 'options',
						options: [
							{
								name: 'File',
								value: 'file',
								description: 'Store on disk',
							},
							{
								name: 'Memory',
								value: 'memory',
								description: 'Store in memory',
							},
						],
						default: 'file',
						description: 'Storage backend for the stream',
					},
					{
						displayName: 'Max Messages',
						name: 'maxMsgs',
						type: 'number',
						default: -1,
						description: 'Maximum number of messages to store (-1 = unlimited)',
					},
					{
						displayName: 'Max Bytes',
						name: 'maxBytes',
						type: 'number',
						default: -1,
						description: 'Maximum total size in bytes (-1 = unlimited)',
					},
					{
						displayName: 'Max Age (Seconds)',
						name: 'maxAge',
						type: 'number',
						default: 0,
						description: 'Maximum age of messages in seconds (0 = unlimited)',
					},
					{
						displayName: 'Max Message Size',
						name: 'maxMsgSize',
						type: 'number',
						default: -1,
						description: 'Maximum size of a single message (-1 = unlimited)',
					},
					{
						displayName: 'Replicas',
						name: 'replicas',
						type: 'number',
						default: 1,
						description: 'Number of replicas for the stream',
						hint: 'Higher numbers provide better fault tolerance',
					},
					{
						displayName: 'No Acknowledgment',
						name: 'noAck',
						type: 'boolean',
						default: false,
						description: 'Whether to disable acknowledgments for higher throughput',
					},
					{
						displayName: 'Discard Policy',
						name: 'discard',
						type: 'options',
						options: [
							{
								name: 'Old',
								value: 'old',
								description: 'Discard oldest messages when limits reached',
							},
							{
								name: 'New',
								value: 'new',
								description: 'Discard new messages when limits reached',
							},
						],
						default: 'old',
						description: 'Policy for discarding messages when limits are reached',
					},
					{
						displayName: 'Duplicate Window (Seconds)',
						name: 'duplicateWindow',
						type: 'number',
						default: 120,
						description: 'Window for duplicate message detection in seconds',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('natsApi');
		
		let nc;
		
		// Create NodeLogger once for the entire execution
		const nodeLogger = new NodeLogger(this.logger, this.getNode());
		
		try {
			nc = await createNatsConnection(credentials, nodeLogger);
			const jsm = await jetstreamManager(nc);
			
			for (let i = 0; i < items.length; i++) {
				try {
					const operation = this.getNodeParameter('operation', i) as string;
					let result: any = {};
					
					switch (operation) {
						case 'createStream':
						case 'updateStream': {
							const streamName = this.getNodeParameter('streamName', i) as string;
							const subjectsStr = this.getNodeParameter('subjects', i) as string;
							const options = this.getNodeParameter('options', i, {}) as any;
							
							// Validate stream name and subjects
							validateStreamName(streamName);
							const subjects = subjectsStr.split(',').map(s => s.trim());
							subjects.forEach(subject => validateSubject(subject));
							
							// Validate numeric options
							if (options.maxMsgs && options.maxMsgs < -1) {
								throw new NodeOperationError(this.getNode(), 'Max messages must be -1 or positive', { itemIndex: i });
							}
							if (options.maxBytes && options.maxBytes < -1) {
								throw new NodeOperationError(this.getNode(), 'Max bytes must be -1 or positive', { itemIndex: i });
							}
							if (options.maxAge && options.maxAge < 0) {
								throw new NodeOperationError(this.getNode(), 'Max age must be non-negative', { itemIndex: i });
							}
							if (options.replicas) {
								validateNumberRange(options.replicas, 1, Number.MAX_SAFE_INTEGER, 'Replicas');
							}
							
							const streamConfig: any = {
								name: streamName,
								subjects,
							};
							
							if (options.description) streamConfig.description = options.description;
							if (options.retention) streamConfig.retention = options.retention;
							if (options.storage) streamConfig.storage = options.storage === 'memory' ? 1 : 0;
							if (options.maxMsgs && options.maxMsgs > 0) streamConfig.max_msgs = options.maxMsgs;
							if (options.maxBytes && options.maxBytes > 0) streamConfig.max_bytes = options.maxBytes;
							if (options.maxAge) streamConfig.max_age = options.maxAge * 1000000000; // Convert to nanoseconds
							if (options.maxMsgSize && options.maxMsgSize > 0) streamConfig.max_msg_size = options.maxMsgSize;
							if (options.replicas) streamConfig.num_replicas = options.replicas;
							if (options.noAck) streamConfig.no_ack = options.noAck;
							if (options.discard) streamConfig.discard = options.discard;
							if (options.duplicateWindow) streamConfig.duplicate_window = options.duplicateWindow * 1000000000;
							
							if (operation === 'createStream') {
								const stream = await jsm.streams.add(streamConfig);
								result = {
									success: true,
									operation: 'createStream',
									streamName,
									info: stream,
								};
							} else {
								const stream = await jsm.streams.update(streamName, streamConfig);
								result = {
									success: true,
									operation: 'updateStream',
									streamName,
									info: stream,
								};
							}
							break;
						}
							
						case 'deleteStream': {
							const deleteStreamName = this.getNodeParameter('streamName', i) as string;
							validateStreamName(deleteStreamName);
							
							const deleted = await jsm.streams.delete(deleteStreamName);
							result = {
								success: deleted,
								operation: 'deleteStream',
								streamName: deleteStreamName,
							};
							break;
						}
							
						case 'getInfo': {
							const infoStreamName = this.getNodeParameter('streamName', i) as string;
							validateStreamName(infoStreamName);
							
							const info = await jsm.streams.info(infoStreamName);
							result = {
								success: true,
								operation: 'getInfo',
								streamName: infoStreamName,
								info,
							};
							break;
						}
							
						case 'listStreams': {
							const streams = [];
							for await (const stream of jsm.streams.list()) {
								streams.push(stream);
							}
							result = {
								success: true,
								operation: 'listStreams',
								streams,
								count: streams.length,
							};
							break;
						}
							
						case 'purgeStream': {
							const purgeStreamName = this.getNodeParameter('streamName', i) as string;
							validateStreamName(purgeStreamName);
							
							const purgeResult = await jsm.streams.purge(purgeStreamName);
							result = {
								success: true,
								operation: 'purgeStream',
								streamName: purgeStreamName,
								purged: purgeResult.purged,
							};
							break;
						}
							
						default:
							throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
					}
					
					returnData.push({
						json: {
							...result,
							timestamp: new Date().toISOString(),
						},
						pairedItem: { item: i },
					});
					
				} catch (error: any) {
					if (this.continueOnFail()) {
						returnData.push({
							json: {
								error: error.message,
								operation: this.getNodeParameter('operation', i) as string,
								streamName: this.getNodeParameter('streamName', i, '') as string,
							},
							pairedItem: { item: i },
						});
					} else {
						throw error;
					}
				}
			}
			
		} catch (error: any) {
			throw new NodeOperationError(this.getNode(), `NATS Stream Manager failed: ${error.message}`);
		} finally {
			if (nc!) {
				await closeNatsConnection(nc, nodeLogger);
			}
		}
		
		return [returnData];
	}
}