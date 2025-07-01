import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import {
	connect,
	credsAuthenticator,
	usernamePasswordAuthenticator,
	tokenAuthenticator,
} from '../../bundled/nats-bundled';

jest.mock('../../bundled/nats-bundled', () => ({
	connect: jest.fn(),
	credsAuthenticator: jest.fn(),
	usernamePasswordAuthenticator: jest.fn(),
	tokenAuthenticator: jest.fn(),
}));

describe('NatsConnection Integration Tests', () => {
	const mockConnect = connect as jest.MockedFunction<typeof connect>;
	const mockCredsAuthenticator = credsAuthenticator as jest.MockedFunction<
		typeof credsAuthenticator
	>;
	const mockUsernamePasswordAuthenticator = usernamePasswordAuthenticator as jest.MockedFunction<
		typeof usernamePasswordAuthenticator
	>;
	const mockTokenAuthenticator = tokenAuthenticator as jest.MockedFunction<
		typeof tokenAuthenticator
	>;

	const mockLogger = {
		error: jest.fn(),
		warn: jest.fn(),
		info: jest.fn(),
		debug: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockConnect.mockResolvedValue({} as any);
		mockCredsAuthenticator.mockReturnValue({} as any);
		mockUsernamePasswordAuthenticator.mockReturnValue({} as any);
		mockTokenAuthenticator.mockReturnValue({} as any);
	});

	describe('createNatsConnection', () => {
		it('should create connection options with URL only for no authentication', async () => {
			const credentials = {
				url: 'nats://localhost:4222',
				authenticationType: 'none',
			};

			await createNatsConnection(credentials, mockLogger);

			expect(mockConnect).toHaveBeenCalledWith({
				servers: ['nats://localhost:4222'],
			});
		});

		it('should create connection options with username/password authentication', async () => {
			const credentials = {
				url: 'nats://localhost:4222',
				authenticationType: 'userpass',
				username: 'testuser',
				password: 'testpass',
			};

			await createNatsConnection(credentials, mockLogger);

			expect(mockUsernamePasswordAuthenticator).toHaveBeenCalledWith('testuser', 'testpass');
			expect(mockConnect).toHaveBeenCalledWith({
				servers: ['nats://localhost:4222'],
				authenticator: expect.anything(),
			});
		});

		it('should create connection options with token authentication', async () => {
			const credentials = {
				url: 'nats://localhost:4222',
				authenticationType: 'token',
				token: 'mytoken',
			};

			await createNatsConnection(credentials, mockLogger);

			expect(mockTokenAuthenticator).toHaveBeenCalledWith('mytoken');
			expect(mockConnect).toHaveBeenCalledWith({
				servers: ['nats://localhost:4222'],
				authenticator: expect.anything(),
			});
		});

		it('should create connection options with credentials file authentication', async () => {
			const credentials = {
				url: 'nats://localhost:4222',
				authenticationType: 'creds',
				credsFile: `-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJKV1QiLCJhbGciOiJlZDI1NTE5LW5rZXkifQ.eyJqdGkiOiJPRkhZSjRDTUNBS1c3NjZOQkVNR1YySkU1TEROUlBNN1dNRzZQSUFMTkFFVklTT0FKNklRIiwiaWF0IjoxNjA0ODU0MjUyLCJpc3MiOiJBQTQ0VjJJUEtZTFhGR0daQVFVRFU1SzVOWldHUEJCREhDVkhNTDNMWFE2R1VOWkxJRFVJWFJXUSIsInN1YiI6IlVBU0NLV041UFZMNFNHNFg1UU5RWUtRU0s1VlRKVTJYQlZZWVJOUUtOQ1FZWVFDTlFRUUJLSDRSIiwidHlwIjoianVuayIsIm5iZiI6MTYwNDg1NDI1Mn0.oSX9vJSq4VrEhsLkLPGJFWJJGxgUE1yVtShF8_vLG2KlU6KA6xMWJMcHKzJrZdO8TGhTr8-4-_k-6_xZ5-LQ
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
------END USER NKEY SEED------`,
			};

			await createNatsConnection(credentials, mockLogger);

			expect(mockCredsAuthenticator).toHaveBeenCalledWith(expect.any(Uint8Array));
			expect(mockConnect).toHaveBeenCalledWith({
				servers: ['nats://localhost:4222'],
				authenticator: expect.anything(),
			});
		});

		it('should create connection options with TLS enabled', async () => {
			const credentials = {
				url: 'nats://localhost:4222',
				authenticationType: 'none',
				options: {
					tlsEnabled: true,
					ca: 'ca-cert-content',
					cert: 'client-cert-content',
					key: 'client-key-content',
				},
			};

			await createNatsConnection(credentials, mockLogger);

			expect(mockConnect).toHaveBeenCalledWith({
				servers: ['nats://localhost:4222'],
				tls: {
					ca: 'ca-cert-content',
					cert: 'client-cert-content',
					key: 'client-key-content',
				},
			});
		});

		it('should create connection options with custom client name', async () => {
			const credentials = {
				url: 'nats://localhost:4222',
				authenticationType: 'none',
				options: {
					name: 'custom-client',
				},
			};

			await createNatsConnection(credentials, mockLogger);

			expect(mockConnect).toHaveBeenCalledWith({
				servers: ['nats://localhost:4222'],
				name: 'custom-client',
			});
		});

		it('should handle connection failure', async () => {
			const error = new Error('Connection failed');
			mockConnect.mockRejectedValue(error);

			const credentials = {
				url: 'nats://localhost:4222',
				authenticationType: 'none',
			};

			await expect(createNatsConnection(credentials, mockLogger)).rejects.toThrow(
				'Failed to connect to NATS: Connection failed',
			);
		});
	});

	describe('closeNatsConnection', () => {
		it('should handle close operation gracefully', async () => {
			const mockNatsConnection = {
				drain: jest.fn().mockResolvedValue(undefined),
				isClosed: jest.fn().mockReturnValue(false),
			} as any;

			await closeNatsConnection(mockNatsConnection, mockLogger);

			expect(mockNatsConnection.isClosed).toHaveBeenCalled();
			expect(mockNatsConnection.drain).toHaveBeenCalled();
		});

		it('should handle errors gracefully', async () => {
			const mockNatsConnection = {
				drain: jest.fn().mockRejectedValue(new Error('Drain failed')),
				isClosed: jest.fn().mockReturnValue(false),
			} as any;

			await closeNatsConnection(mockNatsConnection, mockLogger);

			expect(mockLogger.error).toHaveBeenCalledWith('Error draining NATS connection:', {
				error: expect.any(Error),
			});
		});

		it('should not log errors for connection already closed', async () => {
			const mockNatsConnection = {
				drain: jest.fn().mockRejectedValue(new Error('connection closed')),
				isClosed: jest.fn().mockReturnValue(false),
			} as any;

			await closeNatsConnection(mockNatsConnection, mockLogger);

			expect(mockLogger.error).not.toHaveBeenCalled();
		});
	});
});
