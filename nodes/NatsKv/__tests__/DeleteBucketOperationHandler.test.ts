import { DeleteBucketOperationHandler } from '../operations/DeleteBucketOperationHandler';
import { createMockKvm, createMockKV } from './testUtils';

describe('DeleteBucketOperationHandler', () => {
	let handler: DeleteBucketOperationHandler;
	let mockKvm: ReturnType<typeof createMockKvm>;
	let mockKV: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		handler = new DeleteBucketOperationHandler();
		mockKvm = createMockKvm();
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
		it('should delete KV bucket successfully', async () => {
			const bucketName = 'test-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.destroy.mockResolvedValue(true);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle bucket deletion failure', async () => {
			const bucketName = 'test-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.destroy.mockResolvedValue(false);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				deleted: false,
			});
		});

		it('should delete bucket with special characters in name', async () => {
			const bucketName = 'bucket-with_special.chars123';

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.destroy.mockResolvedValue(true);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should delete bucket with dashes and underscores', async () => {
			const bucketName = 'test-bucket_name-123';

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.destroy.mockResolvedValue(true);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should delete bucket with long name', async () => {
			const bucketName = 'very-long-bucket-name-with-many-characters-and-descriptive-text';

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.destroy.mockResolvedValue(true);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should propagate bucket not found errors on open', async () => {
			const bucketName = 'nonexistent-bucket';

			const notFoundError = new Error('Bucket does not exist');
			(notFoundError as any).code = '404';
			mockKvm.open.mockRejectedValue(notFoundError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket does not exist',
			);
			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.destroy).not.toHaveBeenCalled();
		});

		it('should propagate permission errors', async () => {
			const bucketName = 'restricted-bucket';

			const permissionError = new Error('Permission denied for bucket deletion');
			(permissionError as any).code = '403';
			mockKvm.open.mockRejectedValue(permissionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Permission denied for bucket deletion',
			);
			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
		});

		it('should propagate permission errors on destroy', async () => {
			const bucketName = 'restricted-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			const permissionError = new Error('Permission denied for bucket destruction');
			(permissionError as any).code = '403';
			mockKV.destroy.mockRejectedValue(permissionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Permission denied for bucket destruction',
			);
			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.destroy).toHaveBeenCalled();
		});

		it('should propagate NATS connection errors', async () => {
			const bucketName = 'test-bucket';

			const connectionError = new Error('NATS connection closed');
			mockKvm.open.mockRejectedValue(connectionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'NATS connection closed',
			);
		});

		it('should propagate NATS connection errors on destroy', async () => {
			const bucketName = 'test-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			const connectionError = new Error('NATS connection closed during destroy');
			mockKV.destroy.mockRejectedValue(connectionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'NATS connection closed during destroy',
			);
		});

		it('should handle timeout errors on open', async () => {
			const bucketName = 'timeout-bucket';

			const timeoutError = new Error('Bucket open timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockKvm.open.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket open timeout',
			);
		});

		it('should handle timeout errors on destroy', async () => {
			const bucketName = 'timeout-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			const timeoutError = new Error('Bucket destroy timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockKV.destroy.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket destroy timeout',
			);
		});

		it('should handle JetStream not enabled errors', async () => {
			const bucketName = 'test-bucket';

			const jetStreamError = new Error('JetStream not enabled for account');
			(jetStreamError as any).code = '503';
			mockKvm.open.mockRejectedValue(jetStreamError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'JetStream not enabled for account',
			);
		});

		it('should handle bucket in use errors', async () => {
			const bucketName = 'busy-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			const busyError = new Error('Bucket has active consumers');
			(busyError as any).code = '409';
			mockKV.destroy.mockRejectedValue(busyError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket has active consumers',
			);
		});

		it('should handle empty bucket name', async () => {
			const emptyBucketName = '';

			const emptyError = new Error('Invalid bucket name');
			(emptyError as any).code = '400';
			mockKvm.open.mockRejectedValue(emptyError);

			await expect(handler.execute(mockKvm, { bucket: emptyBucketName })).rejects.toThrow(
				'Invalid bucket name',
			);
		});

		it('should handle bucket with active watchers', async () => {
			const bucketName = 'watched-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			const watcherError = new Error('Bucket has active watchers');
			mockKV.destroy.mockRejectedValue(watcherError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket has active watchers',
			);
		});

		it('should handle network errors', async () => {
			const bucketName = 'network-bucket';

			const networkError = new Error('Network connection lost');
			mockKvm.open.mockRejectedValue(networkError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Network connection lost',
			);
		});

		it('should handle concurrent deletion scenarios', async () => {
			const bucketName = 'concurrent-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			const concurrentError = new Error('Concurrent modification detected');
			(concurrentError as any).code = 'CONCURRENT_MODIFICATION';
			mockKV.destroy.mockRejectedValue(concurrentError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Concurrent modification detected',
			);
		});

		it('should handle bucket already deleted scenarios', async () => {
			const bucketName = 'already-deleted-bucket';

			const alreadyDeletedError = new Error('Bucket already deleted');
			(alreadyDeletedError as any).code = '404';
			mockKvm.open.mockRejectedValue(alreadyDeletedError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket already deleted',
			);
		});

		it('should handle server errors', async () => {
			const bucketName = 'server-error-bucket';

			const serverError = new Error('Internal server error');
			(serverError as any).code = '500';
			mockKvm.open.mockRejectedValue(serverError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Internal server error',
			);
		});

		it('should delete bucket despite destroy returning false initially', async () => {
			const bucketName = 'eventual-delete-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			// Simulate a case where destroy returns false (cleanup still pending)
			mockKV.destroy.mockResolvedValue(false);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				deleted: false,
			});
		});
	});
});
