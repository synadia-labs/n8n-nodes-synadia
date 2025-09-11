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
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new Object Store bucket',
				action: 'Create a new object store bucket',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an Object Store bucket',
				action: 'Delete an object store bucket',
			},
			{
				name: 'Get Status',
				value: 'get',
				description: 'Get status of an Object Store bucket',
				action: 'Get status of an object store bucket',
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
		placeholder: 'my-files',
		displayOptions: {
			show: {
				resource: ['bucket'],
			},
		},
		description: 'Name of the Object Store bucket',
		hint: 'Bucket names can only contain alphanumeric characters, dashes, and underscores',
	},
	{
		displayName: 'Config',
		name: 'config',
		type: 'collection',
		placeholder: 'Add Config Option',
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
				description: 'Description of the Object Store bucket',
				placeholder: 'File storage bucket',
			},
			{
				displayName: 'TTL (Seconds)',
				name: 'ttl',
				type: 'number',
				default: 0,
				description: 'Time-to-live for objects in seconds (0 = unlimited)',
				hint: 'Objects older than this will be automatically deleted',
			},
			{
				displayName: 'Max Bucket Size (Bytes)',
				name: 'max_bytes',
				type: 'number',
				default: -1,
				description: 'Maximum total size of the bucket in bytes (-1 = unlimited)',
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
				displayName: 'Replicas',
				name: 'replicas',
				type: 'number',
				default: 1,
				description: 'Number of replicas for the bucket',
				hint: 'Higher numbers provide better fault tolerance',
			},
		],
	},
];
