import { NatsTrigger } from '../../nodes/NatsTrigger.node';
import { ITriggerFunctions, ITriggerResponse } from 'n8n-workflow';
import * as NatsConnection from '../../utils/NatsConnection';
import { StringCodec, jetstream, consumerOpts } from '../../bundled/nats-bundled';

// Mock dependencies
jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled', () => ({
	jetstream: jest.fn(),
	jetstreamManager: jest.fn(),
	Kvm: jest.fn(),
	Objm: jest.fn(),
	consumerOpts: jest.fn(() => ({
		deliverAll: jest.fn().mockReturnThis(),
		deliverNew: jest.fn().mockReturnThis(),
		deliverLast: jest.fn().mockReturnThis(),
		deliverLastPerSubject: jest.fn().mockReturnThis(),
		ackExplicit: jest.fn().mockReturnThis(),
		manualAck: jest.fn().mockReturnThis(),
		bind: jest.fn().mockReturnThis(),
		build: jest.fn().mockReturnValue({}),
	})),
	StringCodec: jest.fn(() => ({
		encode: jest.fn((str) => new TextEncoder().encode(str)),
		decode: jest.fn((data) => new TextDecoder().decode(data)),
	})),
	Empty: new Uint8Array(0),
	createInbox: jest.fn(() => '_INBOX.test'),
	headers: jest.fn(() => ({
		append: jest.fn(),
		set: jest.fn(),
		get: jest.fn(),
	})),
}));

