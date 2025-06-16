import { NatsServiceReply } from '../NatsServiceReply.node';
import { ITriggerFunctions } from 'n8n-workflow';
import { StringCodec, Empty, createInbox, headers, jetstream } from '../../bundled/nats-bundled';
import * as NatsConnection from '../../utils/NatsConnection';

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

describe('NatsServiceReply', () => {
	let node: NatsServiceReply;
	let mockTriggerFunctions: ITriggerFunctions;
	let mockNatsConnection: any;
	let mockSubscription: any;
	let mockEmit: jest.Mock;
	let mockGetNodeParameter: jest.Mock;
	let mockHelpers: any;

	beforeEach(() => {
		node = new NatsServiceReply();
		mockEmit = jest.fn();
		mockGetNodeParameter = jest.fn();
		mockHelpers = {
			returnJsonArray: jest.fn((data) => data),
		};
		
		// Create mock subscription
		mockSubscription = {
			drain: jest.fn(),
			unsubscribe: jest.fn(),
			[Symbol.asyncIterator]: jest.fn(),
		};

		// Mock NATS connection
		mockNatsConnection = {
			subscribe: jest.fn().mockReturnValue(mockSubscription),
			jetstream: jest.fn(),
		} as any;

		// Mock trigger functions
		mockTriggerFunctions = {
			getCredentials: jest.fn().mockResolvedValue({ connectionType: 'url', servers: 'nats://localhost:4222' }),
			getNodeParameter: mockGetNodeParameter,
			getNode: jest.fn().mockReturnValue({}),
			emit: mockEmit,
			helpers: mockHelpers,
			logger: {
				verbose: jest.fn(),
				debug: jest.fn(),
				info: jest.fn(),
				warn: jest.fn(),
				error: jest.fn(),
			},
		} as unknown as ITriggerFunctions;

		// Mock createNatsConnection
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNatsConnection);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Node Configuration', () => {
		it('should have correct node properties', () => {
			expect(node.description.displayName).toBe('NATS Service Reply');
			expect(node.description.name).toBe('natsServiceReply');
			expect(node.description.group).toContain('trigger');
			expect(node.description.inputs).toEqual([]);
			expect(node.description.outputs).toEqual(["main"]);
		});
	});

	describe('Message Structure', () => {
		it('should emit messages in NatsTrigger format', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"userId": "123", "action": "getUser"}'),
				subject: 'api.users.get',
				reply: '_INBOX.123',
				headers: new Map([['X-Request-ID', 'req-123']]),
			};

			// Setup async iterator for subscription
			let messageHandler: any;
			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockImplementation(async () => {
					if (messageHandler) {
						return { done: true };
					}
					messageHandler = mockMessage;
					return { value: mockMessage, done: false };
				}),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.users.get')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			await node.trigger.call(mockTriggerFunctions);

			// Wait for async processing
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(mockEmit).toHaveBeenCalledWith([[{
				json: {
					subject: 'api.users.get',
					data: { userId: '123', action: 'getUser' },
					replyTo: '_INBOX.123',
					headers: { 'X-Request-ID': 'req-123' },
					timestamp: expect.any(String),
					requestId: expect.any(String),
				}
			}]]);
		});

		it('should handle string data', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('plain text message'),
				subject: 'api.test',
				reply: '_INBOX.456',
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(mockEmit).toHaveBeenCalledWith([[{
				json: {
					subject: 'api.test',
					data: 'plain text message',
					replyTo: '_INBOX.456',
					timestamp: expect.any(String),
					requestId: expect.any(String),
				}
			}]]);
		});
	});

	describe('Manual Trigger', () => {
		it('should emit sample data with correct structure', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			const response = await node.trigger.call(mockTriggerFunctions);
			
			// Call manual trigger function
			await response.manualTriggerFunction!();

			expect(mockEmit).toHaveBeenCalledWith([
				expect.arrayContaining([{
					subject: 'api.test',
					data: {
						userId: '12345',
						action: 'getUser',
						includeDetails: true
					},
					headers: {
						'X-Request-ID': 'sample-req-123',
						'X-Client-Version': '1.0.0'
					},
					replyTo: '_INBOX.sample.reply',
					requestId: 'sample-request-id',
					timestamp: expect.any(String),
				}])
			]);
		});
	});

	describe('Queue Groups', () => {
		it('should subscribe with queue group when specified', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('test-group')
				.mockReturnValueOnce({});

			await node.trigger.call(mockTriggerFunctions);

			expect(mockNatsConnection.subscribe).toHaveBeenCalledWith(
				'api.test',
				{ queue: 'test-group' }
			);
		});
	});

	describe('Request Filtering', () => {
		it('should ignore messages without reply subject', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"test": "data"}'),
				subject: 'api.test',
				// No reply field
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			// Should not emit anything
			expect(mockEmit).not.toHaveBeenCalled();
		});
	});
});