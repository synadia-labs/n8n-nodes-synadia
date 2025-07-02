import { INodeProperties } from 'n8n-workflow';

export const streamDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['stream'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new JetStream stream',
				action: 'Create a stream',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a JetStream stream',
				action: 'Delete a stream',
			},
			{
				name: 'Get Info',
				value: 'get',
				description: 'Get information about a JetStream stream',
				action: 'Get stream information',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all JetStream streams',
				action: 'List streams',
			},
			{
				name: 'Purge',
				value: 'purge',
				description: 'Purge all messages from a JetStream stream',
				action: 'Purge stream messages',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a JetStream stream configuration',
				action: 'Update a stream',
			},
		],
		default: 'create',
	},
	{
		displayName: 'Stream Name',
		name: 'streamName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['stream'],
				operation: ['create', 'delete', 'get', 'purge', 'update'],
			},
		},
		default: '',
		placeholder: 'EVENTS',
		description: 'Name of the JetStream stream (uppercase recommended)',
		hint: 'Stream names are typically uppercase and descriptive',
	},
	{
		displayName: 'Subject Filter',
		name: 'subject',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['stream'],
				operation: ['list'],
			},
		},
		default: '',
		placeholder: 'events.>',
		description: 'Optional subject pattern to filter streams',
		hint: 'Leave empty to list all streams',
	},
	{
		displayName: 'Stream Configuration',
		name: 'streamConfig',
		type: 'collection',
		placeholder: 'Add Configuration',
		displayOptions: {
			show: {
				resource: ['stream'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Subjects',
				name: 'subjects',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
				placeholder: 'events.orders, events.inventory',
				description: 'List of subjects this stream will consume',
				hint: 'Supports wildcards like events.* or events.>',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				placeholder: 'Stream for order processing events',
				description: 'Human-readable description of the stream',
			},
			{
				displayName: 'Storage Type',
				name: 'storage',
				type: 'options',
				options: [
					{
						name: 'File',
						value: 'file',
						description: 'Persistent storage on disk',
					},
					{
						name: 'Memory',
						value: 'memory',
						description: 'In-memory storage (faster but not persistent)',
					},
				],
				default: 'file',
				description: 'Storage backend for the stream',
			},
			{
				displayName: 'Retention Policy',
				name: 'retention',
				type: 'options',
				options: [
					{
						name: 'Limits',
						value: 'limits',
						description: 'Delete messages when limits are reached',
					},
					{
						name: 'Interest',
						value: 'interest',
						description: 'Delete messages when no consumers are interested',
					},
					{
						name: 'Work Queue',
						value: 'workqueue',
						description: 'Delete messages after acknowledgment',
					},
				],
				default: 'limits',
				description: 'Message retention policy',
			},
			{
				displayName: 'Max Messages',
				name: 'max_msgs',
				type: 'number',
				default: -1,
				description: 'Maximum number of messages to store (-1 for unlimited)',
			},
			{
				displayName: 'Max Messages Per Subject',
				name: 'max_msgs_per_subject',
				type: 'number',
				default: -1,
				description: 'Maximum messages per subject (-1 for unlimited)',
			},
			{
				displayName: 'Max Age (Seconds)',
				name: 'max_age',
				type: 'number',
				default: 0,
				description: 'Maximum age of messages in seconds (0 for unlimited)',
			},
			{
				displayName: 'Max Bytes',
				name: 'max_bytes',
				type: 'number',
				default: -1,
				description: 'Maximum total size in bytes (-1 for unlimited)',
			},
			{
				displayName: 'Max Message Size',
				name: 'max_msg_size',
				type: 'number',
				default: -1,
				description: 'Maximum individual message size in bytes (-1 for unlimited)',
			},
			{
				displayName: 'Discard Policy',
				name: 'discard',
				type: 'options',
				options: [
					{
						name: 'Old',
						value: 'old',
						description: 'Discard old messages when limits are reached',
					},
					{
						name: 'New',
						value: 'new',
						description: 'Reject new messages when limits are reached',
					},
				],
				default: 'old',
				description: 'Policy for discarding messages when limits are reached',
			},
			{
				displayName: 'Number of Replicas',
				name: 'num_replicas',
				type: 'number',
				default: 1,
				description: 'Number of replicas for the stream (1-5)',
				hint: 'Higher values provide better availability but use more resources',
			},
			{
				displayName: 'Max Consumers',
				name: 'max_consumers',
				type: 'number',
				default: -1,
				description: 'Maximum number of consumers for this stream (-1 for unlimited)',
			},
			{
				displayName: 'Duplicate Window (Nanoseconds)',
				name: 'duplicate_window',
				type: 'number',
				default: 0,
				description: 'Window for duplicate message detection in nanoseconds (0 to disable)',
			},
			{
				displayName: 'No Acknowledgments',
				name: 'no_ack',
				type: 'boolean',
				default: false,
				description: 'Whether to disable acknowledgments for this stream',
			},
		],
	},
];