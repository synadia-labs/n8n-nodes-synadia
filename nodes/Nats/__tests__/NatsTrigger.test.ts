import { NatsTrigger } from '../NatsTrigger.node';
import { ITriggerFunctions, ITriggerResponse } from 'n8n-workflow';
import * as NatsConnection from '../../../utils/NatsConnection';
import { StringCodec } from '../../../bundled/nats-bundled';

// Mock dependencies
jest.mock('../../../utils/NatsConnection');
jest.mock('../../../bundled/nats-bundled', () => ({
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
			unsubscribe: jest.fn(),
			[Symbol.asyncIterator]: jest.fn().mockReturnValue({
				async next() {
					return { done: true };
				},
			}),
		} as any;

		// Mock NATS connection
		mockNatsConnection = {
			subscribe: jest.fn().mockReturnValue(mockSubscription),
		} as any;

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
				type: 'n8n-nodes-synadia.natsSubscriber',
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

	describe('Core NATS Subscription', () => {
		it('should subscribe to Core NATS subject', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce(''); // queueGroup

			const response = await node.trigger.call(mockTriggerFunctions);

			expect(mockNatsConnection.subscribe).toHaveBeenCalledWith('test.subject', expect.any(Object));
			expect(response.closeFunction).toBeDefined();
			expect(response.manualTriggerFunction).toBeDefined();
		});

		it('should subscribe with queue group', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('my-queue-group'); // queueGroup

			await node.trigger.call(mockTriggerFunctions);

			expect(mockNatsConnection.subscribe).toHaveBeenCalledWith('test.subject', {
				queue: 'my-queue-group',
			});
		});

		it('should emit messages when received', async () => {
			const mockMessages = [
				{
					subject: 'test.subject',
					data: new TextEncoder().encode('{"test": 1}'),
					reply: '',
					headers: undefined,
					sid: 1,
					json: () => ({ test: 1 }),
					string: () => '{"test": 1}',
				},
				{
					subject: 'test.subject',
					data: new TextEncoder().encode('{"test": 2}'),
					reply: '',
					headers: undefined,
					sid: 2,
					json: () => ({ test: 2 }),
					string: () => '{"test": 2}',
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

			mockGetNodeParameter.mockReturnValueOnce('test.subject').mockReturnValueOnce(''); // queueGroup

			const response = await node.trigger.call(mockTriggerFunctions);

			// Wait for async message processing
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(mockEmit).toHaveBeenCalledTimes(2);
			expect(mockEmit).toHaveBeenCalledWith([
				[
					expect.objectContaining({
						json: expect.objectContaining({
							subject: 'test.subject',
							data: { test: 1 },
						}),
					}),
				],
			]);
		});
	});

	describe('Error Handling', () => {
		it('should validate subject', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('invalid subject') // Invalid subject with space
				.mockReturnValueOnce('');

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				'Subject cannot contain spaces',
			);
		});

		it('should validate queue group when provided', async () => {
			mockGetNodeParameter.mockReturnValueOnce('test.subject').mockReturnValueOnce('invalid queue'); // Invalid queue group with space

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow();
		});

		it('should handle connection errors', async () => {
			(NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
				new Error('Connection failed'),
			);

			mockGetNodeParameter.mockReturnValueOnce('test.subject').mockReturnValueOnce('');

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				'Failed to setup NATS subscriber: Connection failed',
			);
		});

		it('should close connection on cleanup', async () => {
			mockGetNodeParameter.mockReturnValueOnce('test.subject').mockReturnValueOnce('');

			const response = await node.trigger.call(mockTriggerFunctions);
			await response.closeFunction!();

			expect(mockSubscription.unsubscribe).toHaveBeenCalled();
			expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(
				mockNatsConnection,
				expect.any(Object),
			);
		});
	});

	describe('Manual Trigger', () => {
		it('should provide sample data', async () => {
			mockGetNodeParameter.mockReturnValueOnce('test.subject').mockReturnValueOnce('');

			const response = await node.trigger.call(mockTriggerFunctions);
			await response.manualTriggerFunction!();

			expect(mockEmit).toHaveBeenCalledWith([
				expect.arrayContaining([
					expect.objectContaining({
						subject: 'test.subject',
						data: expect.any(Object),
						timestamp: expect.any(String),
					}),
				]),
			]);
		});
	});
});
