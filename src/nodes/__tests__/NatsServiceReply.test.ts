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

jest.mock('../../utils/NatsHelpers', () => ({
	parseNatsMessage: jest.fn((msg) => {
		let data;
		if (msg.data) {
			const decoded = new TextDecoder().decode(msg.data);
			try {
				data = JSON.parse(decoded);
			} catch {
				data = decoded;
			}
		} else {
			data = {};
		}
		
		return {
			json: {
				subject: msg.subject,
				data,
				replyTo: msg.reply,
				headers: msg.headers ? Object.fromEntries(msg.headers) : undefined,
				timestamp: new Date().toISOString(),
			}
		};
	}),
	encodeMessage: jest.fn((data, encoding) => {
		const str = typeof data === 'string' ? data : JSON.stringify(data);
		return new TextEncoder().encode(str);
	}),
	createNatsHeaders: jest.fn((headers) => headers),
	validateSubject: jest.fn(),
}));

describe('NatsServiceReply', () => {
	let node: NatsServiceReply;
	let mockTriggerFunctions: ITriggerFunctions;
	let mockNatsConnection: any;
	let mockSubscription: any;
	let mockEmit: jest.Mock;
	let mockGetNodeParameter: jest.Mock;
	let mockHelpers: any;
	let storedMessages: Map<string, any>;
	let emittedDataStore: any[] = [];

	beforeEach(() => {
		node = new NatsServiceReply();
		storedMessages = new Map();
		emittedDataStore = [];
		
		mockEmit = jest.fn((data) => {
			// Store emitted data for inspection
			emittedDataStore.push(...data);
			
			// Simulate what the actual node does - add requestId to messages
			if (data && data[0] && data[0][0] && data[0][0].json) {
				// Generate a requestId if not present (simulating the actual node behavior)
				if (!data[0][0].json.requestId) {
					data[0][0].json.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				}
				// Store the message with its requestId for manual trigger
				const requestId = data[0][0].json.requestId;
				const msg = data[0][0].json.replyTo ? storedMessages.get(data[0][0].json.replyTo) : null;
				if (msg) {
					storedMessages.set(requestId, msg);
				}
			}
		});
		
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

	describe('Error Handling', () => {
		it('should handle parsing errors and send error reply', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"test": "data"}'),
				subject: 'api.test',
				reply: '_INBOX.error',
				respond: jest.fn(),
			};

			// Make parseNatsMessage throw an error for this specific test
			const parseNatsMessageMock = require('../../utils/NatsHelpers').parseNatsMessage;
			parseNatsMessageMock.mockImplementationOnce(() => {
				throw new Error('Parse error');
			});

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

			expect(mockTriggerFunctions.logger.error).toHaveBeenCalledWith(
				'Error processing request:',
				expect.any(Error)
			);
			expect(mockMessage.respond).toHaveBeenCalledWith(
				expect.any(Uint8Array)
			);
		});

		it('should handle connection errors', async () => {
			(NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
				new Error('Connection failed')
			);

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				'Failed to start service: Connection failed'
			);
		});

		it('should handle subscription errors', async () => {
			const errorAsyncIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(() => ({
					next: jest.fn().mockRejectedValue(new Error('Subscription error')),
				})),
			};
			mockSubscription[Symbol.asyncIterator] = errorAsyncIterator[Symbol.asyncIterator];

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(mockTriggerFunctions.logger.error).toHaveBeenCalledWith(
				'Service error:',
				expect.any(Error)
			);
		});
	});

	describe('Manual Reply Sending', () => {
		it('should send replies when manual trigger is invoked with data', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"userId": "123"}'),
				subject: 'api.users.get',
				reply: '_INBOX.123',
				respond: jest.fn(),
			};

			// Store the message for later use
			storedMessages.set('_INBOX.123', mockMessage);

			// First, setup the subscription to receive a message
			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.users.get')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({ replyField: 'response' });

			const response = await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			// Verify message was received and stored
			expect(mockEmit).toHaveBeenCalled();
			
			// Get the emitted data with requestId
			const emittedData = emittedDataStore[0][0];
			expect(emittedData.json).toMatchObject({
				subject: 'api.users.get',
				data: { userId: '123' },
				replyTo: '_INBOX.123',
			});
			
			const requestId = emittedData.json.requestId;
			expect(requestId).toBeDefined();

			// Mock getInputData to return the response
			(mockTriggerFunctions as any).getInputData = jest.fn().mockReturnValue([{
				json: {
					requestId,
					response: { user: { id: '123', name: 'Test User' } },
				}
			}]);

			// Call manual trigger to send reply
			await response.manualTriggerFunction!();

			// Verify reply was sent
			expect(mockMessage.respond).toHaveBeenCalledWith(
				expect.any(Uint8Array),
				expect.any(Object)
			);
			
			// Verify the content of the reply
			const replyData = mockMessage.respond.mock.calls[0][0];
			const replyText = new TextDecoder().decode(replyData);
			const replyJson = JSON.parse(replyText);
			expect(replyJson).toEqual({ user: { id: '123', name: 'Test User' } });
		});

		it('should use default reply when no reply field is present', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"test": "data"}'),
				subject: 'api.test',
				reply: '_INBOX.456',
				respond: jest.fn(),
			};

			storedMessages.set('_INBOX.456', mockMessage);

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({ defaultReply: '{"status": "ok"}' });

			const response = await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = emittedDataStore[0][0];
			const requestId = emittedData.json.requestId;

			(mockTriggerFunctions as any).getInputData = jest.fn().mockReturnValue([{
				json: {
					requestId,
					// No reply field, just the original data
					subject: 'api.test',
					data: { test: 'data' },
				}
			}]);

			await response.manualTriggerFunction!();

			const replyData = mockMessage.respond.mock.calls[0][0];
			const replyText = new TextDecoder().decode(replyData);
			const replyJson = JSON.parse(replyText);
			expect(replyJson).toEqual({ status: 'ok' });
		});

		it('should include request data when option is set', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"action": "test"}'),
				subject: 'api.test',
				reply: '_INBOX.789',
				respond: jest.fn(),
			};

			storedMessages.set('_INBOX.789', mockMessage);

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({ includeRequest: true });

			const response = await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = emittedDataStore[0][0];
			const requestId = emittedData.json.requestId;

			(mockTriggerFunctions as any).getInputData = jest.fn().mockReturnValue([{
				json: {
					requestId,
					data: { action: 'test' },
					reply: { result: 'success' },
				}
			}]);

			await response.manualTriggerFunction!();

			const replyData = mockMessage.respond.mock.calls[0][0];
			const replyText = new TextDecoder().decode(replyData);
			const replyJson = JSON.parse(replyText);
			expect(replyJson).toEqual({
				request: { action: 'test' },
				response: { result: 'success' }
			});
		});

		it('should handle reply errors gracefully', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"test": "data"}'),
				subject: 'api.test',
				reply: '_INBOX.error',
				respond: jest.fn().mockImplementation(() => {
					throw new Error('Reply failed');
				}),
			};

			storedMessages.set('_INBOX.error', mockMessage);

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			const response = await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = emittedDataStore[0][0];
			const requestId = emittedData.json.requestId;

			(mockTriggerFunctions as any).getInputData = jest.fn().mockReturnValue([{
				json: {
					requestId,
					reply: { result: 'test' },
				}
			}]);

			await response.manualTriggerFunction!();

			expect(mockTriggerFunctions.logger.error).toHaveBeenCalledWith(
				'Error sending reply:',
				expect.any(Error)
			);
			// Should attempt to send error reply
			expect(mockMessage.respond).toHaveBeenCalledTimes(2);
		});

		it('should handle custom headers in replies', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"test": "data"}'),
				subject: 'api.test',
				reply: '_INBOX.headers',
				respond: jest.fn(),
			};

			storedMessages.set('_INBOX.headers', mockMessage);

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			const response = await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = emittedDataStore[0][0];
			const requestId = emittedData.json.requestId;

			(mockTriggerFunctions as any).getInputData = jest.fn().mockReturnValue([{
				json: {
					requestId,
					reply: { result: 'success' },
					replyHeaders: {
						'X-Custom-Header': 'custom-value',
						'X-Request-ID': 'req-123',
					}
				}
			}]);

			await response.manualTriggerFunction!();

			expect(mockMessage.respond).toHaveBeenCalledWith(
				expect.any(Uint8Array),
				expect.objectContaining({
					headers: expect.objectContaining({
						'X-Custom-Header': 'custom-value',
						'X-Request-ID': 'req-123',
					})
				})
			);
		});
	});

	describe('Cleanup', () => {
		it('should properly clean up resources on close', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce({});

			const response = await node.trigger.call(mockTriggerFunctions);
			
			// Call the close function
			if (response && typeof response === 'object' && 'closeFunction' in response) {
				await (response as any).closeFunction();
			}

			expect(mockSubscription.unsubscribe).toHaveBeenCalled();
			expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(mockNatsConnection);
		});
	});
});