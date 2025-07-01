import { INodeProperties } from 'n8n-workflow';

export const consumersDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['consumers'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new JetStream consumer',
				action: 'Create a consumer',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a JetStream consumer',
				action: 'Delete a consumer',
			},
			{
				name: 'Get Info',
				value: 'get',
				description: 'Get information about a JetStream consumer',
				action: 'Get consumer information',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all consumers for a stream',
				action: 'List consumers',
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
				resource: ['consumers'],
			},
		},
		default: '',
		placeholder: 'EVENTS',
		description: 'Name of the JetStream stream',
		hint: 'The stream must exist before creating consumers',
	},
	{
		displayName: 'Consumer Name',
		name: 'consumerName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['consumers'],
				operation: ['delete', 'get'],
			},
		},
		default: '',
		placeholder: 'order-processor',
		description: 'Name of the consumer to delete or get information about',
	},
	{
		displayName: 'Consumer Configuration',
		name: 'consumerConfig',
		type: 'collection',
		placeholder: 'Add Configuration',
		displayOptions: {
			show: {
				resource: ['consumers'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Consumer Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'order-processor',
				description: 'Name of the consumer (required for durable consumers)',
				hint: 'Leave empty for ephemeral consumers',
			},
			{
				displayName: 'Durable Name',
				name: 'durable_name',
				type: 'string',
				default: '',
				placeholder: 'order-processor',
				description: 'Durable consumer name (persists across restarts)',
				hint: 'Required for durable consumers',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				placeholder: 'Processes order events',
				description: 'Human-readable description of the consumer',
			},
			{
				displayName: 'Delivery Policy',
				name: 'deliver_policy',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'all',
						description: 'Deliver all messages in the stream',
					},
					{
						name: 'By Start Sequence',
						value: 'by_start_sequence',
						description: 'Start from a specific sequence number',
					},
					{
						name: 'By Start Time',
						value: 'by_start_time',
						description: 'Start from a specific timestamp',
					},
					{
						name: 'Last',
						value: 'last',
						description: 'Deliver only the last message',
					},
					{
						name: 'Last Per Subject',
						value: 'last_per_subject',
						description: 'Deliver the last message for each subject',
					},
					{
						name: 'New',
						value: 'new',
						description: 'Deliver only new messages',
					},
				],
				default: 'all',
				description: 'Policy for message delivery',
			},
			{
				displayName: 'Acknowledgment Policy',
				name: 'ack_policy',
				type: 'options',
				options: [
					{
						name: 'Explicit',
						value: 'explicit',
						description: 'Messages must be explicitly acknowledged',
					},
					{
						name: 'All',
						value: 'all',
						description: 'Acknowledging a message acknowledges all previous messages',
					},
					{
						name: 'None',
						value: 'none',
						description: 'No acknowledgments required',
					},
				],
				default: 'explicit',
				description: 'Policy for message acknowledgment',
			},
			{
				displayName: 'Filter Subject',
				name: 'filter_subject',
				type: 'string',
				default: '',
				placeholder: 'events.orders.>',
				description: 'Subject filter for this consumer',
				hint: 'Only receive messages matching this pattern',
			},
			{
				displayName: 'Start Sequence',
				name: 'opt_start_seq',
				type: 'number',
				displayOptions: {
					show: {
						deliver_policy: ['by_start_sequence'],
					},
				},
				default: 1,
				description: 'Starting sequence number for delivery',
			},
			{
				displayName: 'Start Time',
				name: 'opt_start_time',
				type: 'string',
				displayOptions: {
					show: {
						deliver_policy: ['by_start_time'],
					},
				},
				default: '',
				placeholder: '2024-01-01T00:00:00Z',
				description: 'Starting timestamp for delivery (ISO format)',
			},
			{
				displayName: 'Acknowledgment Wait (Seconds)',
				name: 'ack_wait',
				type: 'number',
				default: 30,
				description: 'Time to wait for acknowledgment before redelivery',
			},
			{
				displayName: 'Max Deliver',
				name: 'max_deliver',
				type: 'number',
				default: -1,
				description: 'Maximum delivery attempts (-1 for unlimited)',
			},
			{
				displayName: 'Max Ack Pending',
				name: 'max_ack_pending',
				type: 'number',
				default: 20000,
				description: 'Maximum number of outstanding acknowledgments',
			},
			{
				displayName: 'Max Waiting',
				name: 'max_waiting',
				type: 'number',
				default: 512,
				description: 'Maximum number of outstanding pull requests',
			},
			{
				displayName: 'Number of Replicas',
				name: 'num_replicas',
				type: 'number',
				default: 0,
				description: 'Number of replicas for the consumer (0 inherits from stream)',
			},
		],
	},
];