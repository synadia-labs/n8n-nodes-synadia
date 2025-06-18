import { DisabledReplyHandler } from '../DisabledReplyHandler';
import { ReplyHandlerContext } from '../ReplyHandler';

describe('DisabledReplyHandler', () => {
	let handler: DisabledReplyHandler;
	let mockMsg: any;
	let context: ReplyHandlerContext;

	beforeEach(() => {
		handler = new DisabledReplyHandler();
		
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

	describe('processMessage', () => {
		it('should not do anything', async () => {
			await handler.processMessage(context);

			expect(mockMsg.respond).not.toHaveBeenCalled();
			expect(context.parsedMessage).toEqual({
				json: {
					data: { key: 'value' },
				},
			});
		});

		it('should handle missing reply address', async () => {
			mockMsg.reply = undefined;

			await handler.processMessage(context);

			expect(mockMsg.respond).not.toHaveBeenCalled();
		});

		it('should handle null context', async () => {
			const emptyContext: ReplyHandlerContext = {
				msg: {} as any, // Cast to any to avoid type errors
				parsedMessage: {},
			};

			await handler.processMessage(emptyContext);

			// Should complete without error
			expect(true).toBe(true);
		});
	});

	describe('mode', () => {
		it('should have correct mode', () => {
			expect(handler.mode).toBe('disabled');
		});
	});

	describe('cleanup', () => {
		it('should not have cleanup method', () => {
			expect(handler.cleanup).toBeUndefined();
		});
	});
});