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

export type ConnectionMonitoringOptions = {
	monitor?: boolean;
	onError?: (error: Error) => void;
	onStatus?: (status: any) => void;
	onDisconnect?: (server: string) => void;
	onReconnect?: (server: string) => void;
	onReconnecting?: () => void;
	onClusterUpdate?: (added: string[], removed: string[]) => void;
	onAsyncError?: (error: Error) => void;
	onLameDuck?: () => void;
	onPing?: (pendingPings: number) => void;
	onStaleConnection?: () => void;
	onForceReconnect?: () => void;
};

export async function createNatsConnection(
	credentials: ICredentialDataDecryptedObject,
	logger: Logger,
	options?: ConnectionMonitoringOptions
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
			monitorNatsConnection(nc, logger, options);
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
	options?: ConnectionMonitoringOptions
): Promise<void> {
	// Monitor connection status events in the background
	(async () => {
		try {
			logger.info(`NATS connected to ${nc.getServer()}`);
			
			for await (const status of nc.status()) {
				// Call general status callback if provided
				if (options?.onStatus) {
					options.onStatus(status);
				}
				
				switch (status.type) {
					case 'disconnect':
						logger.warn(`NATS disconnected from ${(status as any).server}`);
						if (options?.onDisconnect) {
							options.onDisconnect((status as any).server);
						}
						break;
						
					case 'reconnecting':
						logger.debug('NATS is reconnecting...');
						if (options?.onReconnecting) {
							options.onReconnecting();
						}
						break;
						
					case 'reconnect':
						logger.info(`NATS reconnected to ${(status as any).server}`);
						if (options?.onReconnect) {
							options.onReconnect((status as any).server);
						}
						break;
						
					case 'update':
						logger.info('NATS cluster configuration updated', {
							added: (status as any).added || [],
							removed: (status as any).removed || []
						});
						if (options?.onClusterUpdate) {
							options.onClusterUpdate(
								(status as any).added || [],
								(status as any).removed || []
							);
						}
						break;
						
					case 'error':
						logger.error('NATS async error:', { error: (status as any).error });
						if (options?.onAsyncError) {
							options.onAsyncError((status as any).error);
						}
						break;
						
					case 'ldm':
						logger.warn('NATS server entered lame duck mode - will evict clients');
						if (options?.onLameDuck) {
							options.onLameDuck();
						}
						break;
						
					case 'ping': {
						const pendingPings = (status as any).pendingPings || 0;
						if (pendingPings > 1) {
							logger.warn(`NATS ping timeout - ${pendingPings} pending pings`);
						} else {
							logger.debug(`NATS ping - ${pendingPings} pending`);
						}
						if (options?.onPing) {
							options.onPing(pendingPings);
						}
						break;
					}
						
					case 'staleConnection':
						logger.warn('NATS connection is stale - client will reconnect');
						if (options?.onStaleConnection) {
							options.onStaleConnection();
						}
						break;
						
					case 'forceReconnect':
						logger.debug('NATS forced reconnect initiated');
						if (options?.onForceReconnect) {
							options.onForceReconnect();
						}
						break;
						
					case 'close':
						logger.debug('NATS connection closed - no further reconnects will be attempted');
						break;
						
					default:
						logger.debug(`NATS status event: ${status.type}`, { status });
						break;
				}
			}
		} catch (error) {
			// Status monitoring loop ended - this is expected when connection closes
			logger.debug('NATS status monitoring ended', { error });
		}
	})().catch((err) => {
		// Unexpected error in status monitoring
		logger.error('Error in NATS status monitoring:', { error: err });
	});
	
	// Also monitor connection lifecycle with closed() promise
	nc.closed().then((err) => {
		if (err) {
			// Connection closed due to an error
			logger.error('NATS connection closed with error:', { error: err });
			if (options?.onError) {
				options.onError(err);
			}
		} else {
			// Connection closed normally
			logger.debug('NATS connection closed normally');
		}
	}).catch((err) => {
		// Unexpected error in monitoring
		logger.error('Error monitoring NATS connection closure:', { error: err });
	});
}

export function isConnectionAlive(nc: NatsConnection): boolean {
	return !nc.isClosed();
}