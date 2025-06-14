import { NatsService } from '../NatsService.node';
import { ITriggerFunctions } from 'n8n-workflow';
import * as NatsConnection from '../../utils/NatsConnection';
import { NatsConnection as NC } from 'nats';

jest.mock('../../utils/NatsConnection');

describe('NatsService', () => {
	let node: NatsService;
	let mockTriggerFunctions: ITriggerFunctions;
	let mockNatsConnection: NC;
	let mockSubscription: any;
	let mockEmit: jest.Mock;
	let mockGetNodeParameter: jest.Mock;

	beforeEach(() => {
		node = new NatsService();
		mockEmit = jest.fn();
		mockGetNodeParameter = jest.fn();
		
		// Create mock subscription
		mockSubscription = {
			drain: jest.fn(),
			[Symbol.asyncIterator]: jest.fn(),
		};

		// Mock NATS connection
		mockNatsConnection = {
			subscribe: jest.fn().mockReturnValue(mockSubscription),
			jetstream: jest.fn(),
		} as unknown as NC;

		// Mock trigger functions
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

	describe('Node Configuration', () => {
		it('should have correct node properties', () => {
			expect(node.description.displayName).toBe('NATS Service');
			expect(node.description.name).toBe('natsService');
			expect(node.description.group).toContain('trigger');
			expect(node.description.inputs).toEqual([]);
			expect(node.description.outputs).toEqual(["main"]);
		});

		it('should have required properties', () => {
			const properties = node.description.properties;
			const propertyNames = properties.map(p => p.name);
			
			expect(propertyNames).toContain('subject');
			expect(propertyNames).toContain('queueGroup');
			expect(propertyNames).toContain('responseData');
			expect(propertyNames).toContain('options');
		});
	});

	describe('Service Setup', () => {
		it('should subscribe to subject with queue group', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('test-group')
				.mockReturnValueOnce('{"success": true}')
				.mockReturnValueOnce({});

			const response = await node.trigger.call(mockTriggerFunctions);

			expect(mockNatsConnection.subscribe).toHaveBeenCalledWith(
				'api.test',
				{ queue: 'test-group' }
			);
			expect(response.closeFunction).toBeDefined();
			expect(response.manualTriggerFunction).toBeDefined();
		});

		it('should subscribe without queue group when not specified', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('{"success": true}')
				.mockReturnValueOnce({});

			await node.trigger.call(mockTriggerFunctions);

			expect(mockNatsConnection.subscribe).toHaveBeenCalledWith(
				'api.test',
				{}
			);
		});
	});

	describe('Message Processing', () => {
		it('should process request and send response', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"test": "data"}'),
				subject: 'api.test',
				reply: '_INBOX.123',
				respond: jest.fn(),
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
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('{"success": true, "data": "{{$json}}"}')
				.mockReturnValueOnce({});

			await node.trigger.call(mockTriggerFunctions);

			// Wait for async processing
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(mockEmit).toHaveBeenCalledWith([[{
				json: expect.objectContaining({
					request: { test: 'data' },
					subject: 'api.test',
					timestamp: expect.any(String),
				})
			}]]);

			expect(mockMessage.respond).toHaveBeenCalledWith(
				expect.any(Uint8Array)
			);
		});
	});

	describe('Response Encoding', () => {
		it('should handle JSON encoding', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"test": "data"}'),
				reply: '_INBOX.123',
				respond: jest.fn(),
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('{"success": true}')
				.mockReturnValueOnce({ responseEncoding: 'json' });

			await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			const responseData = mockMessage.respond.mock.calls[0][0];
			const responseStr = new TextDecoder().decode(responseData);
			expect(JSON.parse(responseStr)).toEqual({ success: true });
		});

		it('should handle string encoding', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"test": "data"}'),
				reply: '_INBOX.123',
				respond: jest.fn(),
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('Hello World')
				.mockReturnValueOnce({ responseEncoding: 'string' });

			await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			const responseData = mockMessage.respond.mock.calls[0][0];
			const responseStr = new TextDecoder().decode(responseData);
			expect(responseStr).toBe('Hello World');
		});
	});

	describe('Error Handling', () => {
		it('should handle errors in response function', async () => {
			const mockMessage = {
				data: new TextEncoder().encode('{"test": "data"}'),
				reply: '_INBOX.123',
				respond: jest.fn(),
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockImplementation(() => ({
				next: jest.fn().mockResolvedValueOnce({ value: mockMessage, done: false })
					.mockResolvedValue({ done: true }),
			}));

			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('{"invalid": json}') // Invalid JSON
				.mockReturnValueOnce({ 
					errorResponse: '{"error": "Test error"}'
				});

			await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			const responseData = mockMessage.respond.mock.calls[0][0];
			const responseStr = new TextDecoder().decode(responseData);
			expect(JSON.parse(responseStr)).toEqual({ error: 'Test error' });
		});

		it('should validate subject', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('invalid subject')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({});

			await expect(node.trigger.call(mockTriggerFunctions))
				.rejects.toThrow('Subject cannot contain spaces');
		});
	});

	describe('Manual Trigger', () => {
		it('should emit sample data on manual trigger', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('{"success": true, "data": "{{$json.request}}"}')
				.mockReturnValueOnce({});

			const response = await node.trigger.call(mockTriggerFunctions);
			
			// Call manual trigger function
			await response.manualTriggerFunction!();

			expect(mockEmit).toHaveBeenCalledWith([[{
				json: expect.objectContaining({
					request: expect.objectContaining({
						method: 'getUser',
						params: expect.any(Object),
					}),
					response: expect.objectContaining({
						success: true,
					}),
					subject: 'api.test',
					timestamp: expect.any(String),
				})
			}]]);
		});
	});

	describe('Cleanup', () => {
		it('should properly close connections', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('api.test')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({});

			const response = await node.trigger.call(mockTriggerFunctions);
			
			// Call close function
			await response.closeFunction!();

			expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(mockNatsConnection);
		});
	});
});