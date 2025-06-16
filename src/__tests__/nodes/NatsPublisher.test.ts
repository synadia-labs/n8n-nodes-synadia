import { NatsPublisher } from '../../nodes/NatsPublisher.node';
import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import * as NatsConnection from '../../utils/NatsConnection';
import { NatsConnection as NC } from 'nats';

// Mock dependencies
jest.mock('../../utils/NatsConnection');

describe('NatsPublisher', () => {
  let node: NatsPublisher;
  let mockExecuteFunctions: IExecuteFunctions;
  let mockNatsConnection: NC;
  let mockGetNodeParameter: jest.Mock;
  let mockGetInputData: jest.Mock;
  let mockContinueOnFail: jest.Mock;

  beforeEach(() => {
    node = new NatsPublisher();
    
    // Mock NATS connection
    mockNatsConnection = {
      publish: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
      jetstream: jest.fn().mockReturnValue({
        publish: jest.fn().mockResolvedValue({
          stream: 'test-stream',
          seq: 123,
          duplicate: false,
        }),
      }),
    } as unknown as NC;

    // Mock execute functions
    mockGetNodeParameter = jest.fn();
    mockGetInputData = jest.fn().mockReturnValue([{ json: { test: 'data' } }]);
    mockContinueOnFail = jest.fn().mockReturnValue(false);
    
    mockExecuteFunctions = {
      getInputData: mockGetInputData,
      getCredentials: jest.fn().mockResolvedValue({ connectionType: 'url', servers: 'ws://localhost:8080' }),
      getNodeParameter: mockGetNodeParameter,
      getNode: jest.fn().mockReturnValue({}),
      continueOnFail: mockContinueOnFail,
    } as unknown as IExecuteFunctions;

    // Mock createNatsConnection
    (NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNatsConnection);
    (NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Core NATS Publishing', () => {
    it('should publish message to Core NATS', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core') // publishType
        .mockReturnValueOnce('test.subject') // subject
        .mockReturnValueOnce('{"hello": "world"}') // message
        .mockReturnValueOnce({}); // options

      const result = await node.execute.call(mockExecuteFunctions);

      expect(mockNatsConnection.publish).toHaveBeenCalledWith(
        'test.subject',
        expect.any(Uint8Array),
        expect.objectContaining({ headers: undefined })
      );
      expect(mockNatsConnection.flush).toHaveBeenCalled();
      expect(result[0][0].json).toMatchObject({
        success: true,
        subject: 'test.subject',
      });
      expect(JSON.parse(result[0][0].json.message as string)).toEqual({ hello: 'world' });
    });

    it('should handle plain string messages', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('plain text message')
        .mockReturnValueOnce({ encoding: 'string' });

      await node.execute.call(mockExecuteFunctions);

      const publishCall = (mockNatsConnection.publish as jest.Mock).mock.calls[0];
      const publishedData = new TextDecoder().decode(publishCall[1]);
      expect(publishedData).toBe('plain text message');
    });

    it('should include headers when provided', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce({ 
          headers: '{"X-Custom": "value"}',
          encoding: 'json' 
        });

      await node.execute.call(mockExecuteFunctions);

      expect(mockNatsConnection.publish).toHaveBeenCalledWith(
        'test.subject',
        expect.any(Uint8Array),
        expect.objectContaining({ 
          headers: expect.objectContaining({
            headers: expect.any(Map)
          })
        })
      );
    });

    it('should handle reply-to option', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce({ replyTo: 'reply.subject' });

      await node.execute.call(mockExecuteFunctions);

      expect(mockNatsConnection.publish).toHaveBeenCalledWith(
        'test.subject',
        expect.any(Uint8Array),
        expect.objectContaining({ reply: 'reply.subject' })
      );
    });
  });

  describe('JetStream Publishing', () => {
    it('should publish message to JetStream', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('jetstream') // publishType
        .mockReturnValueOnce('test.subject') // subject
        .mockReturnValueOnce('{"hello": "jetstream"}') // message
        .mockReturnValueOnce({ timeout: 10000 }); // options

      const result = await node.execute.call(mockExecuteFunctions);

      const js = mockNatsConnection.jetstream();
      expect(js.publish).toHaveBeenCalledWith(
        'test.subject',
        expect.any(Uint8Array),
        expect.objectContaining({ timeout: 10000 })
      );
      expect(result[0][0].json).toMatchObject({
        success: true,
        subject: 'test.subject',
        stream: 'test-stream',
        sequence: 123,
        duplicate: false,
      });
      expect(JSON.parse(result[0][0].json.message as string)).toEqual({ hello: 'jetstream' });
    });

    it('should handle message ID for deduplication', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('jetstream')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce({ messageId: 'unique-123' });

      await node.execute.call(mockExecuteFunctions);

      const js = mockNatsConnection.jetstream();
      expect(js.publish).toHaveBeenCalledWith(
        'test.subject',
        expect.any(Uint8Array),
        expect.objectContaining({ msgID: 'unique-123' })
      );
    });

    it('should handle optimistic concurrency controls', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('jetstream')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce({ 
          expectedLastMsgId: 'last-msg-123',
          expectedStream: 'my-stream' 
        });

      await node.execute.call(mockExecuteFunctions);

      const js = mockNatsConnection.jetstream();
      expect(js.publish).toHaveBeenCalledWith(
        'test.subject',
        expect.any(Uint8Array),
        expect.objectContaining({ 
          expect: { 
            lastMsgID: 'last-msg-123',
            streamName: 'my-stream' 
          } 
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should validate subject', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('invalid subject') // Invalid subject with space
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce({});

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        'Subject cannot contain spaces'
      );
    });

    it('should handle invalid JSON headers', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce({ headers: 'invalid json' });

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        NodeOperationError
      );
    });

    it('should continue on fail when enabled', async () => {
      mockContinueOnFail.mockReturnValue(true);
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('invalid subject')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce({})
        .mockReturnValueOnce('invalid subject'); // For error handling

      const result = await node.execute.call(mockExecuteFunctions);

      expect(result[0][0].json).toMatchObject({
        error: 'Subject cannot contain spaces',
        subject: 'invalid subject',
      });
    });

    it('should handle connection errors', async () => {
      (NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
        new Error('Connection failed')
      );

      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce({});

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
        'NATS publish failed: Connection failed'
      );
    });

    it('should close connection on error', async () => {
      mockNatsConnection.publish = jest.fn().mockImplementation(() => {
        throw new Error('Publish failed');
      });

      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('{}')
        .mockReturnValueOnce({});

      await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow();
      expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(mockNatsConnection);
    });
  });

  describe('Multiple Items Processing', () => {
    it('should process multiple input items', async () => {
      mockGetInputData.mockReturnValue([
        { json: { item: 1 } },
        { json: { item: 2 } },
        { json: { item: 3 } },
      ]);

      // Clear previous mocks and set up for 3 items
      mockGetNodeParameter.mockReset();
      mockGetNodeParameter
        .mockImplementation((param, index) => {
          if (param === 'publishType') return 'core';
          if (param === 'subject') return `test.${index + 1}`;
          if (param === 'message') return `{"item": ${index + 1}}`;
          if (param === 'options') return {};
          return undefined;
        });

      const result = await node.execute.call(mockExecuteFunctions);

      expect(mockNatsConnection.publish).toHaveBeenCalledTimes(3);
      expect(result[0]).toHaveLength(3);
    });
  });
});