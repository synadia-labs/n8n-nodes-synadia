import { DeleteObjectOperationHandler } from '../../../operations/os/DeleteObjectOperationHandler';
import { createMockObjectStore } from '../testUtils';

describe('DeleteObjectOperationHandler', () => {
	let handler: DeleteObjectOperationHandler;
	let mockOS: ReturnType<typeof createMockObjectStore>;

	beforeEach(() => {
		handler = new DeleteObjectOperationHandler();
		mockOS = createMockObjectStore();
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
		it('should delete object successfully', async () => {
			const objectName = 'test-file.txt';

			mockOS.delete.mockResolvedValue({ success: true, purged: 1 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: true, purged: 1 },
			});
		});

		it('should return false when object does not exist', async () => {
			const objectName = 'nonexistent-file.txt';

			mockOS.delete.mockResolvedValue({ success: false, purged: 0 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: false, purged: 0 },
			});
		});

		it('should delete object with special characters in name', async () => {
			const objectName = 'test-file_with-special.chars@123.txt';

			mockOS.delete.mockResolvedValue({ success: true, purged: 1 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: true, purged: 1 },
			});
		});

		it('should delete object with path separators in name', async () => {
			const objectName = 'folder/subfolder/file.txt';

			mockOS.delete.mockResolvedValue({ success: true, purged: 1 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: true, purged: 1 },
			});
		});

		it('should handle Unicode object names', async () => {
			const objectName = 'файл-тест-🚀.txt';

			mockOS.delete.mockResolvedValue({ success: true, purged: 1 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: true, purged: 1 },
			});
		});

		it('should handle very long object names', async () => {
			const objectName = 'a'.repeat(1000) + '.txt';

			mockOS.delete.mockResolvedValue({ success: true, purged: 1 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: true, purged: 1 },
			});
		});

		it('should handle empty string object name', async () => {
			const objectName = '';

			mockOS.delete.mockResolvedValue({ success: false, purged: 0 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: false, purged: 0 },
			});
		});

		it('should handle objects with dots in name', async () => {
			const objectName = '.hidden-file.txt';

			mockOS.delete.mockResolvedValue({ success: true, purged: 1 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: true, purged: 1 },
			});
		});

		it('should handle objects with only extension', async () => {
			const objectName = '.txt';

			mockOS.delete.mockResolvedValue({ success: false, purged: 0 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: false, purged: 0 },
			});
		});

		it('should propagate permission errors', async () => {
			const objectName = 'restricted-file.txt';

			const permissionError = new Error('Permission denied');
			mockOS.delete.mockRejectedValue(permissionError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Permission denied',
			);
			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
		});

		it('should propagate bucket not found errors', async () => {
			const objectName = 'file-in-missing-bucket.txt';

			const bucketError = new Error('Bucket does not exist');
			mockOS.delete.mockRejectedValue(bucketError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Bucket does not exist',
			);
		});

		it('should propagate NATS connection errors', async () => {
			const objectName = 'test-file.txt';

			const connectionError = new Error('NATS connection closed');
			mockOS.delete.mockRejectedValue(connectionError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'NATS connection closed',
			);
		});

		it('should propagate timeout errors', async () => {
			const objectName = 'slow-delete-file.txt';

			const timeoutError = new Error('Request timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOS.delete.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Request timeout',
			);
		});

		it('should propagate network errors', async () => {
			const objectName = 'network-issue-file.txt';

			const networkError = new Error('Network connection timeout');
			mockOS.delete.mockRejectedValue(networkError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Network connection timeout',
			);
		});

		it('should propagate authorization errors', async () => {
			const objectName = 'unauthorized-file.txt';

			const authError = new Error('Unauthorized access');
			(authError as any).code = '401';
			mockOS.delete.mockRejectedValue(authError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Unauthorized access',
			);
		});

		it('should propagate stream errors', async () => {
			const objectName = 'stream-error-file.txt';

			const streamError = new Error('Stream not found');
			mockOS.delete.mockRejectedValue(streamError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Stream not found',
			);
		});

		it('should handle null return value as false', async () => {
			const objectName = 'null-return-file.txt';

			mockOS.delete.mockResolvedValue({ success: false, purged: 0 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: false, purged: 0 },
			});
		});

		it('should handle undefined return value as false', async () => {
			const objectName = 'undefined-return-file.txt';

			mockOS.delete.mockResolvedValue({ success: false, purged: 0 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: false, purged: 0 },
			});
		});

		it('should handle objects with spaces in name', async () => {
			const objectName = 'file with spaces.txt';

			mockOS.delete.mockResolvedValue({ success: true, purged: 1 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: true, purged: 1 },
			});
		});

		it('should handle objects with multiple extensions', async () => {
			const objectName = 'archive.tar.gz';

			mockOS.delete.mockResolvedValue({ success: true, purged: 1 } as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.delete).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				deleted: { success: true, purged: 1 },
			});
		});
	});
});
