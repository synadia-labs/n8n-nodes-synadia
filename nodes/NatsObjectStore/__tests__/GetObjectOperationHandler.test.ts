import { GetObjectOperationHandler } from '../operations/GetObjectOperationHandler';
import { createMockObjectStore } from './testUtils';

describe('GetObjectOperationHandler', () => {
	let handler: GetObjectOperationHandler;
	let mockOS: ReturnType<typeof createMockObjectStore>;

	beforeEach(() => {
		handler = new GetObjectOperationHandler();
		mockOS = createMockObjectStore();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('get');
		});
	});

	describe('execute', () => {
		it('should get object successfully', async () => {
			const objectName = 'test-file.txt';
			const testData = new Uint8Array([65, 66, 67]); // "ABC"

			mockOS.getBlob.mockResolvedValue(testData);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				data: testData,
			});
		});

		it('should get binary object successfully', async () => {
			const objectName = 'binary-file.bin';
			const binaryData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG header

			mockOS.getBlob.mockResolvedValue(binaryData);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				data: binaryData,
			});
		});

		it('should get large object successfully', async () => {
			const objectName = 'large-file.dat';
			const largeData = new Uint8Array(1024 * 1024); // 1MB
			largeData.fill(42);

			mockOS.getBlob.mockResolvedValue(largeData);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				data: largeData,
			});
		});

		it('should handle empty object', async () => {
			const objectName = 'empty-file.txt';
			const emptyData = new Uint8Array(0);

			mockOS.getBlob.mockResolvedValue(emptyData);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				data: emptyData,
			});
		});

		it('should handle object names with special characters', async () => {
			const objectName = 'test-file_with-special.chars@123.txt';
			const testData = new Uint8Array([84, 101, 115, 116]); // "Test"

			mockOS.getBlob.mockResolvedValue(testData);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				data: testData,
			});
		});

		it('should handle object names with path separators', async () => {
			const objectName = 'folder/subfolder/file.txt';
			const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"

			mockOS.getBlob.mockResolvedValue(testData);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				data: testData,
			});
		});

		it('should return found false when object not found', async () => {
			const objectName = 'nonexistent-file.txt';

			const notFoundError = new Error('Object not found');
			mockOS.getBlob.mockRejectedValue(notFoundError);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: false,
			});
		});

		it('should return found false when error message contains "not found"', async () => {
			const objectName = 'missing-file.txt';

			const notFoundError = new Error('The requested object was not found in the bucket');
			mockOS.getBlob.mockRejectedValue(notFoundError);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(result).toEqual({
				found: false,
			});
		});

		it('should propagate errors that do not contain "not found" (case sensitive)', async () => {
			const objectName = 'missing-file.txt';

			const notFoundError = new Error('Item MISSING in storage');
			mockOS.getBlob.mockRejectedValue(notFoundError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Item MISSING in storage',
			);
		});

		it('should propagate non-"not found" errors', async () => {
			const objectName = 'problem-file.txt';

			const networkError = new Error('Network connection timeout');
			mockOS.getBlob.mockRejectedValue(networkError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Network connection timeout',
			);
			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
		});

		it('should propagate permission errors', async () => {
			const objectName = 'restricted-file.txt';

			const permissionError = new Error('Permission denied');
			mockOS.getBlob.mockRejectedValue(permissionError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Permission denied',
			);
		});

		it('should propagate bucket not found errors', async () => {
			const objectName = 'file-in-missing-bucket.txt';

			const bucketError = new Error('Bucket does not exist');
			mockOS.getBlob.mockRejectedValue(bucketError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Bucket does not exist',
			);
		});

		it('should propagate NATS connection errors', async () => {
			const objectName = 'test-file.txt';

			const connectionError = new Error('NATS connection closed');
			mockOS.getBlob.mockRejectedValue(connectionError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'NATS connection closed',
			);
		});

		it('should handle object with very long name', async () => {
			const objectName = 'a'.repeat(1000) + '.txt';
			const testData = new Uint8Array([116, 101, 115, 116]); // "test"

			mockOS.getBlob.mockResolvedValue(testData);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				data: testData,
			});
		});

		it('should handle Unicode object names', async () => {
			const objectName = 'файл-тест-🚀.txt';
			const testData = new Uint8Array([240, 159, 154, 128]); // 🚀 emoji in UTF-8

			mockOS.getBlob.mockResolvedValue(testData);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.getBlob).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				data: testData,
			});
		});

		it('should handle timeout errors', async () => {
			const objectName = 'slow-file.txt';

			const timeoutError = new Error('Request timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOS.getBlob.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Request timeout',
			);
		});

		it('should handle corrupted object errors', async () => {
			const objectName = 'corrupted-file.txt';

			const corruptionError = new Error('Object data is corrupted');
			mockOS.getBlob.mockRejectedValue(corruptionError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Object data is corrupted',
			);
		});
	});
});
