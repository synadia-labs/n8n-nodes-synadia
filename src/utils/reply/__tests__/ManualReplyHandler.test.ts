import { ManualReplyHandler } from '../ManualReplyHandler';
import { ReplyHandlerContext } from '../ReplyHandler';
import { INodeExecutionData } from 'n8n-workflow';
import { StringCodec } from '../../../bundled/nats-bundled';

jest.mock('../../../bundled/nats-bundled', () => ({
	StringCodec: jest.fn(() => ({
		encode: (str: string) => new TextEncoder().encode(str),
	})),
}));

jest.mock('../../NatsHelpers', () => ({
	encodeMessage: jest.fn((data, encoding) => {
		// Match the behavior expected by the test
		const str = JSON.stringify(data);
		return new TextEncoder().encode(str);
	}),
	createNatsHeaders: jest.fn((headers) => headers),
}));

describe('ManualReplyHandler', () => {
	let handler: ManualReplyHandler;
	let mockMsg: any;
	let context: ReplyHandlerContext;

	beforeEach(() => {
		handler = new ManualReplyHandler();
		
		mockMsg = {
			reply: '_INBOX.123',
			respond: jest.fn(),
		};

		context = {
			msg: mockMsg,
			parsedMessage: {
				json: {
					data: { key: 'value' },
				},
			},
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('processMessage', () => {
		it('should store message with request ID', async () => {
			await handler.processMessage(context);

			expect(context.parsedMessage.json.requestId).toBeDefined();
			expect(context.parsedMessage.json.requestId).toMatch(/^\d+-[a-z0-9]{9}$/);
			
			const requestId = context.parsedMessage.json.requestId as string;
			expect(handler.getPendingMessages().get(requestId)).toBe(mockMsg);
		});

		it('should not process if no reply address', async () => {
			mockMsg.reply = undefined;

			await handler.processMessage(context);

			expect(context.parsedMessage.json.requestId).toBeUndefined();
			expect(handler.getPendingMessages().size).toBe(0);
		});
	});

	describe('sendReply', () => {
		it('should send reply from reply field', async () => {
			// First process a message
			await handler.processMessage(context);
			const requestId = context.parsedMessage.json.requestId as string;

			// Prepare reply
			const items: INodeExecutionData[] = [{
				json: {
					requestId,
					reply: { status: 'completed', result: 42 },
				},
			}];

			const replyOptions = {
				replyField: 'reply',
			};

			await handler.sendReply(items, replyOptions);

			expect(mockMsg.respond).toHaveBeenCalled();
			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ status: 'completed', result: 42 });
			expect(handler.getPendingMessages().has(requestId)).toBe(false);
		});

		it('should send reply from custom field', async () => {
			await handler.processMessage(context);
			const requestId = context.parsedMessage.json.requestId as string;

			const items: INodeExecutionData[] = [{
				json: {
					requestId,
					customReply: { custom: 'data' },
				},
			}];

			const replyOptions = {
				replyField: 'customReply',
			};

			await handler.sendReply(items, replyOptions);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ custom: 'data' });
		});

		it('should use cleaned output when reply field not present', async () => {
			await handler.processMessage(context);
			const requestId = context.parsedMessage.json.requestId as string;

			const items: INodeExecutionData[] = [{
				json: {
					requestId,
					subject: 'test.subject',
					data: { original: 'data' },
					headers: {},
					replyTo: '_INBOX.123',
					timestamp: '2023-01-01',
					seq: 1,
					processedData: { result: 'success' },
				},
			}];

			const replyOptions = {};

			await handler.sendReply(items, replyOptions);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ processedData: { result: 'success' } });
		});

		it('should use default reply when output is empty', async () => {
			await handler.processMessage(context);
			const requestId = context.parsedMessage.json.requestId as string;

			const items: INodeExecutionData[] = [{
				json: {
					requestId,
					subject: 'test',
					data: {},
				},
			}];

			const replyOptions = {
				defaultReply: '{"status": "ok"}',
			};

			await handler.sendReply(items, replyOptions);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ status: 'ok' });
		});

		it('should include request when option is set', async () => {
			await handler.processMessage(context);
			const requestId = context.parsedMessage.json.requestId as string;

			const items: INodeExecutionData[] = [{
				json: {
					requestId,
					data: { original: 'request' },
					reply: { processed: true },
				},
			}];

			const replyOptions = {
				includeRequest: true,
			};

			await handler.sendReply(items, replyOptions);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({
				request: { original: 'request' },
				response: { processed: true },
			});
		});

		it('should handle custom headers', async () => {
			await handler.processMessage(context);
			const requestId = context.parsedMessage.json.requestId as string;

			const items: INodeExecutionData[] = [{
				json: {
					requestId,
					reply: { data: 'test' },
					replyHeaders: {
						'X-Custom': 'value',
						'X-Another': 'header',
					},
				},
			}];

			const replyOptions = {};

			await handler.sendReply(items, replyOptions);

			expect(mockMsg.respond).toHaveBeenCalledWith(
				expect.any(Uint8Array),
				expect.objectContaining({
					headers: expect.any(Object),
				})
			);
		});

		it('should handle different encoding types', async () => {
			await handler.processMessage(context);
			const requestId = context.parsedMessage.json.requestId as string;

			const items: INodeExecutionData[] = [{
				json: {
					requestId,
					reply: 'Plain text response',
				},
			}];

			const replyOptions = {
				replyEncoding: 'string',
			};

			await handler.sendReply(items, replyOptions);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			
			expect(responseText).toBe('"Plain text response"'); // JSON stringified
		});

		it('should handle error and send error reply', async () => {
			await handler.processMessage(context);
			const requestId = context.parsedMessage.json.requestId as string;

			// Make respond throw an error
			mockMsg.respond.mockImplementationOnce(() => {
				throw new Error('Network error');
			});

			const items: INodeExecutionData[] = [{
				json: {
					requestId,
					reply: { data: 'test' },
				},
			}];

			const replyOptions = {};
			const mockLogger = {
				error: jest.fn(),
			};

			await handler.sendReply(items, replyOptions, mockLogger);

			expect(mockLogger.error).toHaveBeenCalledWith('Error sending reply:', expect.any(Error));
			expect(mockMsg.respond).toHaveBeenCalledTimes(2); // Original + error reply
			
			const errorReplyData = mockMsg.respond.mock.calls[1][0];
			const errorText = new TextDecoder().decode(errorReplyData);
			const errorResponse = JSON.parse(errorText);
			
			expect(errorResponse).toEqual({ error: 'Network error' });
		});

		it('should ignore missing messages', async () => {
			const items: INodeExecutionData[] = [{
				json: {
					requestId: 'non-existent-id',
					reply: { data: 'test' },
				},
			}];

			const replyOptions = {};

			await handler.sendReply(items, replyOptions);

			expect(mockMsg.respond).not.toHaveBeenCalled();
		});

		it('should handle multiple items', async () => {
			// Process two messages
			await handler.processMessage(context);
			const requestId1 = context.parsedMessage.json.requestId as string;

			const mockMsg2 = {
				reply: '_INBOX.456',
				respond: jest.fn(),
			};
			const context2: ReplyHandlerContext = {
				msg: mockMsg2 as any,
				parsedMessage: { json: {} },
			};
			await handler.processMessage(context2);
			const requestId2 = (context2.parsedMessage.json as any).requestId as string;

			const items: INodeExecutionData[] = [
				{
					json: {
						requestId: requestId1,
						reply: { id: 1 },
					},
				},
				{
					json: {
						requestId: requestId2,
						reply: { id: 2 },
					},
				},
			];

			const replyOptions = {};

			await handler.sendReply(items, replyOptions);

			expect(mockMsg.respond).toHaveBeenCalledTimes(1);
			expect(mockMsg2.respond).toHaveBeenCalledTimes(1);
			
			const response1Data = mockMsg.respond.mock.calls[0][0];
			const response1 = JSON.parse(new TextDecoder().decode(response1Data));
			expect(response1).toEqual({ id: 1 });

			const response2Data = mockMsg2.respond.mock.calls[0][0];
			const response2 = JSON.parse(new TextDecoder().decode(response2Data));
			expect(response2).toEqual({ id: 2 });
		});
	});

	describe('cleanup', () => {
		it('should clear pending messages', async () => {
			await handler.processMessage(context);
			expect(handler.getPendingMessages().size).toBe(1);

			handler.cleanup();

			expect(handler.getPendingMessages().size).toBe(0);
		});
	});

	describe('mode', () => {
		it('should have correct mode', () => {
			expect(handler.mode).toBe('manual');
		});
	});
});