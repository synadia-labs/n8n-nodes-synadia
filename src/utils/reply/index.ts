import { ReplyHandler } from './ReplyHandler';
import { DisabledReplyHandler } from './DisabledReplyHandler';
import { AutomaticReplyHandler } from './AutomaticReplyHandler';
import { ManualReplyHandler } from './ManualReplyHandler';

export function createReplyHandler(mode: string): ReplyHandler {
	switch (mode) {
		case 'automatic':
			return new AutomaticReplyHandler();
		case 'manual':
			return new ManualReplyHandler();
		case 'disabled':
		default:
			return new DisabledReplyHandler();
	}
}

export { ReplyHandler, ReplyHandlerContext } from './ReplyHandler';
export { DisabledReplyHandler } from './DisabledReplyHandler';
export { AutomaticReplyHandler } from './AutomaticReplyHandler';
export { ManualReplyHandler } from './ManualReplyHandler';