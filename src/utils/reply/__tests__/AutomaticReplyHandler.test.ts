import { AutomaticReplyHandler } from '../AutomaticReplyHandler';
import { ReplyHandlerContext } from '../ReplyHandler';

describe('AutomaticReplyHandler', () => {
	let handler: AutomaticReplyHandler;
	let mockMsg: any;
	let context: ReplyHandlerContext;

	beforeEach(() => {
		handler = new AutomaticReplyHandler();
		
		mockMsg = {
			reply: '_INBOX.123',
			respond: jest.fn(),
		};

		context = {
			msg: mockMsg,
			parsedMessage: {
				json: {
					data: { key: 'value', nested: { prop: 'test' } },
				},
			},
			automaticReply: {
				responseTemplate: '{"success": true}',
				responseEncoding: 'json',
				includeRequestInOutput: true,
			},
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('processMessage', () => {
		it('should send automatic reply with default template', async () => {
			await handler.processMessage(context);

			expect(mockMsg.respond).toHaveBeenCalled();
			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ success: true });
			expect(context.parsedMessage.json.sentResponse).toEqual({ success: true });
		});

		it('should process template with timestamp', async () => {
			context.automaticReply!.responseTemplate = '{"timestamp": "{{new Date().toISOString()}}"}';

			await handler.processMessage(context);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
		});

		it('should process template with request data', async () => {
			context.automaticReply!.responseTemplate = '{"echo": {{$json.data}}}';

			await handler.processMessage(context);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ echo: { key: 'value', nested: { prop: 'test' } } });
		});

		it('should process template with nested property access', async () => {
			context.automaticReply!.responseTemplate = '{"nestedValue": {{$json.data.nested.prop}}}';

			await handler.processMessage(context);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ nestedValue: 'test' });
		});

		it('should handle missing nested properties', async () => {
			context.automaticReply!.responseTemplate = '{"missing": {{$json.data.does.not.exist}}}';

			await handler.processMessage(context);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ missing: null });
		});

		it('should send string response when encoding is not json', async () => {
			context.automaticReply!.responseEncoding = 'string';
			context.automaticReply!.responseTemplate = 'Plain text response';

			await handler.processMessage(context);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			
			expect(responseText).toBe('Plain text response');
			expect(context.parsedMessage.json.sentResponse).toBe('Plain text response');
		});

		it('should not include response in output when disabled', async () => {
			context.automaticReply!.includeRequestInOutput = false;

			await handler.processMessage(context);

			expect(context.parsedMessage.json.sentResponse).toBeUndefined();
		});

		it('should send error response on template error', async () => {
			context.automaticReply!.responseTemplate = 'invalid json {';
			context.automaticReply!.errorResponse = '{"error": "Processing failed"}';

			await handler.processMessage(context);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ error: 'Processing failed' });
			expect(context.parsedMessage.json.sentResponse).toEqual({ error: 'Processing failed' });
			expect(context.parsedMessage.json.error).toBeDefined();
		});

		it('should send generic error when error response is invalid', async () => {
			context.automaticReply!.responseTemplate = 'invalid json {';
			context.automaticReply!.errorResponse = 'also invalid {';

			await handler.processMessage(context);

			const responseData = mockMsg.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toEqual({ error: 'Internal service error' });
		});

		it('should not process if no reply address', async () => {
			mockMsg.reply = undefined;

			await handler.processMessage(context);

			expect(mockMsg.respond).not.toHaveBeenCalled();
		});

		it('should not process if no automatic reply config', async () => {
			context.automaticReply = undefined;

			await handler.processMessage(context);

			expect(mockMsg.respond).not.toHaveBeenCalled();
		});

		it('should handle null parsedMessage.json gracefully', async () => {
			context.parsedMessage.json = null;
			context.automaticReply!.errorResponse = '{"error": "Failed"}';
			context.automaticReply!.responseTemplate = 'invalid {';

			await handler.processMessage(context);

			expect(mockMsg.respond).toHaveBeenCalled();
		});
	});

	describe('mode', () => {
		it('should have correct mode', () => {
			expect(handler.mode).toBe('automatic');
		});
	});
});