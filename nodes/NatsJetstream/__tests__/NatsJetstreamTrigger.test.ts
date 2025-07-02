import { NatsJetstreamTrigger } from '../NatsJetstreamTrigger.node';
import { ITriggerFunctions, ApplicationError } from 'n8n-workflow';
import * as NatsConnection from '../../../utils/NatsConnection';

// Mock dependencies
jest.mock('../../../utils/NatsConnection');
jest.mock('../../../bundled/nats-bundled', () => ({
	jetstream: jest.fn(),
	jetstreamManager: jest.fn(),
}));

describe('NatsJetstreamTrigger', () => {
	let node: NatsJetstreamTrigger;
	let mockTriggerFunctions: ITriggerFunctions;
	let mockNatsConnection: any;
	let mockJetStream: any;
	let mockJetStreamManager: any;
	let mockConsumer: any;
	let mockMessageIterator: any;
	let mockEmit: jest.Mock;
	let mockGetNodeParameter: jest.Mock;

	beforeEach(() => {
		node = new NatsJetstreamTrigger();

		// Mock message iterator
		mockMessageIterator = {
			stop: jest.fn(),
			[Symbol.asyncIterator]: jest.fn().mockReturnValue({
				next: jest.fn().mockResolvedValue({ done: true }),
			}),
		};

		// Mock consumer
		mockConsumer = {
			consume: jest.fn().mockResolvedValue(mockMessageIterator),
		};

		// Mock JetStream Manager
		mockJetStreamManager = {
			streams: {
				info: jest.fn().mockResolvedValue({ config: { name: 'TEST_STREAM' } }),
			},
		};

		// Mock JetStream
		mockJetStream = {
			consumers: {
				get: jest.fn().mockResolvedValue(mockConsumer),
			},
		};

		// Mock NATS Connection
		mockNatsConnection = {
			close: jest.fn(),
			closed: jest.fn().mockResolvedValue(undefined),
		};

		mockEmit = jest.fn();
		mockGetNodeParameter = jest.fn();

		mockTriggerFunctions = {
			getNode: jest.fn(() => ({ id: 'test-node-id', name: 'Test Node' })),
			getNodeParameter: mockGetNodeParameter,
			getCredentials: jest.fn().mockResolvedValue({
				serverUrls: 'nats://localhost:4222',
			}),
			emit: mockEmit,
			helpers: {
				returnJsonArray: jest.fn((data: any[]) => data.map((item) => ({ json: item }))),
			} as any,
			logger: {
				error: jest.fn(),
				warn: jest.fn(),
				info: jest.fn(),
				debug: jest.fn(),
			} as any,
		} as unknown as ITriggerFunctions;

		// Setup mocks
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNatsConnection);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
		
		const { jetstream, jetstreamManager } = require('../../../bundled/nats-bundled');
		jetstream.mockReturnValue(mockJetStream);
		jetstreamManager.mockResolvedValue(mockJetStreamManager);

		// Default parameter values
		mockGetNodeParameter.mockImplementation((paramName: string) => {
			switch (paramName) {
				case 'streamName': return 'TEST_STREAM';
				case 'consumerName': return 'test-consumer';
				case 'options': return {};
				default: return undefined;
			}
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Trigger Setup', () => {
		it('should setup trigger successfully', async () => {
			const result = await node.trigger.call(mockTriggerFunctions);

			expect(result).toHaveProperty('closeFunction');
			expect(result).toHaveProperty('manualTriggerFunction');
			expect(typeof result.closeFunction).toBe('function');
			expect(typeof result.manualTriggerFunction).toBe('function');
		});

		it('should verify stream exists', async () => {
			await node.trigger.call(mockTriggerFunctions);

			expect(mockJetStreamManager.streams.info).toHaveBeenCalledWith('TEST_STREAM');
		});

		it('should get consumer', async () => {
			await node.trigger.call(mockTriggerFunctions);

			expect(mockJetStream.consumers.get).toHaveBeenCalledWith('TEST_STREAM', 'test-consumer');
		});

		it('should setup consumer with pull options (maxBytes takes priority)', async () => {
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'streamName': return 'TEST_STREAM';
					case 'consumerName': return 'test-consumer';
					case 'options': return {
						maxMessages: 50,
						maxBytes: 512 * 1024,
						expires: 60,
						noWait: true,
					};
					default: return undefined;
				}
			});

			await node.trigger.call(mockTriggerFunctions);

			expect(mockConsumer.consume).toHaveBeenCalledWith({
				max_bytes: 512 * 1024, // maxBytes takes priority
				expires: 60000, // Converted to milliseconds
				no_wait: true,
			});
		});

		it('should use maxMessages when maxBytes is not set', async () => {
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				switch (paramName) {
					case 'streamName': return 'TEST_STREAM';
					case 'consumerName': return 'test-consumer';
					case 'options': return {
						maxMessages: 50,
						expires: 60,
						noWait: false,
					};
					default: return undefined;
				}
			});

			await node.trigger.call(mockTriggerFunctions);

			expect(mockConsumer.consume).toHaveBeenCalledWith({
				max_messages: 50,
				expires: 60000, // Converted to milliseconds
			});
		});
	});

	describe('Error Handling', () => {
		it('should handle stream not found error', async () => {
			const streamError = new Error('Stream not found') as any;
			streamError.code = 'STREAM_NOT_FOUND';
			mockJetStreamManager.streams.info.mockRejectedValue(streamError);

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(ApplicationError);
			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				"JetStream stream 'TEST_STREAM' not found"
			);
		});

		it('should handle consumer not found error', async () => {
			const consumerError = new Error('Consumer not found') as any;
			consumerError.code = 'CONSUMER_NOT_FOUND';
			mockJetStream.consumers.get.mockRejectedValue(consumerError);

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(ApplicationError);
			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				"JetStream consumer 'test-consumer' not found"
			);
		});

		it('should handle connection errors', async () => {
			(NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
				new Error('Connection failed')
			);

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(ApplicationError);
		});
	});

	describe('Manual Trigger Function', () => {
		it('should provide sample data', async () => {
			const result = await node.trigger.call(mockTriggerFunctions);
			
			// Execute manual trigger
			await result.manualTriggerFunction!();

			expect(mockEmit).toHaveBeenCalledWith([
				expect.arrayContaining([
					expect.objectContaining({
						json: expect.objectContaining({
							subject: 'events.orders.new',
							data: expect.objectContaining({
								orderId: expect.stringMatching(/^order-/),
								customerId: 'customer-67890',
								amount: expect.any(Number),
								currency: 'USD',
								items: expect.any(Array),
								status: 'confirmed',
							}),
							headers: expect.objectContaining({
								'Content-Type': 'application/json',
								'X-Order-Source': 'web-app',
							}),
							stream: 'TEST_STREAM',
							consumer: 'test-consumer',
							seq: expect.any(Number),
							redelivered: false,
							redeliveryCount: 0,
						}),
					}),
				]),
			]);
		});
	});

	describe('Connection Management', () => {
		it('should create NATS connection with monitoring', async () => {
			await node.trigger.call(mockTriggerFunctions);

			expect(NatsConnection.createNatsConnection).toHaveBeenCalledWith(
				{ serverUrls: 'nats://localhost:4222' },
				expect.any(Object),
				expect.objectContaining({
					monitor: true,
					onError: expect.any(Function),
					onReconnect: expect.any(Function),
					onDisconnect: expect.any(Function),
					onAsyncError: expect.any(Function),
				})
			);
		});

		it('should close connection and stop iterator', async () => {
			const result = await node.trigger.call(mockTriggerFunctions);

			// Execute close function
			if (result.closeFunction) await result.closeFunction();

			expect(mockMessageIterator.stop).toHaveBeenCalled();
			expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(
				mockNatsConnection,
				expect.any(Object)
			);
		});
	});

	describe('Parameter Validation', () => {
		it('should validate stream name', async () => {
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'streamName') return 'invalid stream name'; // Contains spaces
				if (paramName === 'consumerName') return 'test-consumer';
				if (paramName === 'options') return {};
				return undefined;
			});

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow();
		});

		it('should validate consumer name', async () => {
			mockGetNodeParameter.mockImplementation((paramName: string) => {
				if (paramName === 'streamName') return 'TEST_STREAM';
				if (paramName === 'consumerName') return 'invalid consumer name'; // Contains spaces
				if (paramName === 'options') return {};
				return undefined;
			});

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow();
		});
	});
});