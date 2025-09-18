import { INodeProperties } from 'n8n-workflow';

export const bucketOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['bucket'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new KV bucket',
				action: 'Create a new KV bucket',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a KV bucket',
				action: 'Delete a KV bucket',
			},
			{
				name: 'Get Status',
				value: 'get',
				description: 'Get status and information about a KV bucket',
				action: 'Get status of a KV bucket',
			},
		],
		default: 'get',
	},
];

export const bucketFields: INodeProperties[] = [
	{
		displayName: 'Bucket Name',
		name: 'bucket',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'my-bucket',
		displayOptions: {
			show: {
				resource: ['bucket'],
			},
		},
		description: 'Name of the KV bucket',
		hint: 'Bucket names can only contain alphanumeric characters, dashes, and underscores',
	},
	{
		displayName: 'Configuration',
		name: 'config',
		type: 'collection',
		placeholder: 'Add Configuration Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['bucket'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the KV bucket',
				placeholder: 'User preferences bucket',
			},
			{
				displayName: 'History Per Key',
				name: 'history',
				type: 'number',
				default: 1,
				description: 'Number of historical values to keep per key',
				hint: 'Set to 1 to only keep the latest value',
			},
			{
				displayName: 'Max Size (Bytes)',
				name: 'max_bytes',
				type: 'number',
				default: -1,
				description: 'The maximum size of the bucket (-1 = unlimited)',
			},
			{
				displayName: 'Max Value Size (Bytes)',
				name: 'maxValueSize',
				type: 'number',
				default: -1,
				description: 'Maximum size of a single value in bytes (-1 = unlimited)',
			},
			{
				displayName: 'Replicas',
				name: 'replicas',
				type: 'number',
				default: 1,
				description: 'Number of replicas for the bucket',
				hint: 'Higher numbers provide better fault tolerance',
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
				description: 'Storage backend for the bucket',
			},
			{
				displayName: 'TTL (Seconds)',
				name: 'ttl',
				type: 'number',
				default: 0,
				description:
					'The maximum number of seconds the key should live in the KV. The server will automatically remove keys older than this amount.',
				hint: 'Values older than this will be automatically deleted (0 = no TTL)',
			},
		],
	},
];
