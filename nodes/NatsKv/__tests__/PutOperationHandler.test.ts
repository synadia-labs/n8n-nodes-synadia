import { PutOperationHandler } from '../operations/PutOperationHandler';
import { createMockKV, createNotFoundError, createPermissionError } from './testUtils';
import { KV } from '../../../bundled/nats-bundled';

describe('PutOperationHandler', () => {
	let handler: PutOperationHandler;
	let mockKV: jest.Mocked<KV>;

	beforeEach(() => {
		handler = new PutOperationHandler();
		mockKV = createMockKV();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('put');
		});
	});

	describe('execute', () => {
		it('should put a key-value pair successfully', async () => {
			const testKey = 'test.key';
			const testValue = 'test value';
			const mockRevision = 5;

			mockKV.put.mockResolvedValue(mockRevision);

			const result = await handler.execute(mockKV, {
				key: testKey,
				value: testValue,
			});

			expect(mockKV.put).toHaveBeenCalledWith(testKey, testValue);
			expect(result).toEqual({
				revision: mockRevision,
			});
		});

		it('should handle JSON value correctly', async () => {
			const testKey = 'config.settings';
			const testValue = '{"theme": "dark", "notifications": true}';
			const mockRevision = 3;

			mockKV.put.mockResolvedValue(mockRevision);

			const result = await handler.execute(mockKV, {
				key: testKey,
				value: testValue,
			});

			expect(mockKV.put).toHaveBeenCalledWith(testKey, testValue);
			expect(result).toEqual({
				revision: mockRevision,
			});
		});

		it('should handle empty value and throw error', async () => {
			const testKey = 'empty.key';
			const testValue = '';

			await expect(
				handler.execute(mockKV, {
					key: testKey,
					value: testValue,
				}),
			).rejects.toThrow('value is not provided');

			expect(mockKV.put).not.toHaveBeenCalled();
		});

		it('should handle undefined value and throw error', async () => {
			const testKey = 'test.key';

			await expect(
				handler.execute(mockKV, {
					key: testKey,
					value: undefined,
				}),
			).rejects.toThrow('value is not provided');

			expect(mockKV.put).not.toHaveBeenCalled();
		});

		it('should handle special characters in key and value', async () => {
			const testKey = 'special.key-with_chars/123:test';
			const testValue = 'value with spaces & special chars: éñ$@#%';
			const mockRevision = 7;

			mockKV.put.mockResolvedValue(mockRevision);

			const result = await handler.execute(mockKV, {
				key: testKey,
				value: testValue,
			});

			expect(mockKV.put).toHaveBeenCalledWith(testKey, testValue);
			expect(result).toEqual({
				revision: mockRevision,
			});
		});

		it('should handle large value content', async () => {
			const testKey = 'large.content';
			const testValue = 'x'.repeat(10000); // Large string
			const mockRevision = 4;

			mockKV.put.mockResolvedValue(mockRevision);

			const result = await handler.execute(mockKV, {
				key: testKey,
				value: testValue,
			});

			expect(mockKV.put).toHaveBeenCalledWith(testKey, testValue);
			expect(result).toEqual({
				revision: mockRevision,
			});
		});

		it('should propagate bucket not found errors', async () => {
			const testKey = 'test.key';
			const testValue = 'test value';
			const natsError = createNotFoundError('Bucket not found');

			mockKV.put.mockRejectedValue(natsError);

			await expect(
				handler.execute(mockKV, {
					key: testKey,
					value: testValue,
				}),
			).rejects.toThrow('Bucket not found');

			expect(mockKV.put).toHaveBeenCalledWith(testKey, testValue);
		});

		it('should propagate permission errors', async () => {
			const testKey = 'restricted.key';
			const testValue = 'restricted value';
			const permissionError = createPermissionError('Permission denied');

			mockKV.put.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockKV, {
					key: testKey,
					value: testValue,
				}),
			).rejects.toThrow('Permission denied');

			expect(mockKV.put).toHaveBeenCalledWith(testKey, testValue);
		});

		it('should handle zero revision response', async () => {
			const testKey = 'test.key';
			const testValue = 'test value';
			const mockRevision = 0;

			mockKV.put.mockResolvedValue(mockRevision);

			const result = await handler.execute(mockKV, {
				key: testKey,
				value: testValue,
			});

			expect(result).toEqual({
				revision: mockRevision,
			});
		});

		it('should handle network timeout errors', async () => {
			const testKey = 'test.key';
			const testValue = 'test value';
			const timeoutError = new Error('Request timeout');
			(timeoutError as any).code = 'TIMEOUT';

			mockKV.put.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockKV, {
					key: testKey,
					value: testValue,
				}),
			).rejects.toThrow('Request timeout');
		});
	});
});
