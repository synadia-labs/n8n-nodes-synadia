import { NatsStreamConsumer } from '../../nodes/NatsStreamConsumer/NatsStreamConsumer.node';
import { ITriggerFunctions, ITriggerResponse } from 'n8n-workflow';
import * as NatsConnection from '../../utils/NatsConnection';
import { StringCodec, jetstream } from '../../bundled/nats-bundled';

// Mock dependencies
jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled', () => ({
	jetstream: jest.fn(),
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

describe('NatsStreamConsumer', () => {
	let node: NatsStreamConsumer;
	let mockTriggerFunctions: ITriggerFunctions;
	let mockNatsConnection: any;
	let mockEmit: jest.Mock;
	let mockGetNodeParameter: jest.Mock;

	beforeEach(() => {
		node = new NatsStreamConsumer();
		mockEmit = jest.fn();

		// Mock NATS connection
		mockNatsConnection = {} as any;

		// Mock trigger functions
		mockGetNodeParameter = jest.fn();
		mockTriggerFunctions = {
			getCredentials: jest
				.fn()
				.mockResolvedValue({ connectionType: 'url', servers: 'nats://localhost:4222' }),
			getNodeParameter: mockGetNodeParameter,
			getNode: jest.fn().mockReturnValue({
				id: 'test-node-id',
				name: 'Test Node',
				type: 'n8n-nodes-synadia.natsStreamConsumer',
				position: [0, 0],
				typeVersion: 1,
			}),
			emit: mockEmit,
			helpers: {
				returnJsonArray: jest.fn((data) => data),
			},
			logger: {
				error: jest.fn(),
				warn: jest.fn(),
				info: jest.fn(),
				debug: jest.fn(),
			},
		} as unknown as ITriggerFunctions;

		// Mock createNatsConnection
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNatsConnection);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Existing Consumer', () => {
		it('should use existing consumer', async () => {
			const mockMessageIterator = {
				[Symbol.asyncIterator]: jest.fn().mockReturnValue({
					async next() {
						return { done: true };
					},
				}),
				return: jest.fn(),
			};

			const mockConsumer = {
				consume: jest.fn().mockResolvedValue(mockMessageIterator),
				stop: jest.fn(),
			};

			const mockJs = {
				consumers: {
					get: jest.fn().mockResolvedValue(mockConsumer),
				},
			};

			(jetstream as jest.Mock).mockReturnValue(mockJs);

			mockGetNodeParameter.mockImplementation((paramName, index, defaultValue) => {
				switch (paramName) {
					case 'streamName':
						return 'TESTSTREAM';
					case 'consumerName':
						return 'my-consumer';
					default:
						return defaultValue;
				}
			});

			const response = await node.trigger.call(mockTriggerFunctions);

			expect(mockJs.consumers.get).toHaveBeenCalledWith('TESTSTREAM', 'my-consumer');
			expect(mockConsumer.consume).toHaveBeenCalled();
			expect(response.closeFunction).toBeDefined();
			expect(response.manualTriggerFunction).toBeDefined();
		});
	});

	describe('Error Handling', () => {
		it('should validate stream name', async () => {
			mockGetNodeParameter.mockImplementation((paramName, index, defaultValue) => {
				switch (paramName) {
					case 'streamName':
						return 'invalid stream'; // Invalid stream name with space
					case 'consumerName':
						return 'my-consumer';
					default:
						return defaultValue;
				}
			});

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow();
		});

		it('should validate consumer name', async () => {
			mockGetNodeParameter.mockImplementation((paramName, index, defaultValue) => {
				switch (paramName) {
					case 'streamName':
						return 'TESTSTREAM';
					case 'consumerName':
						return 'invalid consumer'; // Invalid consumer name with space
					default:
						return defaultValue;
				}
			});

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow();
		});

		it('should handle stream not found error', async () => {
			const mockJs = {
				consumers: {
					get: jest.fn().mockRejectedValue({ code: 'STREAM_NOT_FOUND' }),
				},
			};

			(jetstream as jest.Mock).mockReturnValue(mockJs);

			mockGetNodeParameter.mockImplementation((paramName, index, defaultValue) => {
				switch (paramName) {
					case 'streamName':
						return 'NONEXISTENTSTREAM';
					case 'consumerName':
						return 'my-consumer';
					case 'options':
						return {};
					default:
						return defaultValue;
				}
			});

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				"Stream 'NONEXISTENTSTREAM' not found",
			);
		});

		it('should handle consumer not found error', async () => {
			const mockJs = {
				consumers: {
					get: jest.fn().mockRejectedValue({ code: 'CONSUMER_NOT_FOUND' }),
				},
			};

			(jetstream as jest.Mock).mockReturnValue(mockJs);

			mockGetNodeParameter.mockImplementation((paramName, index, defaultValue) => {
				switch (paramName) {
					case 'streamName':
						return 'TESTSTREAM';
					case 'consumerName':
						return 'NONEXISTENTCONSUMER';
					case 'options':
						return {};
					default:
						return defaultValue;
				}
			});

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				"Consumer 'NONEXISTENTCONSUMER' not found",
			);
		});

		it('should close connection on error', async () => {
			(NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
				new Error('Connection failed'),
			);

			mockGetNodeParameter.mockImplementation((paramName, index, defaultValue) => {
				switch (paramName) {
					case 'streamName':
						return 'TESTSTREAM';
					case 'consumerName':
						return 'my-consumer';
					default:
						return defaultValue;
				}
			});

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				'NATS Stream Consumer failed: Connection failed',
			);
		});
	});

	describe('Manual Trigger', () => {
		it('should provide JetStream sample data', async () => {
			const mockConsumer = {
				consume: jest.fn().mockResolvedValue({
					[Symbol.asyncIterator]: jest.fn().mockReturnValue({
						async next() {
							return { done: true };
						},
					}),
				}),
			};

			const mockJs = {
				consumers: {
					get: jest.fn().mockResolvedValue(mockConsumer),
				},
			};

			(jetstream as jest.Mock).mockReturnValue(mockJs);

			mockGetNodeParameter.mockImplementation((paramName, index, defaultValue) => {
				switch (paramName) {
					case 'streamName':
						return 'TESTSTREAM';
					case 'consumerName':
						return 'my-consumer';
					default:
						return defaultValue;
				}
			});

			const response = await node.trigger.call(mockTriggerFunctions);
			await response.manualTriggerFunction!();

			expect(mockEmit).toHaveBeenCalledWith([
				expect.arrayContaining([
					expect.objectContaining({
						subject: 'orders.new',
						data: expect.any(Object),
						headers: expect.objectContaining({
							'Nats-Stream': 'TESTSTREAM',
							'Nats-Consumer': 'my-consumer',
							'Nats-Sequence': '42',
						}),
						seq: 42,
						timestamp: expect.any(String),
					}),
				]),
			]);
		});
	});
});
