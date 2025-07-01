import { INodeProperties } from 'n8n-workflow';

export const keyOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['key'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a value from a KV bucket',
				action: 'Get a value from a KV bucket',
			},
			{
				name: 'Put',
				value: 'put',
				description: 'Put a value into a KV bucket',
				action: 'Put a value into a KV bucket',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a key from a KV bucket',
				action: 'Delete a key from a KV bucket',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all keys in a KV bucket',
				action: 'List all keys in a KV bucket',
			},
			{
				name: 'History',
				value: 'history',
				description: 'Get revision history for a key',
				action: 'Get history for a key',
			},
		],
		default: 'get',
	},
];

export const keyFields: INodeProperties[] = [
	{
		displayName: 'Bucket Name',
		name: 'bucket',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'my-bucket',
		displayOptions: {
			show: {
				resource: ['key'],
			},
		},
		description:
			'The name of the KV bucket to operate on. Must contain only letters, numbers, underscores, and hyphens (no spaces or dots).',
		hint: 'Example: user-preferences, app-config, cache-data',
	},
	{
		displayName: 'Key',
		name: 'key',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'user.123.settings',
		displayOptions: {
			show: {
				resource: ['key'],
				operation: ['get', 'put', 'delete', 'history'],
			},
		},
		description:
			'The key to operate on. Can use dots for hierarchical organization (e.g., "user.123.settings"). Cannot contain spaces.',
		hint: 'Example: config.database.host, user.profile.avatar, session.abc123',
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['key'],
				operation: ['put'],
			},
		},
		typeOptions: {
			rows: 4,
		},
		description: 'The value to store in the KV bucket',
		placeholder: '{"name": "John", "age": 30}',
	},
];