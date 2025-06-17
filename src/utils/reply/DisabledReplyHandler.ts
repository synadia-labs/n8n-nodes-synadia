import { ReplyHandler, ReplyHandlerContext } from './ReplyHandler';

export class DisabledReplyHandler extends ReplyHandler {
	readonly mode = 'disabled';
	
	async processMessage(_context: ReplyHandlerContext): Promise<void> {
		// No-op - replies are disabled
	}
}