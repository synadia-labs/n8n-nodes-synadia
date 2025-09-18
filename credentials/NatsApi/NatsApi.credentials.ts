import { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

export class NatsApi implements ICredentialType {
	name = 'natsApi';
	displayName = 'NATS API';
	documentationUrl = 'https://docs.nats.io';
	properties: INodeProperties[] = [
		{
			displayName: 'Server URL',
			name: 'url',
			type: 'string',
			default: 'nats://localhost:4222',
			placeholder: 'nats://localhost:4222',
			description: 'NATS server URL. For Synadia Cloud, use: tls://connect.ngs.global.',
			required: true,
		},
		{
			displayName: 'Authentication Type',
			name: 'authenticationType',
			type: 'options',
			options: [
				{
					name: 'No Authentication',
					value: 'none',
					description: 'Connect without authentication',
				},
				{
					name: 'Credentials',
					value: 'creds',
					description: 'Connect using .creds file content',
				},
				{
					name: 'Username/Password',
					value: 'userpass',
					description: 'Connect using username and password',
				},
				{
					name: 'Token',
					value: 'token',
					description: 'Connect using auth token',
				},
			],
			default: 'none',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			displayOptions: {
				show: {
					authenticationType: ['userpass'],
				},
			},
			default: '',
			required: true,
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
					authenticationType: ['userpass'],
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
					authenticationType: ['token'],
				},
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Credentials File Content',
			name: 'credsFile',
			type: 'string',
			typeOptions: {
				rows: 10,
			},
			displayOptions: {
				show: {
					authenticationType: ['creds'],
				},
			},
			default: '',
			placeholder: `-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ...
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
------END USER NKEY SEED------`,
			description: 'Paste the entire contents of your .creds file here',
			required: true,
		},
		{
			displayName: 'Client Name',
			name: 'name',
			type: 'string',
			default: '',
			description: 'Client name for connection identification',
		},
		{
			displayName: 'Enable TLS',
			name: 'tlsEnabled',
			type: 'boolean',
			default: false,
			description: 'Whether to enable TLS encryption',
		},
		{
			displayName: 'TLS CA Certificate',
			name: 'ca',
			type: 'string',
			typeOptions: {
				rows: 4,
			},
			displayOptions: {
				show: {
					tlsEnabled: [true],
				},
			},
			default: '',
			description: 'CA certificate for TLS verification',
		},
		{
			displayName: 'TLS Client Certificate',
			name: 'cert',
			type: 'string',
			typeOptions: {
				rows: 4,
			},
			displayOptions: {
				show: {
					tlsEnabled: [true],
				},
			},
			default: '',
			description: 'Client certificate for TLS authentication',
		},
		{
			displayName: 'TLS Client Key',
			name: 'key',
			type: 'string',
			typeOptions: {
				rows: 4,
				password: true,
			},
			displayOptions: {
				show: {
					tlsEnabled: [true],
				},
			},
			default: '',
			description: 'Client key for TLS authentication',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};
}
