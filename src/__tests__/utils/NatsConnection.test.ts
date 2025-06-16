import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { connect, NatsConnection } from 'nats';

// Mock the nats module
jest.mock('nats', () => ({
  connect: jest.fn(),
  credsAuthenticator: jest.fn(),
  jwtAuthenticator: jest.fn(),
  nkeyAuthenticator: jest.fn(),
}));

describe('NatsConnection', () => {
  const mockNatsConnection = {
    drain: jest.fn(),
    close: jest.fn(),
  } as unknown as NatsConnection;

  beforeEach(() => {
    jest.clearAllMocks();
    (connect as jest.Mock).mockResolvedValue(mockNatsConnection);
  });

  describe('createNatsConnection', () => {
    it('should create connection with basic URL configuration', async () => {
      const credentials = {
        connectionType: 'url',
        servers: 'ws://localhost:8080',
      };

      const nc = await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith({
        servers: ['ws://localhost:8080'],
        name: 'n8n-nats-client',
        maxReconnectAttempts: -1,
        reconnectTimeWait: 2000,
        timeout: 20000,
        pingInterval: 120000,
      });
      expect(nc).toBe(mockNatsConnection);
    });

    it('should handle multiple servers', async () => {
      const credentials = {
        connectionType: 'url',
        servers: 'ws://server1:8080, wss://server2:443',
      };

      await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          servers: ['ws://server1:8080', 'wss://server2:443'],
        })
      );
    });

    it('should handle username/password authentication', async () => {
      const credentials = {
        connectionType: 'credentials',
        servers: 'ws://localhost:8080',
        username: 'testuser',
        password: 'testpass',
      };

      await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          user: 'testuser',
          pass: 'testpass',
        })
      );
    });

    it('should handle token authentication', async () => {
      const credentials = {
        connectionType: 'token',
        servers: 'ws://localhost:8080',
        token: 'mytoken',
      };

      await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'mytoken',
        })
      );
    });

    it('should handle NKey authentication', async () => {
      const { nkeyAuthenticator } = require('nats');
      const mockAuthenticator = jest.fn();
      nkeyAuthenticator.mockReturnValue(mockAuthenticator);

      const credentials = {
        connectionType: 'nkey',
        servers: 'ws://localhost:8080',
        nkeySeed: 'SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY',
      };

      await createNatsConnection(credentials);

      expect(nkeyAuthenticator).toHaveBeenCalled();
      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          authenticator: mockAuthenticator,
        })
      );
    });

    it('should handle JWT authentication', async () => {
      const { jwtAuthenticator } = require('nats');
      const mockAuthenticator = jest.fn();
      jwtAuthenticator.mockReturnValue(mockAuthenticator);

      const credentials = {
        connectionType: 'jwt',
        servers: 'ws://localhost:8080',
        jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        jwtNkey: 'SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY',
      };

      await createNatsConnection(credentials);

      expect(jwtAuthenticator).toHaveBeenCalled();
      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          authenticator: mockAuthenticator,
        })
      );
    });

    it('should handle TLS configuration', async () => {
      const credentials = {
        connectionType: 'url',
        servers: 'wss://localhost:443',
        options: {
          tls: true,
          tlsCaCert: 'ca-cert-content',
          tlsCert: 'client-cert-content',
          tlsKey: 'client-key-content',
        },
      };

      await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          tls: {
            ca: 'ca-cert-content',
            cert: 'client-cert-content',
            key: 'client-key-content',
          },
        })
      );
    });

    it('should handle custom options', async () => {
      const credentials = {
        connectionType: 'url',
        servers: 'ws://localhost:8080',
        options: {
          name: 'custom-client',
          maxReconnectAttempts: 10,
          reconnectTimeWait: 5000,
          timeout: 30000,
          pingInterval: 60000,
        },
      };

      await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'custom-client',
          maxReconnectAttempts: 10,
          reconnectTimeWait: 5000,
          timeout: 30000,
          pingInterval: 60000,
        })
      );
    });

    it('should throw error on connection failure', async () => {
      const error = new Error('Connection failed');
      (connect as jest.Mock).mockRejectedValue(error);

      const credentials = {
        connectionType: 'url',
        servers: 'ws://localhost:8080',
      };

      await expect(createNatsConnection(credentials)).rejects.toThrow(
        'Failed to connect to NATS: Connection failed'
      );
    });

    it('should convert legacy nats:// URLs to ws://', async () => {
      const credentials = {
        connectionType: 'url',
        servers: 'nats://localhost:4222',
      };

      await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          servers: ['ws://localhost:4222'],
        })
      );
    });

    it('should convert tls:// URLs to wss://', async () => {
      const credentials = {
        connectionType: 'url',
        servers: 'tls://secure.example.com:4222',
      };

      await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          servers: ['wss://secure.example.com:4222'],
        })
      );
    });

    it('should handle Synadia Cloud URLs correctly', async () => {
      const credentials = {
        connectionType: 'url',
        servers: 'connect.ngs.global',
      };

      await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          servers: ['wss://connect.ngs.global:443'],
        })
      );
    });

    it('should handle mixed URL formats', async () => {
      const credentials = {
        connectionType: 'url',
        servers: 'nats://old-server:4222, ws://new-server:8080, tls://secure:4222',
      };

      await createNatsConnection(credentials);

      expect(connect).toHaveBeenCalledWith(
        expect.objectContaining({
          servers: ['ws://old-server:4222', 'ws://new-server:8080', 'wss://secure:4222'],
        })
      );
    });
  });

  describe('closeNatsConnection', () => {
    it('should drain and close connection', async () => {
      mockNatsConnection.drain = jest.fn().mockResolvedValue(undefined);
      mockNatsConnection.close = jest.fn().mockResolvedValue(undefined);

      await closeNatsConnection(mockNatsConnection);

      expect(mockNatsConnection.drain).toHaveBeenCalled();
      expect(mockNatsConnection.close).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNatsConnection.drain = jest.fn().mockRejectedValue(new Error('Drain failed'));

      await closeNatsConnection(mockNatsConnection);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error closing NATS connection:',
        expect.any(Error)
      );
    });
  });
});