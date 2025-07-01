import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import { jetstreamManager, StreamConfig } from '../../bundled/nats-bundled';
import { closeNatsConnection, createNatsConnection } from '../../utils/NatsConnection';
import { NodeLogger } from '../../utils/NodeLogger';
import { StreamOperationParams } from './StreamOperationHandler';
import { streamOperationHandlers } from './operations';

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
						value: 'create',
						description: 'Create a new JetStream stream',
						action: 'Create a new jet stream stream',
					},
					{
						name: 'Delete Stream',
						value: 'delete',
						description: 'Delete a JetStream stream',
						action: 'Delete a jet stream stream',
					},
					{
						name: 'Get Info',
						value: 'get',
						description: 'Get information about a stream',
						action: 'Get information about a stream',
					},
					{
						name: 'List Streams',
						value: 'list',
						description: 'List all streams',
						action: 'List all streams',
					},
					{
						name: 'Purge Stream',
						value: 'purge',
						description: 'Purge all messages from a stream',
						action: 'Purge all messages from a stream',
					},
					{
						name: 'Update Stream',
						value: 'update',
						description: 'Update stream configuration',
						action: 'Update stream configuration',
					},
				],
				default: 'get',
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
						operation: ['get', 'update', 'delete', 'purge'],
					},
				},
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				placeholder: 'orders.my-order',
				description: 'An optional subject for which to list the stream',
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
			},
			{
				displayName: 'Config',
				name: 'streamConfig',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Subjects',
						name: 'subjects',
						type: 'string',
						typeOptions: {
							multipleValues: true,
						},
						default: '',
						description: 'A list of subjects to consume, supports wildcards',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the stream',
						placeholder: 'Order processing stream',
					},
					{
						displayName: 'Max Messages Per Subject',
						name: 'max_msgs_per_subject',
						type: 'number',
						default: -1,
						description:
							'For wildcard streams ensure that for every unique subject this many messages are kept - a per subject retention limit',
					},
					{
						displayName: 'Max Messages',
						name: 'max_msgs',
						type: 'number',
						default: -1,
						description:
							'How many messages may be in a stream, oldest messages will be removed if the stream exceeds this size (-1 for unlimited)',
					},
					{
						displayName: 'Max Age (Seconds)',
						name: 'max_age',
						type: 'number',
						default: 0,
						description: 'Maximum age of messages in seconds (0 = unlimited)',
					},
					{
						displayName: 'Max Bytes',
						name: 'max_bytes',
						type: 'number',
						default: -1,
						description: 'Maximum total size in bytes (-1 = unlimited)',
					},
					{
						displayName: 'Max Message Size',
						name: 'max_msg_size',
						type: 'number',
						default: -1,
						description: 'Maximum size of a single message (-1 = unlimited)',
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
						displayName: 'Discard New Per Subject',
						name: 'discard_new_per_subject',
						type: 'boolean',
						default: false,
						description: 'Whether messages should be discarded on a per subject basis',
					},
					{
						displayName: 'No Acknowledgment',
						name: 'no_ack',
						type: 'boolean',
						default: false,
						description: 'Whether to disable acknowledgments for higher throughput',
					},
					{
						displayName: 'Duplicate Window',
						name: 'duplicate_window',
						type: 'number',
						default: 0,
						description: 'Window for duplicate message detection in nanoseconds',
					},
					{
						displayName: 'Replicas',
						name: 'num_replicas',
						type: 'number',
						default: 1,
						description: 'Number of replicas for the stream',
						hint: 'Higher numbers provide better fault tolerance',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'A unique name for the Stream',
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
						displayName: 'Max Consumers',
						name: 'max_consumers',
						type: 'number',
						default: -1,
						description: 'How many Consumers can be defined for a given Stream. -1 for unlimited.',
					},
					{
						displayName: 'Placement Cluster',
						name: 'placement_cluster',
						type: 'string',
						default: '',
						description: 'The cluster to place the stream on (placement directives)',
					},
					{
						displayName: 'Placement Tags',
						name: 'placement_tags',
						type: 'string',
						typeOptions: {
							multipleValues: true,
						},
						default: [],
						description: 'Tags matching server configuration (placement directives)',
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
				// Get the handler for this operation
				const operation = this.getNodeParameter('operation', i) as string;
				const handler = streamOperationHandlers[operation];
				if (!handler) {
					const error = `Unknown operation: ${operation}`;
					if (!this.continueOnFail()) throw error;

					returnData.push({
						error: new NodeOperationError(this.getNode(), error, { itemIndex: i }),
						json: {
							operation,
						},
						pairedItem: i,
					});
					continue;
				}

				// Prepare parameters based on operation requirements
				const params: StreamOperationParams = {
					streamName: this.getNodeParameter('streamName', i) as string,
					streamConfig: this.getNodeParameter('streamConfig', i) as StreamConfig,
					subject: this.getNodeParameter('subject', i) as string,
				};

				try {
					let result = await handler.execute(jsm, params);

					// Execute the operation
					returnData.push({
						json: result,
						pairedItem: i,
					});
				} catch (error: any) {
					if (!this.continueOnFail()) throw error;

					returnData.push({
						error: new NodeOperationError(this.getNode(), error, { itemIndex: i }),
						json: {
							params: params,
						},
						pairedItem: i,
					});
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
