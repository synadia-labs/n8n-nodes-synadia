import { ICredentialDataDecryptedObject, ApplicationError, NodeApiError, Logger } from 'n8n-workflow';
import { NodeLogger } from './NodeLogger';
import { connect, NatsConnection, ConnectionOptions, credsAuthenticator, usernamePasswordAuthenticator, tokenAuthenticator } from '../bundled/nats-bundled';

export type NatsCredentials = {
	url: string;
	authenticationType: 'none' | 'creds' | 'userpass' | 'token';
	username?: string;
	password?: string;
	token?: string;
	credsFile?: string;
	options?: {
		name?: string;
		tlsEnabled?: boolean;
		ca?: string;
		cert?: string;
		key?: string;
	};
};

export async function createNatsConnection(
	credentials: ICredentialDataDecryptedObject,
	logger: Logger,
	options?: {
		monitor?: boolean;
		onError?: (error: Error) => void;
	}
): Promise<NatsConnection> {
	const creds = credentials as unknown as NatsCredentials;
	
	const connectionOptions: ConnectionOptions = {
		servers: [creds.url],
	};

	// Add optional client name if specified
	if (creds.options?.name) {
		connectionOptions.name = creds.options.name;
	}

	// Handle authentication
	switch (creds.authenticationType) {
		case 'userpass':
			if (creds.username && creds.password) {
				connectionOptions.authenticator = usernamePasswordAuthenticator(creds.username, creds.password);
			}
			break;
		case 'token':
			if (creds.token) {
				connectionOptions.authenticator = tokenAuthenticator(creds.token);
			}
			break;
		case 'creds':
			if (creds.credsFile) {
				connectionOptions.authenticator = credsAuthenticator(new TextEncoder().encode(creds.credsFile));
			}
			break;
		case 'none':
		default:
			// No authentication required
			break;
	}

	// Handle TLS if enabled
	if (creds.options?.tlsEnabled) {
		const tlsConfig: any = {};
		if (creds.options.ca) tlsConfig.ca = creds.options.ca;
		if (creds.options.cert) tlsConfig.cert = creds.options.cert;
		if (creds.options.key) tlsConfig.key = creds.options.key;
		
		// Only add TLS config if there are actual TLS options specified
		if (Object.keys(tlsConfig).length > 0 || creds.options.tlsEnabled) {
			connectionOptions.tls = tlsConfig;
		}
	}


	try {
		const nc = await connect(connectionOptions);
		
		// Set up connection monitoring if requested
		if (options?.monitor) {
			monitorNatsConnection(nc, logger, options.onError);
		}
		
		return nc;
	} catch (error: any) {
		// For connection errors, we use NodeApiError when we have a NodeLogger with node context
		if (logger instanceof NodeLogger) {
			throw new NodeApiError(logger.getNode(), error, {
				message: `Failed to connect to NATS: ${error.message}`,
			});
		} else {
			// Fallback to ApplicationError when no node context is available
			throw new ApplicationError(`Failed to connect to NATS: ${error.message}`, {
				level: 'error',
				tags: { nodeType: 'n8n-nodes-synadia.nats' },
				cause: error,
			});
		}
	}
}

export async function closeNatsConnection(nc: NatsConnection, logger: Logger): Promise<void> {
	try {
		// Check if connection is still alive before attempting to drain
		if (nc.isClosed()) {
			return; // Connection already closed
		}
		
		// drain() automatically closes the connection, no need to call close() separately
		await nc.drain();
	} catch (error: any) {
		// Log error but don't throw - connection may already be closed
		// This is expected behavior during shutdown
		if (error.message && !error.message.includes('closed')) {
			// Only log unexpected errors
			logger.error('Error draining NATS connection:', { error });
		}
	}
}

export async function monitorNatsConnection(
	nc: NatsConnection, 
	logger: Logger, 
	onError?: (error: Error) => void
): Promise<void> {
	// Monitor connection lifecycle in the background
	nc.closed().then((err) => {
		if (err) {
			// Connection closed due to an error
			logger.error('NATS connection closed with error:', { error: err });
			if (onError) {
				onError(err);
			}
		} else {
			// Connection closed normally
			logger.debug('NATS connection closed normally');
		}
	}).catch((err) => {
		// Unexpected error in monitoring
		logger.error('Error monitoring NATS connection:', { error: err });
	});
}

export function isConnectionAlive(nc: NatsConnection): boolean {
	return !nc.isClosed();
}