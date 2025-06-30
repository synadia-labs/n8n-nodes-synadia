import { HistoryOperationHandler } from '../../../operations/kv/HistoryOperationHandler';
import {
	createMockKV,
	createSampleKvEntry,
	createNotFoundError,
	createPermissionError,
} from '../testUtils';
import { KV } from '../../../bundled/nats-bundled';

describe('HistoryOperationHandler', () => {
	let handler: HistoryOperationHandler;
	let mockKV: jest.Mocked<KV>;

	beforeEach(() => {
		handler = new HistoryOperationHandler();
		mockKV = createMockKV();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('history');
		});
	});

	describe('execute', () => {
		it('should get history for a key with multiple entries', async () => {
			const testKey = 'config.app';
			const expectedEntries = [
				createSampleKvEntry({ revision: 1, value: new TextEncoder().encode('initial value') }),
				createSampleKvEntry({ revision: 2, value: new TextEncoder().encode('updated value') }),
				createSampleKvEntry({ revision: 3, value: new TextEncoder().encode('final value') }),
			];

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					for (const entry of expectedEntries) {
						yield entry;
					}
				}),
			};

			mockKV.history.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(mockKV.history).toHaveBeenCalledWith({ key: testKey });
			expect(result).toEqual({
				entries: expectedEntries,
				count: expectedEntries.length,
			});
		});

		it('should handle key with no history', async () => {
			const testKey = 'nonexistent.key';

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					// Empty iterator
				}),
			};

			mockKV.history.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(mockKV.history).toHaveBeenCalledWith({ key: testKey });
			expect(result).toEqual({
				entries: [],
				count: 0,
			});
		});

		it('should handle single entry history', async () => {
			const testKey = 'single.entry';
			const expectedEntries = [createSampleKvEntry({ revision: 1, key: testKey })];

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					yield expectedEntries[0];
				}),
			};

			mockKV.history.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(result).toEqual({
				entries: expectedEntries,
				count: 1,
			});
		});

		it('should handle large history with many revisions', async () => {
			const testKey = 'frequent.updates';
			const expectedEntries = Array.from({ length: 100 }, (_, i) =>
				createSampleKvEntry({
					revision: i + 1,
					key: testKey,
					value: new TextEncoder().encode(`value ${i + 1}`),
				}),
			);

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					for (const entry of expectedEntries) {
						yield entry;
					}
				}),
			};

			mockKV.history.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(result).toEqual({
				entries: expectedEntries,
				count: 100,
			});
		});

		it('should handle history with delete operations', async () => {
			const testKey = 'deleted.key';
			const expectedEntries = [
				createSampleKvEntry({ revision: 1, operation: 'PUT' as const }),
				createSampleKvEntry({ revision: 2, operation: 'DEL' as const, value: null }),
				createSampleKvEntry({ revision: 3, operation: 'PUT' as const }),
			];

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					for (const entry of expectedEntries) {
						yield entry;
					}
				}),
			};

			mockKV.history.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(result).toEqual({
				entries: expectedEntries,
				count: 3,
			});
		});

		it('should handle keys with special characters', async () => {
			const testKey = 'special.key-with_chars/123:test@domain.com';
			const expectedEntries = [createSampleKvEntry({ key: testKey, revision: 1 })];

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					yield expectedEntries[0];
				}),
			};

			mockKV.history.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(mockKV.history).toHaveBeenCalledWith({ key: testKey });
			expect(result).toEqual({
				entries: expectedEntries,
				count: 1,
			});
		});

		it('should throw error when key parameter is not provided', async () => {
			await expect(handler.execute(mockKV, { key: '' })).rejects.toThrow('key is not provided');
			expect(mockKV.history).not.toHaveBeenCalled();
		});

		it('should throw error when key parameter is undefined', async () => {
			await expect(handler.execute(mockKV, { key: undefined as any })).rejects.toThrow(
				'key is not provided',
			);
			expect(mockKV.history).not.toHaveBeenCalled();
		});

		it('should throw error when key parameter is null', async () => {
			await expect(handler.execute(mockKV, { key: null as any })).rejects.toThrow(
				'key is not provided',
			);
			expect(mockKV.history).not.toHaveBeenCalled();
		});

		it('should propagate bucket not found errors', async () => {
			const testKey = 'test.key';
			const natsError = createNotFoundError('Bucket not found');

			mockKV.history.mockRejectedValue(natsError);

			await expect(handler.execute(mockKV, { key: testKey })).rejects.toThrow('Bucket not found');
			expect(mockKV.history).toHaveBeenCalledWith({ key: testKey });
		});

		it('should propagate permission errors', async () => {
			const testKey = 'restricted.key';
			const permissionError = createPermissionError('Permission denied for history operation');

			mockKV.history.mockRejectedValue(permissionError);

			await expect(handler.execute(mockKV, { key: testKey })).rejects.toThrow(
				'Permission denied for history operation',
			);
			expect(mockKV.history).toHaveBeenCalledWith({ key: testKey });
		});

		it('should handle network timeout errors', async () => {
			const testKey = 'test.key';
			const timeoutError = new Error('History operation timeout');
			(timeoutError as any).code = 'TIMEOUT';

			mockKV.history.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockKV, { key: testKey })).rejects.toThrow(
				'History operation timeout',
			);
		});

		it('should handle iterator errors during iteration', async () => {
			const testKey = 'error.key';

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					yield createSampleKvEntry({ revision: 1 });
					throw new Error('Iterator error during history iteration');
				}),
			};

			mockKV.history.mockResolvedValue(mockIterator as any);

			await expect(handler.execute(mockKV, { key: testKey })).rejects.toThrow(
				'Iterator error during history iteration',
			);
		});

		it('should preserve entry order in chronological sequence', async () => {
			const testKey = 'ordered.key';
			const expectedEntries = [
				createSampleKvEntry({ revision: 1, created: new Date('2023-01-01T10:00:00Z') }),
				createSampleKvEntry({ revision: 2, created: new Date('2023-01-01T11:00:00Z') }),
				createSampleKvEntry({ revision: 3, created: new Date('2023-01-01T12:00:00Z') }),
			];

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					for (const entry of expectedEntries) {
						yield entry;
					}
				}),
			};

			mockKV.history.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(result.entries).toEqual(expectedEntries);
			// Verify order is preserved
			const revisions = (result.entries as any[]).map((e) => e.revision);
			expect(revisions).toEqual([1, 2, 3]);
		});
	});
});
