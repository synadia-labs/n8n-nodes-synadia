import { createNatsConnection, closeNatsConnection, monitorNatsConnection, isConnectionAlive, ConnectionMonitoringOptions } from '../../utils/NatsConnection';
import { connect, credsAuthenticator, usernamePasswordAuthenticator, tokenAuthenticator } from '../../bundled/nats-bundled';

jest.mock('../../bundled/nats-bundled', () => ({
  connect: jest.fn(),
  credsAuthenticator: jest.fn(),
  usernamePasswordAuthenticator: jest.fn(),
  tokenAuthenticator: jest.fn(),
}));

describe('NatsConnection Integration Tests', () => {
  const mockConnect = connect as jest.MockedFunction<typeof connect>;
  const mockCredsAuthenticator = credsAuthenticator as jest.MockedFunction<typeof credsAuthenticator>;
  const mockUsernamePasswordAuthenticator = usernamePasswordAuthenticator as jest.MockedFunction<typeof usernamePasswordAuthenticator>;
  const mockTokenAuthenticator = tokenAuthenticator as jest.MockedFunction<typeof tokenAuthenticator>;
  
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

      await expect(createNatsConnection(credentials, mockLogger))
        .rejects.toThrow('Failed to connect to NATS: Connection failed');
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

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error draining NATS connection:',
        { error: expect.any(Error) }
      );
    });

    it('should not drain if connection is already closed', async () => {
      const mockNatsConnection = {
        drain: jest.fn(),
        isClosed: jest.fn().mockReturnValue(true),
      } as any;

      await closeNatsConnection(mockNatsConnection, mockLogger);

      expect(mockNatsConnection.isClosed).toHaveBeenCalled();
      expect(mockNatsConnection.drain).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should not log errors for connection already closed during drain', async () => {
      const mockNatsConnection = {
        drain: jest.fn().mockRejectedValue(new Error('connection closed')),
        isClosed: jest.fn().mockReturnValue(false),
      } as any;

      await closeNatsConnection(mockNatsConnection, mockLogger);

      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('monitorNatsConnection', () => {
    it('should set up connection monitoring with status events', async () => {
      const mockStatus = async function* () {
        yield { type: 'disconnect', server: 'nats://server1:4222' };
        yield { type: 'reconnect', server: 'nats://server2:4222' };
      };
      
      const mockNatsConnection = {
        getServer: jest.fn().mockReturnValue('nats://localhost:4222'),
        status: jest.fn().mockReturnValue(mockStatus()),
        closed: jest.fn().mockResolvedValue(undefined),
      } as any;

      const options: ConnectionMonitoringOptions = {
        onDisconnect: jest.fn(),
        onReconnect: jest.fn(),
        onStatus: jest.fn(),
      };

      monitorNatsConnection(mockNatsConnection, mockLogger, options);

      // Wait for status events to be processed
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockNatsConnection.status).toHaveBeenCalled();
      expect(options.onDisconnect).toHaveBeenCalledWith('nats://server1:4222');
      expect(options.onReconnect).toHaveBeenCalledWith('nats://server2:4222');
    });

    it('should handle various status event types', async () => {
      const mockStatus = async function* () {
        yield { type: 'error', error: new Error('Permission denied') };
        yield { type: 'ldm' };
        yield { type: 'ping', pendingPings: 2 };
        yield { type: 'staleConnection' };
        yield { type: 'update', added: ['server3'], removed: ['server1'] };
      };
      
      const mockNatsConnection = {
        getServer: jest.fn().mockReturnValue('nats://localhost:4222'),
        status: jest.fn().mockReturnValue(mockStatus()),
        closed: jest.fn().mockResolvedValue(undefined),
      } as any;

      const options: ConnectionMonitoringOptions = {
        onAsyncError: jest.fn(),
        onLameDuck: jest.fn(),
        onPing: jest.fn(),
        onStaleConnection: jest.fn(),
        onClusterUpdate: jest.fn(),
      };

      monitorNatsConnection(mockNatsConnection, mockLogger, options);

      // Wait for status events to be processed
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(options.onAsyncError).toHaveBeenCalledWith(expect.any(Error));
      expect(options.onLameDuck).toHaveBeenCalled();
      expect(options.onPing).toHaveBeenCalledWith(2);
      expect(options.onStaleConnection).toHaveBeenCalled();
      expect(options.onClusterUpdate).toHaveBeenCalledWith(['server3'], ['server1']);
    });

    it('should handle connection closed with error', async () => {
      const testError = new Error('Connection error');
      const mockNatsConnection = {
        getServer: jest.fn().mockReturnValue('nats://localhost:4222'),
        status: jest.fn().mockReturnValue((async function* () {})()),
        closed: jest.fn().mockResolvedValue(testError),
      } as any;

      const options: ConnectionMonitoringOptions = {
        onError: jest.fn(),
      };

      monitorNatsConnection(mockNatsConnection, mockLogger, options);

      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(options.onError).toHaveBeenCalledWith(testError);
    });
  });

  describe('isConnectionAlive', () => {
    it('should return true for alive connection', () => {
      const mockNatsConnection = {
        isClosed: jest.fn().mockReturnValue(false),
      } as any;

      expect(isConnectionAlive(mockNatsConnection)).toBe(true);
    });

    it('should return false for closed connection', () => {
      const mockNatsConnection = {
        isClosed: jest.fn().mockReturnValue(true),
      } as any;

      expect(isConnectionAlive(mockNatsConnection)).toBe(false);
    });
  });

  describe('createNatsConnection with monitoring', () => {
    it('should create connection with monitoring when requested', async () => {
      const mockNatsConnection = {
        getServer: jest.fn().mockReturnValue('nats://localhost:4222'),
        status: jest.fn().mockReturnValue((async function* () {})()),
        closed: jest.fn().mockResolvedValue(undefined),
      } as any;
      
      mockConnect.mockResolvedValue(mockNatsConnection);

      const credentials = {
        url: 'nats://localhost:4222',
        authenticationType: 'none',
      };

      const options: ConnectionMonitoringOptions = {
        monitor: true,
        onError: jest.fn(),
        onReconnect: jest.fn(),
      };

      await createNatsConnection(credentials, mockLogger, options);

      expect(mockNatsConnection.status).toHaveBeenCalled();
      expect(mockNatsConnection.closed).toHaveBeenCalled();
    });

    it('should not set up monitoring when not requested', async () => {
      const mockNatsConnection = {
        status: jest.fn(),
        closed: jest.fn(),
      } as any;
      
      mockConnect.mockResolvedValue(mockNatsConnection);

      const credentials = {
        url: 'nats://localhost:4222',
        authenticationType: 'none',
      };

      await createNatsConnection(credentials, mockLogger);

      expect(mockNatsConnection.status).not.toHaveBeenCalled();
      expect(mockNatsConnection.closed).not.toHaveBeenCalled();
    });
  });
});