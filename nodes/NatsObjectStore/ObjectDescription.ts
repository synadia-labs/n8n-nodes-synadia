import { INodeProperties } from 'n8n-workflow';

export const objectOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['object'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{
				name: 'Get Object',
				value: 'get',
				description: 'Download an object from the bucket',
				action: 'Download an object from the bucket',
			},
			{
				name: 'Put Object',
				value: 'put',
				description: 'Upload data or file to the bucket',
				action: 'Upload data or file to the bucket',
			},
			{
				name: 'Delete Object',
				value: 'delete',
				description: 'Delete an object from the bucket',
				action: 'Delete an object from the bucket',
			},
			{
				name: 'Get Info',
				value: 'info',
				description: 'Get information about an object',
				action: 'Get information about an object',
			},
			{
				name: 'List Objects',
				value: 'list',
				description: 'List all objects in the bucket',
				action: 'List all objects in the bucket',
			},
		],
		default: 'get',
	},
];

export const objectFields: INodeProperties[] = [
	{
		displayName: 'Bucket Name',
		name: 'bucket',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'my-files',
		displayOptions: {
			show: {
				resource: ['object'],
			},
		},
		description: 'Name of the bucket (no spaces or dots allowed)',
		hint: 'Use only letters, numbers, hyphens, and underscores',
	},
	{
		displayName: 'Object Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['put', 'get', 'delete', 'info'],
			},
		},
		placeholder: 'reports/2024/sales.pdf',
		description: 'Name or path to the object (can include forward slashes for organization)',
		hint: 'Example: images/logo.png or documents/report.pdf',
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['object'],
				operation: ['put'],
			},
		},
		typeOptions: {
			rows: 4,
		},
		description: 'Content to store in the object',
		hint: 'Provide the data as you want it stored',
	},
];