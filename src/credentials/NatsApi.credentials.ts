import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NatsApi implements ICredentialType {
	name = 'natsApi';
	displayName = 'NATS API';
	documentationUrl = 'https://docs.nats.io';
	properties: INodeProperties[] = [
		{
			displayName: 'Connection Type',
			name: 'connectionType',
			type: 'options',
			options: [
				{
					name: 'Credentials',
					value: 'credentials',
					description: 'Connect using username/password',
				},
				{
					name: 'Credentials File',
					value: 'credsFile',
					description: 'Connect using Synadia Cloud .creds file',
				},
				{
					name: 'JWT',
					value: 'jwt',
					description: 'Connect using JWT authentication',
				},
				{
					name: 'NKey',
					value: 'nkey',
					description: 'Connect using NKey authentication',
				},
				{
					name: 'Token',
					value: 'token',
					description: 'Connect using auth token',
				},
				{
					name: 'URL',
					value: 'url',
					description: 'Connect using NATS URL(s)',
				},
			],
			default: 'url',
		},
		{
			displayName: 'Server URLs',
			name: 'servers',
			type: 'string',
			default: 'ws://localhost:8080',
			placeholder: 'ws://localhost:8080,wss://nats.example.com:443',
			description: 'Comma-separated list of NATS WebSocket URLs. Use ws:// for standard or wss:// for secure connections. For Synadia Cloud: wss://connect.ngs.global:443',
			hint: 'This package uses WebSocket connections exclusively. Legacy nats:// and tls:// URLs are automatically converted to ws:// and wss://.',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			displayOptions: {
				show: {
					connectionType: ['credentials'],
				},
			},
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					connectionType: ['credentials'],
				},
			},
			default: '',
		},
		{
			displayName: 'Auth Token',
			name: 'token',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					connectionType: ['token'],
				},
			},
			default: '',
		},
		{
			displayName: 'NKey Seed',
			name: 'nkeySeed',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					connectionType: ['nkey'],
				},
			},
			default: '',
			placeholder: 'SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY',
		},
		{
			displayName: 'JWT',
			name: 'jwt',
			type: 'string',
			typeOptions: {
				password: true,
				rows: 4,
			},
			displayOptions: {
				show: {
					connectionType: ['jwt'],
				},
			},
			default: '',
			description: 'JWT token for authentication',
		},
		{
			displayName: 'NKey for JWT',
			name: 'jwtNkey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			displayOptions: {
				show: {
					connectionType: ['jwt'],
				},
			},
			default: '',
			description: 'NKey seed to sign the JWT',
		},
		{
			displayName: 'Credentials File Content',
			name: 'credsFile',
			type: 'string',
			typeOptions: {
				password: true,
				rows: 10,
			},
			displayOptions: {
				show: {
					connectionType: ['credsFile'],
				},
			},
			default: '',
			placeholder: `Paste your entire .creds file content here`,
			description: 'Open your .creds file in a text editor, select all (Ctrl/Cmd+A), copy (Ctrl/Cmd+C), and paste here. The file must include both the JWT and NKEY sections with their BEGIN/END markers.',
			hint: 'Make sure to copy the ENTIRE file content including all the "-----BEGIN..." and "-----END..." lines',
		},
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			options: [
				{
					displayName: 'Name',
					name: 'name',
					type: 'string',
					default: '',
					description: 'Client name for connection identification',
				},
				{
					displayName: 'TLS',
					name: 'tls',
					type: 'boolean',
					default: false,
					description: 'Whether to use TLS encryption',
				},
				{
					displayName: 'TLS CA Certificate',
					name: 'tlsCaCert',
					type: 'string',
					typeOptions: {
						rows: 4,
					},
					displayOptions: {
						show: {
							tls: [true],
						},
					},
					default: '',
					description: 'CA certificate for TLS verification',
				},
				{
					displayName: 'TLS Client Certificate',
					name: 'tlsCert',
					type: 'string',
					typeOptions: {
						rows: 4,
					},
					displayOptions: {
						show: {
							tls: [true],
						},
					},
					default: '',
					description: 'Client certificate for TLS authentication',
				},
				{
					displayName: 'TLS Client Key',
					name: 'tlsKey',
					type: 'string',
					typeOptions: {
						rows: 4,
						password: true,
					},
					displayOptions: {
						show: {
							tls: [true],
						},
					},
					default: '',
					description: 'Client key for TLS authentication',
				},
				{
					displayName: 'Max Reconnect Attempts',
					name: 'maxReconnectAttempts',
					type: 'number',
					default: -1,
					description: 'Maximum number of reconnect attempts (-1 for infinite)',
				},
				{
					displayName: 'Reconnect Time Wait (Ms)',
					name: 'reconnectTimeWait',
					type: 'number',
					default: 2000,
					description: 'Time to wait between reconnect attempts',
				},
				{
					displayName: 'Connection Timeout (Ms)',
					name: 'timeout',
					type: 'number',
					default: 20000,
					description: 'Connection timeout in milliseconds',
				},
				{
					displayName: 'Ping Interval (Ms)',
					name: 'pingInterval',
					type: 'number',
					default: 120000,
					description: 'Ping interval in milliseconds',
				},
			],
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};
}