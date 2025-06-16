import { ICredentialDataDecryptedObject, IExecuteFunctions, ILoadOptionsFunctions, ITriggerFunctions } from 'n8n-workflow';
import { connect, NatsConnection, ConnectionOptions, jwtAuthenticator, nkeyAuthenticator } from '../bundled/nats-bundled';

export type NatsCredentials = {
	connectionType: 'url' | 'credentials' | 'token' | 'nkey' | 'jwt' | 'credsFile';
	servers: string;
	username?: string;
	password?: string;
	token?: string;
	nkeySeed?: string;
	jwt?: string;
	jwtNkey?: string;
	credsFile?: string;
	options?: {
		name?: string;
		tls?: boolean;
		tlsCaCert?: string;
		tlsCert?: string;
		tlsKey?: string;
		maxReconnectAttempts?: number;
		reconnectTimeWait?: number;
		timeout?: number;
		pingInterval?: number;
	};
};

export async function createNatsConnection(
	credentials: ICredentialDataDecryptedObject,
	_context?: IExecuteFunctions | ITriggerFunctions | ILoadOptionsFunctions,
): Promise<NatsConnection> {
	const creds = credentials as unknown as NatsCredentials;
	const servers = creds.servers.split(',').map(s => s.trim());
	
	const connectionOptions: ConnectionOptions = {
		servers,
		name: creds.options?.name || 'n8n-nats-client',
		maxReconnectAttempts: creds.options?.maxReconnectAttempts ?? -1,
		reconnectTimeWait: creds.options?.reconnectTimeWait ?? 2000,
		timeout: creds.options?.timeout ?? 20000,
		pingInterval: creds.options?.pingInterval ?? 120000,
	};

	// Handle authentication
	switch (creds.connectionType) {
		case 'credentials':
			if (creds.username && creds.password) {
				connectionOptions.user = creds.username;
				connectionOptions.pass = creds.password;
			}
			break;
		case 'token':
			if (creds.token) {
				connectionOptions.token = creds.token;
			}
			break;
		case 'nkey':
			if (creds.nkeySeed) {
				connectionOptions.authenticator = nkeyAuthenticator(new TextEncoder().encode(creds.nkeySeed));
			}
			break;
		case 'jwt':
			if (creds.jwt && creds.jwtNkey) {
				connectionOptions.authenticator = jwtAuthenticator(
					creds.jwt,
					new TextEncoder().encode(creds.jwtNkey)
				);
			}
			break;
		case 'credsFile':
			if (creds.credsFile) {
				// Parse the credentials file content - handle any whitespace/formatting
				const credsContent = creds.credsFile.trim();
				
				// Very flexible regex that handles any whitespace between sections
				const jwtMatch = credsContent.match(/-----BEGIN NATS USER JWT-----\s*([\s\S]*?)\s*------END NATS USER JWT------/);
				const seedMatch = credsContent.match(/-----BEGIN USER NKEY SEED-----\s*([\s\S]*?)\s*------END USER NKEY SEED------/);
				
				if (jwtMatch && seedMatch) {
					// Extract and clean the JWT and seed - remove ALL whitespace and newlines
					const jwt = jwtMatch[1].replace(/\s/g, '');
					const seed = seedMatch[1].replace(/\s/g, '');
					
					// Debug logging (only in development)
					if (process.env.NODE_ENV === 'development' || process.env.NATS_DEBUG) {
						console.log('NATS Creds Debug:');
						console.log('- JWT length:', jwt.length);
						console.log('- JWT preview:', jwt.substring(0, 20) + '...');
						console.log('- Seed length:', seed.length);
						console.log('- Seed preview:', seed.substring(0, 20) + '...');
					}
					
					// Validate that we have actual content
					if (!jwt || !seed || jwt.length < 20 || seed.length < 20) {
						throw new Error('Invalid credentials file format. JWT or seed appears to be empty or malformed.');
					}
					
					connectionOptions.authenticator = jwtAuthenticator(
						jwt,
						new TextEncoder().encode(seed)
					);
				} else {
					throw new Error('Invalid credentials file format. Please paste the entire .creds file content including the BEGIN/END markers.');
				}
			}
			break;
	}

	// Handle TLS
	if (creds.options?.tls) {
		connectionOptions.tls = {
			ca: creds.options.tlsCaCert,
			cert: creds.options.tlsCert,
			key: creds.options.tlsKey,
		};
	}

	try {
		const nc = await connect(connectionOptions);
		return nc;
	} catch (error: any) {
		throw new Error(`Failed to connect to NATS: ${error.message}`);
	}
}

export async function closeNatsConnection(nc: NatsConnection): Promise<void> {
	try {
		await nc.drain();
		await nc.close();
	} catch (error: any) {
		console.error('Error closing NATS connection:', error);
	}
}