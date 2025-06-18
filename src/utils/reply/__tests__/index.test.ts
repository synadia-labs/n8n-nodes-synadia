import { createReplyHandler } from '../index';
import { DisabledReplyHandler } from '../DisabledReplyHandler';
import { AutomaticReplyHandler } from '../AutomaticReplyHandler';
import { ManualReplyHandler } from '../ManualReplyHandler';

describe('createReplyHandler', () => {
	it('should create DisabledReplyHandler for disabled mode', () => {
		const handler = createReplyHandler('disabled');
		expect(handler).toBeInstanceOf(DisabledReplyHandler);
		expect(handler.mode).toBe('disabled');
	});

	it('should create AutomaticReplyHandler for automatic mode', () => {
		const handler = createReplyHandler('automatic');
		expect(handler).toBeInstanceOf(AutomaticReplyHandler);
		expect(handler.mode).toBe('automatic');
	});

	it('should create ManualReplyHandler for manual mode', () => {
		const handler = createReplyHandler('manual');
		expect(handler).toBeInstanceOf(ManualReplyHandler);
		expect(handler.mode).toBe('manual');
	});

	it('should default to DisabledReplyHandler for unknown mode', () => {
		const handler = createReplyHandler('unknown');
		expect(handler).toBeInstanceOf(DisabledReplyHandler);
		expect(handler.mode).toBe('disabled');
	});

	it('should default to DisabledReplyHandler for empty string', () => {
		const handler = createReplyHandler('');
		expect(handler).toBeInstanceOf(DisabledReplyHandler);
		expect(handler.mode).toBe('disabled');
	});
});