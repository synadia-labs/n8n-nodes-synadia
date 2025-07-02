import { DeleteOperationHandler } from '../operations/DeleteOperationHandler';
import { createMockKV, createNotFoundError, createPermissionError } from './testUtils';
import { KV } from '../../../bundled/nats-bundled';

describe('DeleteOperationHandler', () => {
	let handler: DeleteOperationHandler;
	let mockKV: jest.Mocked<KV>;

	beforeEach(() => {
		handler = new DeleteOperationHandler();
		mockKV = createMockKV();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('delete');
		});
	});

	describe('execute', () => {
		it('should delete an existing key successfully', async () => {
			const testKey = 'test.key';

			mockKV.delete.mockResolvedValue(undefined);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(mockKV.delete).toHaveBeenCalledWith(testKey);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle deletion of non-existent key', async () => {
			const testKey = 'nonexistent.key';
			const mockRevision = 0; // NATS typically returns 0 for deletions of non-existent keys

			mockKV.delete.mockResolvedValue(undefined);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(mockKV.delete).toHaveBeenCalledWith(testKey);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle special characters in key', async () => {
			const specialKey = 'special.key-with_chars/123:test@domain.com';
			const mockRevision = 3;

			mockKV.delete.mockResolvedValue(undefined);

			const result = await handler.execute(mockKV, { key: specialKey });

			expect(mockKV.delete).toHaveBeenCalledWith(specialKey);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle empty key parameter', async () => {
			const testKey = '';

			mockKV.delete.mockResolvedValue(undefined);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(mockKV.delete).toHaveBeenCalledWith(testKey);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle undefined key parameter', async () => {
			mockKV.delete.mockResolvedValue(undefined);

			const result = await handler.execute(mockKV, { key: undefined as any });

			expect(mockKV.delete).toHaveBeenCalledWith(undefined);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should propagate bucket not found errors', async () => {
			const testKey = 'test.key';
			const natsError = createNotFoundError('Bucket not found');

			mockKV.delete.mockRejectedValue(natsError);

			await expect(handler.execute(mockKV, { key: testKey })).rejects.toThrow('Bucket not found');
			expect(mockKV.delete).toHaveBeenCalledWith(testKey);
		});

		it('should propagate permission errors', async () => {
			const testKey = 'restricted.key';
			const permissionError = createPermissionError('Permission denied for delete operation');

			mockKV.delete.mockRejectedValue(permissionError);

			await expect(handler.execute(mockKV, { key: testKey })).rejects.toThrow(
				'Permission denied for delete operation',
			);
			expect(mockKV.delete).toHaveBeenCalledWith(testKey);
		});

		it('should handle network timeout errors', async () => {
			const testKey = 'test.key';
			const timeoutError = new Error('Delete operation timeout');
			(timeoutError as any).code = 'TIMEOUT';

			mockKV.delete.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockKV, { key: testKey })).rejects.toThrow(
				'Delete operation timeout',
			);
			expect(mockKV.delete).toHaveBeenCalledWith(testKey);
		});

		it('should handle deletion successfully regardless of content', async () => {
			const testKey = 'any.key';

			mockKV.delete.mockResolvedValue(undefined);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle concurrent deletion scenarios', async () => {
			const testKey = 'concurrent.key';
			const concurrentError = new Error('Concurrent modification detected');
			(concurrentError as any).code = 'CONCURRENT_MODIFICATION';

			mockKV.delete.mockRejectedValue(concurrentError);

			await expect(handler.execute(mockKV, { key: testKey })).rejects.toThrow(
				'Concurrent modification detected',
			);
		});

		it('should handle key pattern edge cases', async () => {
			const edgeCaseKey = '.leading.dot.key.';
			const mockRevision = 1;

			mockKV.delete.mockResolvedValue(undefined);

			const result = await handler.execute(mockKV, { key: edgeCaseKey });

			expect(mockKV.delete).toHaveBeenCalledWith(edgeCaseKey);
			expect(result).toEqual({
				deleted: true,
			});
		});
	});
});
