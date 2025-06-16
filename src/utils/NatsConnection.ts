import { ICredentialDataDecryptedObject, IExecuteFunctions, ILoadOptionsFunctions, ITriggerFunctions } from 'n8n-workflow';
import { connect, NatsConnection, ConnectionOptions, jwtAuthenticator, nkeyAuthenticator } from '../bundled';

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
	let servers = creds.servers.split(',').map(s => s.trim());
	
	// Convert NATS URLs to WebSocket URLs for NATS.ws
	servers = servers.map(server => {
		// Handle Synadia Cloud NGS URLs
		if (server.includes('connect.ngs.global')) {
			// Always use the WebSocket endpoint for NGS
			return 'wss://connect.ngs.global:443';
		}
		
		// Convert nats:// to ws:// and tls:// to wss://
		if (server.startsWith('nats://')) {
			return server.replace('nats://', 'ws://');
		} else if (server.startsWith('tls://')) {
			return server.replace('tls://', 'wss://');
		} else if (!server.startsWith('ws://') && !server.startsWith('wss://')) {
			// If no protocol specified, assume ws://
			return `ws://${server}`;
		}
		return server;
	});
	
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
					if (!jwt || !seed) {
						throw new Error('Credentials file appears to be empty or corrupted.');
					}
					
					// Additional validation - check expected format
					if (!jwt.includes('.') || seed.length < 50) {
						throw new Error('Credentials file content appears to be invalid. JWT should contain dots and seed should be at least 50 characters.');
					}
					
					connectionOptions.authenticator = jwtAuthenticator(
						jwt,
						new TextEncoder().encode(seed)
					);
				} else {
					// Provide more helpful error message
					const hasJwtBegin = credsContent.includes('-----BEGIN NATS USER JWT-----');
					const hasJwtEnd = credsContent.includes('------END NATS USER JWT------');
					const hasSeedBegin = credsContent.includes('-----BEGIN USER NKEY SEED-----');
					const hasSeedEnd = credsContent.includes('------END USER NKEY SEED------');
					
					let errorMsg = 'Invalid credentials file format. ';
					if (!hasJwtBegin || !hasJwtEnd) {
						errorMsg += 'Missing JWT section. ';
					}
					if (!hasSeedBegin || !hasSeedEnd) {
						errorMsg += 'Missing NKEY seed section. ';
					}
					errorMsg += 'Please paste the entire .creds file content including all BEGIN/END markers.';
					
					throw new Error(errorMsg);
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
		// Provide more helpful error messages
		if (error.message.includes('non-101 status code')) {
			throw new Error(
				`Failed to connect to NATS: WebSocket connection failed. ` +
				`Make sure your NATS server has WebSocket enabled on the specified port. ` +
				`Common issues: wrong port (use 8080 not 4222), WebSocket not enabled, or firewall blocking connection. ` +
				`See WEBSOCKET_SETUP.md for troubleshooting.`
			);
		} else if (error.message.includes('Authentication')) {
			throw new Error(
				`NATS authentication failed: ${error.message}. ` +
				`Check your credentials and ensure they are correctly formatted.`
			);
		}
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