describe('NatsTrigger', () => {
  let node: NatsTrigger;
  let mockTriggerFunctions: ITriggerFunctions;
  let mockNatsConnection: any;
  let mockSubscription: any;
  let mockEmit: jest.Mock;
  let mockGetNodeParameter: jest.Mock;

  beforeEach(() => {
    node = new NatsTrigger();
    mockEmit = jest.fn();

    // Mock subscription
    mockSubscription = {
      drain: jest.fn().mockResolvedValue(undefined),
      [Symbol.asyncIterator]: jest.fn().mockReturnValue({
        async next() {
          return { done: true };
        },
      }),
    } as any;

    // Mock NATS connection
    mockNatsConnection = {
      subscribe: jest.fn().mockReturnValue(mockSubscription),
      jetstream: jest.fn().mockReturnValue({
        subscribe: jest.fn(),
        consumers: {
          get: jest.fn(),
        },
      }),
      jetstreamManager: jest.fn().mockResolvedValue({}),
    } as any;

    // Mock trigger functions
    mockGetNodeParameter = jest.fn();
    mockTriggerFunctions = {
      getCredentials: jest.fn().mockResolvedValue({ connectionType: 'url', servers: 'nats://localhost:4222' }),
      getNodeParameter: mockGetNodeParameter,
      getNode: jest.fn().mockReturnValue({}),
      emit: mockEmit,
      helpers: {
        returnJsonArray: jest.fn((data) => data),
      },
    } as unknown as ITriggerFunctions;

    // Mock createNatsConnection
    (NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNatsConnection);
    (NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Core NATS Subscription', () => {
    it('should subscribe to Core NATS subject', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core') // subscriptionType
        .mockReturnValueOnce('test.subject') // subject
        .mockReturnValueOnce('disabled') // replyMode
        .mockReturnValueOnce({}) // replyOptions
        .mockReturnValueOnce({}) // automaticReply
        .mockReturnValueOnce(''); // queueGroup

      const response = await node.trigger.call(mockTriggerFunctions);

      expect(mockNatsConnection.subscribe).toHaveBeenCalledWith(
        'test.subject',
        expect.any(Object)
      );
      expect(response.closeFunction).toBeDefined();
      expect(response.manualTriggerFunction).toBeDefined();
    });

    it('should subscribe with queue group', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('disabled') // replyMode
        .mockReturnValueOnce({}) // replyOptions
        .mockReturnValueOnce({}) // automaticReply
        .mockReturnValueOnce('my-queue-group');

      await node.trigger.call(mockTriggerFunctions);

      expect(mockNatsConnection.subscribe).toHaveBeenCalledWith(
        'test.subject',
        { queue: 'my-queue-group' }
      );
    });

    it('should emit messages when received', async () => {
      const mockMessages = [
        {
          subject: 'test.subject',
          data: new TextEncoder().encode('{"test": 1}'),
          reply: '',
          headers: undefined,
          sid: 1,
        },
        {
          subject: 'test.subject',
          data: new TextEncoder().encode('{"test": 2}'),
          reply: '',
          headers: undefined,
          sid: 2,
        },
      ];

      // Mock async iterator
      let messageIndex = 0;
      mockSubscription[Symbol.asyncIterator] = jest.fn().mockReturnValue({
        async next() {
          if (messageIndex < mockMessages.length) {
            return { value: mockMessages[messageIndex++], done: false };
          }
          return { done: true };
        },
      });

      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('');

      const response = await node.trigger.call(mockTriggerFunctions);

      // Wait for async message processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockEmit).toHaveBeenCalledTimes(2);
      expect(mockEmit).toHaveBeenCalledWith([[
        expect.objectContaining({
          json: expect.objectContaining({
            subject: 'test.subject',
            data: { test: 1 },
          }),
        }),
      ]]);
    });
  });

  describe('JetStream Subscription', () => {
    it('should create ephemeral consumer', async () => {
      const mockConsumerOpts = {
        deliverNew: jest.fn(),
        ackWait: jest.fn(),
        maxDeliver: jest.fn(),
        manualAck: jest.fn(),
      };
      
      const mockJsSubscription = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValue({
          async next() { return { done: true }; },
        }),
      };

      (consumerOpts as jest.Mock).mockReturnValue(mockConsumerOpts);
      
      const mockJs = {
        subscribe: jest.fn().mockResolvedValue(mockJsSubscription)
      };
      (jetstream as jest.Mock).mockReturnValue(mockJs);

      mockGetNodeParameter
        .mockReturnValueOnce('jetstream') // subscriptionType
        .mockReturnValueOnce('test.subject') // subject
        .mockReturnValueOnce('disabled') // replyMode
        .mockReturnValueOnce({}) // replyOptions
        .mockReturnValueOnce({}) // automaticReply
        .mockReturnValueOnce('test-stream') // streamName
        .mockReturnValueOnce('ephemeral') // consumerType
        .mockReturnValueOnce({ // options
          deliverPolicy: 'new',
          ackWait: 30000,
          maxDeliver: 3,
          manualAck: false,
        });

      await node.trigger.call(mockTriggerFunctions);

      expect(mockJs.subscribe).toHaveBeenCalledWith('test.subject', mockConsumerOpts);
      expect(mockConsumerOpts.deliverNew).toHaveBeenCalled();
      expect(mockConsumerOpts.ackWait).toHaveBeenCalledWith(30000);
      expect(mockConsumerOpts.maxDeliver).toHaveBeenCalledWith(3);
    });

    it('should use durable consumer', async () => {
      const mockConsumer = {
        consume: jest.fn().mockResolvedValue({
          [Symbol.asyncIterator]: jest.fn().mockReturnValue({
            async next() { return { done: true }; },
          }),
        }),
      };

      const mockJs = {
        consumers: {
          get: jest.fn().mockResolvedValue(mockConsumer)
        }
      };
      (jetstream as jest.Mock).mockReturnValue(mockJs);

      mockGetNodeParameter
        .mockReturnValueOnce('jetstream')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('disabled') // replyMode
        .mockReturnValueOnce({}) // replyOptions
        .mockReturnValueOnce({}) // automaticReply
        .mockReturnValueOnce('test-stream')
        .mockReturnValueOnce('durable') // consumerType
        .mockReturnValueOnce({}) // options
        .mockReturnValueOnce('my-consumer'); // consumerName

      await node.trigger.call(mockTriggerFunctions);

      expect(mockJs.consumers.get).toHaveBeenCalledWith('test-stream', 'my-consumer');
      expect(mockConsumer.consume).toHaveBeenCalled();
    });

    it('should handle different delivery policies', async () => {
      const testCases = [
        { policy: 'all', method: 'deliverAll' },
        { policy: 'last', method: 'deliverLast' },
        { policy: 'new', method: 'deliverNew' },
        { policy: 'startSequence', method: 'startSequence', param: 100 },
        { policy: 'startTime', method: 'startTime', param: '2023-01-01T00:00:00Z' },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        
        const mockConsumerOpts = {
          [testCase.method]: jest.fn(),
        };
        
        (consumerOpts as jest.Mock).mockReturnValue(mockConsumerOpts);
        
        const mockJs = {
          publish: jest.fn(),
          subscribe: jest.fn().mockResolvedValue({
          [Symbol.asyncIterator]: jest.fn().mockReturnValue({
            async next() { return { done: true }; },
          }),
        })
        };
        (jetstream as jest.Mock).mockReturnValue(mockJs);

        const options: any = { deliverPolicy: testCase.policy };
        if (testCase.param !== undefined) {
          if (testCase.policy === 'startSequence') {
            options.startSequence = testCase.param;
          } else if (testCase.policy === 'startTime') {
            options.startTime = testCase.param;
          }
        }

        mockGetNodeParameter
          .mockReturnValueOnce('jetstream')
          .mockReturnValueOnce('test.subject')
          .mockReturnValueOnce('disabled') // replyMode
          .mockReturnValueOnce({}) // replyOptions
          .mockReturnValueOnce({}) // automaticReply
          .mockReturnValueOnce('test-stream')
          .mockReturnValueOnce('ephemeral')
          .mockReturnValueOnce(options);

        await node.trigger.call(mockTriggerFunctions);

        if (testCase.param !== undefined) {
          if (testCase.policy === 'startTime') {
            expect(mockConsumerOpts[testCase.method]).toHaveBeenCalledWith(
              expect.any(Date)
            );
          } else {
            expect(mockConsumerOpts[testCase.method]).toHaveBeenCalledWith(testCase.param);
          }
        } else {
          expect(mockConsumerOpts[testCase.method]).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Manual Trigger', () => {
    it('should emit test message on manual trigger', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('');

      const response = await node.trigger.call(mockTriggerFunctions);
      
      // Call manual trigger function
      await response.manualTriggerFunction!();

      expect(mockTriggerFunctions.helpers.returnJsonArray).toHaveBeenCalledWith([
        expect.objectContaining({
          subject: 'test.subject',
          data: expect.objectContaining({
            message: 'Sample NATS message',
          }),
        }),
      ]);
      
      expect(mockEmit).toHaveBeenCalledWith([
        expect.any(Array)
      ]);
    });
  });

  describe('Cleanup', () => {
    it('should properly close connections', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('');

      const response = await node.trigger.call(mockTriggerFunctions);
      
      // Call close function
      await response.closeFunction!();

      expect(mockSubscription.drain).toHaveBeenCalled();
      expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(mockNatsConnection);
    });
  });

  describe('Error Handling', () => {
    it('should validate subject', async () => {
      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('invalid subject'); // Invalid subject with space

      await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
        'Subject cannot contain spaces'
      );
    });

    it('should handle connection errors', async () => {
      (NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
        new Error('Connection failed')
      );

      mockGetNodeParameter
        .mockReturnValueOnce('core')
        .mockReturnValueOnce('test.subject')
        .mockReturnValueOnce('');

      await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
        'Failed to setup NATS trigger: Connection failed'
      );
    });
  });
});