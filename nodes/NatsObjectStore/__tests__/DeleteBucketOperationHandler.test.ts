import { DeleteBucketOperationHandler } from '../operations/DeleteBucketOperationHandler';
import { createMockObjm, createMockObjectStore } from './testUtils';

describe('DeleteBucketOperationHandler', () => {
	let handler: DeleteBucketOperationHandler;
	let mockOsm: ReturnType<typeof createMockObjm>;
	let mockOS: ReturnType<typeof createMockObjectStore>;

	beforeEach(() => {
		handler = new DeleteBucketOperationHandler();
		mockOsm = createMockObjm();
		mockOS = createMockObjectStore();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('deleteBucket');
		});
	});

	describe('execute', () => {
		it('should delete object store bucket successfully', async () => {
			const bucketName = 'test-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.destroy.mockResolvedValue(true);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				success: true,
			});
		});

		it('should handle bucket deletion failure', async () => {
			const bucketName = 'test-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.destroy.mockResolvedValue(false);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				success: false,
			});
		});

		it('should delete bucket with special characters in name', async () => {
			const bucketName = 'bucket-with_special.chars123';

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.destroy.mockResolvedValue(true);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				success: true,
			});
		});

		it('should delete bucket with dashes and underscores', async () => {
			const bucketName = 'test-bucket_name-123';

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.destroy.mockResolvedValue(true);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(result).toEqual({
				success: true,
			});
		});

		it('should delete bucket with long name', async () => {
			const bucketName =
				'very-long-object-store-bucket-name-with-many-characters-and-descriptive-text';

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.destroy.mockResolvedValue(true);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(result).toEqual({
				success: true,
			});
		});

		it('should propagate bucket not found errors on open', async () => {
			const bucketName = 'nonexistent-bucket';

			const notFoundError = new Error('Object store bucket does not exist');
			(notFoundError as any).code = '404';
			mockOsm.open.mockRejectedValue(notFoundError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Object store bucket does not exist');
			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.destroy).not.toHaveBeenCalled();
		});

		it('should propagate permission errors', async () => {
			const bucketName = 'restricted-bucket';

			const permissionError = new Error('Permission denied for object store deletion');
			(permissionError as any).code = '403';
			mockOsm.open.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Permission denied for object store deletion');
			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
		});

		it('should propagate permission errors on destroy', async () => {
			const bucketName = 'restricted-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const permissionError = new Error('Permission denied for object store destruction');
			(permissionError as any).code = '403';
			mockOS.destroy.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Permission denied for object store destruction');
			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.destroy).toHaveBeenCalled();
		});

		it('should propagate NATS connection errors', async () => {
			const bucketName = 'test-bucket';

			const connectionError = new Error('NATS connection closed');
			mockOsm.open.mockRejectedValue(connectionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('NATS connection closed');
		});

		it('should propagate NATS connection errors on destroy', async () => {
			const bucketName = 'test-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const connectionError = new Error('NATS connection closed during destroy');
			mockOS.destroy.mockRejectedValue(connectionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('NATS connection closed during destroy');
		});

		it('should handle timeout errors on open', async () => {
			const bucketName = 'timeout-bucket';

			const timeoutError = new Error('Object store open timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOsm.open.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Object store open timeout');
		});

		it('should handle timeout errors on destroy', async () => {
			const bucketName = 'timeout-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const timeoutError = new Error('Object store destroy timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOS.destroy.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Object store destroy timeout');
		});

		it('should handle JetStream not enabled errors', async () => {
			const bucketName = 'test-bucket';

			const jetStreamError = new Error('JetStream not enabled for account');
			(jetStreamError as any).code = '503';
			mockOsm.open.mockRejectedValue(jetStreamError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('JetStream not enabled for account');
		});

		it('should handle bucket in use errors', async () => {
			const bucketName = 'busy-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const busyError = new Error('Object store has active objects');
			(busyError as any).code = '409';
			mockOS.destroy.mockRejectedValue(busyError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Object store has active objects');
		});

		it('should handle empty bucket name', async () => {
			const emptyBucketName = '';

			const emptyError = new Error('Invalid object store bucket name');
			(emptyError as any).code = '400';
			mockOsm.open.mockRejectedValue(emptyError);

			await expect(
				handler.execute(mockOsm, {
					bucket: emptyBucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Invalid object store bucket name');
		});

		it('should handle bucket with active watchers', async () => {
			const bucketName = 'watched-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const watcherError = new Error('Object store has active watchers');
			mockOS.destroy.mockRejectedValue(watcherError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Object store has active watchers');
		});

		it('should handle network errors', async () => {
			const bucketName = 'network-bucket';

			const networkError = new Error('Network connection lost');
			mockOsm.open.mockRejectedValue(networkError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Network connection lost');
		});

		it('should handle concurrent deletion scenarios', async () => {
			const bucketName = 'concurrent-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const concurrentError = new Error('Concurrent modification detected');
			(concurrentError as any).code = 'CONCURRENT_MODIFICATION';
			mockOS.destroy.mockRejectedValue(concurrentError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Concurrent modification detected');
		});

		it('should handle bucket already deleted scenarios', async () => {
			const bucketName = 'already-deleted-bucket';

			const alreadyDeletedError = new Error('Object store bucket already deleted');
			(alreadyDeletedError as any).code = '404';
			mockOsm.open.mockRejectedValue(alreadyDeletedError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Object store bucket already deleted');
		});

		it('should handle server errors', async () => {
			const bucketName = 'server-error-bucket';

			const serverError = new Error('Internal server error');
			(serverError as any).code = '500';
			mockOsm.open.mockRejectedValue(serverError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Internal server error');
		});

		it('should handle sealed bucket deletion', async () => {
			const bucketName = 'sealed-bucket';

			const sealedError = new Error('Cannot delete sealed object store');
			(sealedError as any).code = '409';
			mockOsm.open.mockRejectedValue(sealedError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Cannot delete sealed object store');
		});

		it('should delete bucket despite destroy returning false initially', async () => {
			const bucketName = 'eventual-delete-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			// Simulate a case where destroy returns false (cleanup still pending)
			mockOS.destroy.mockResolvedValue(false);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				success: false,
			});
		});

		it('should handle bucket with large number of objects', async () => {
			const bucketName = 'large-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const largeError = new Error('Cannot delete bucket with many objects without force flag');
			mockOS.destroy.mockRejectedValue(largeError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Cannot delete bucket with many objects without force flag');
		});

		it('should handle replicated bucket deletion', async () => {
			const bucketName = 'replicated-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.destroy.mockResolvedValue(true);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				success: true,
			});
		});
	});
});
