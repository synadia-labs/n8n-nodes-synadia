import { INodeProperties } from 'n8n-workflow';

export const messagesDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['messages'],
			},
		},
		options: [
			{
				name: 'Publish',
				value: 'publish',
				description: 'Publish a message to a JetStream stream',
				action: 'Publish a message',
			},
		],
		default: 'publish',
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['publish'],
			},
		},
		default: '',
		placeholder: 'events.orders.new',
		description: 'Subject name for message routing (no spaces allowed)',
		hint: 'Use dots for hierarchy: events.orders.new, sensors.temperature.room1',
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['publish'],
			},
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
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['publish'],
			},
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
						default: '',
						placeholder: 'Content-Type',
						description: 'Header name',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						placeholder: 'application/json',
						description: 'Header value',
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
		displayOptions: {
			show: {
				resource: ['messages'],
				operation: ['publish'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Message ID',
				name: 'msgId',
				type: 'string',
				default: '',
				description: 'Optional message ID for deduplication',
				hint: 'Used with duplicate window for message deduplication',
			},
			{
				displayName: 'Expected Last Message ID',
				name: 'lastMsgId',
				type: 'string',
				default: '',
				description: 'Expected ID of the last message for optimistic concurrency',
			},
			{
				displayName: 'Expected Last Sequence',
				name: 'lastSequence',
				type: 'number',
				default: 0,
				description: 'Expected sequence number of the last message',
			},
			{
				displayName: 'Expected Stream',
				name: 'expectedStream',
				type: 'string',
				default: '',
				description: 'Expected stream name for validation',
			},
		],
	},
];