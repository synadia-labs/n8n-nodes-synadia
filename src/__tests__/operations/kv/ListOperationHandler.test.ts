import { ListOperationHandler } from '../../../operations/kv/ListOperationHandler';
import { createMockKV, createNotFoundError, createPermissionError } from '../testUtils';
import { KV } from '../../../bundled/nats-bundled';

describe('ListOperationHandler', () => {
	let handler: ListOperationHandler;
	let mockKV: jest.Mocked<KV>;

	beforeEach(() => {
		handler = new ListOperationHandler();
		mockKV = createMockKV();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('list');
		});
	});

	describe('execute', () => {
		it('should list keys with wildcard pattern successfully', async () => {
			const testPattern = 'config.*';
			const expectedKeys = ['config.app', 'config.db', 'config.auth'];

			// Mock the async iterator
			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					for (const key of expectedKeys) {
						yield key;
					}
				}),
			};

			mockKV.keys.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testPattern });

			expect(mockKV.keys).toHaveBeenCalledWith(testPattern);
			expect(result).toEqual({
				keys: expectedKeys,
				count: expectedKeys.length,
			});
		});

		it('should handle empty key list', async () => {
			const testPattern = 'nonexistent.*';

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					// Empty iterator
				}),
			};

			mockKV.keys.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testPattern });

			expect(mockKV.keys).toHaveBeenCalledWith(testPattern);
			expect(result).toEqual({
				keys: [],
				count: 0,
			});
		});

		it('should handle single key match', async () => {
			const testPattern = 'specific.key';
			const expectedKeys = ['specific.key'];

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					yield 'specific.key';
				}),
			};

			mockKV.keys.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testPattern });

			expect(result).toEqual({
				keys: expectedKeys,
				count: 1,
			});
		});

		it('should handle large key lists', async () => {
			const testPattern = 'data.*';
			const expectedKeys = Array.from({ length: 1000 }, (_, i) => `data.item${i}`);

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					for (const key of expectedKeys) {
						yield key;
					}
				}),
			};

			mockKV.keys.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testPattern });

			expect(result).toEqual({
				keys: expectedKeys,
				count: 1000,
			});
		});

		it('should handle keys with special characters', async () => {
			const testPattern = 'special.*';
			const expectedKeys = [
				'special.key-with_underscore',
				'special.key/with/slashes',
				'special.key:with:colons',
				'special.key@with@at',
				'special.key#with#hash',
			];

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					for (const key of expectedKeys) {
						yield key;
					}
				}),
			};

			mockKV.keys.mockResolvedValue(mockIterator as any);

			const result = await handler.execute(mockKV, { key: testPattern });

			expect(result).toEqual({
				keys: expectedKeys,
				count: expectedKeys.length,
			});
		});

		it('should throw error when key parameter is not provided', async () => {
			await expect(handler.execute(mockKV, { key: '' })).rejects.toThrow('key is not provided');
			expect(mockKV.keys).not.toHaveBeenCalled();
		});

		it('should throw error when key parameter is undefined', async () => {
			await expect(handler.execute(mockKV, { key: undefined as any })).rejects.toThrow(
				'key is not provided',
			);
			expect(mockKV.keys).not.toHaveBeenCalled();
		});

		it('should throw error when key parameter is null', async () => {
			await expect(handler.execute(mockKV, { key: null as any })).rejects.toThrow(
				'key is not provided',
			);
			expect(mockKV.keys).not.toHaveBeenCalled();
		});

		it('should propagate bucket not found errors', async () => {
			const testPattern = 'test.*';
			const natsError = createNotFoundError('Bucket not found');

			mockKV.keys.mockRejectedValue(natsError);

			await expect(handler.execute(mockKV, { key: testPattern })).rejects.toThrow(
				'Bucket not found',
			);
			expect(mockKV.keys).toHaveBeenCalledWith(testPattern);
		});

		it('should propagate permission errors', async () => {
			const testPattern = 'restricted.*';
			const permissionError = createPermissionError('Permission denied for list operation');

			mockKV.keys.mockRejectedValue(permissionError);

			await expect(handler.execute(mockKV, { key: testPattern })).rejects.toThrow(
				'Permission denied for list operation',
			);
			expect(mockKV.keys).toHaveBeenCalledWith(testPattern);
		});

		it('should handle network timeout errors', async () => {
			const testPattern = 'test.*';
			const timeoutError = new Error('List operation timeout');
			(timeoutError as any).code = 'TIMEOUT';

			mockKV.keys.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockKV, { key: testPattern })).rejects.toThrow(
				'List operation timeout',
			);
		});

		it('should handle iterator errors during iteration', async () => {
			const testPattern = 'error.*';

			const mockIterator = {
				[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
					yield 'error.key1';
					throw new Error('Iterator error during iteration');
				}),
			};

			mockKV.keys.mockResolvedValue(mockIterator as any);

			await expect(handler.execute(mockKV, { key: testPattern })).rejects.toThrow(
				'Iterator error during iteration',
			);
		});

		it('should handle different wildcard patterns', async () => {
			const testCases = [
				{ pattern: '*', expectedKeys: ['key1', 'key2', 'key3'] },
				{ pattern: '*.config', expectedKeys: ['app.config', 'db.config'] },
				{ pattern: 'user.*.settings', expectedKeys: ['user.123.settings', 'user.456.settings'] },
			];

			for (const testCase of testCases) {
				const mockIterator = {
					[Symbol.asyncIterator]: jest.fn().mockImplementation(async function* () {
						for (const key of testCase.expectedKeys) {
							yield key;
						}
					}),
				};

				mockKV.keys.mockResolvedValue(mockIterator as any);

				const result = await handler.execute(mockKV, { key: testCase.pattern });

				expect(result).toEqual({
					keys: testCase.expectedKeys,
					count: testCase.expectedKeys.length,
				});

				jest.clearAllMocks();
			}
		});
	});
});
