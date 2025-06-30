import { PutObjectOperationHandler } from '../../../operations/os/PutObjectOperationHandler';
import { createMockObjectStore, sampleObjectInfo } from '../testUtils';

describe('PutObjectOperationHandler', () => {
	let handler: PutObjectOperationHandler;
	let mockOS: ReturnType<typeof createMockObjectStore>;

	beforeEach(() => {
		handler = new PutObjectOperationHandler();
		mockOS = createMockObjectStore();
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
		it('should put object successfully', async () => {
			const objectName = 'test-file.txt';
			const testData = new Uint8Array([65, 66, 67]); // "ABC"

			mockOS.putBlob.mockResolvedValue(sampleObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: testData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, testData);
			expect(result).toEqual(sampleObjectInfo);
		});

		it('should put binary object successfully', async () => {
			const objectName = 'binary-file.bin';
			const binaryData = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG header
			const expectedObjectInfo = {
				...sampleObjectInfo,
				name: objectName,
				size: binaryData.length,
			};

			mockOS.putBlob.mockResolvedValue(expectedObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: binaryData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, binaryData);
			expect(result).toEqual(expectedObjectInfo);
		});

		it('should put large object successfully', async () => {
			const objectName = 'large-file.dat';
			const largeData = new Uint8Array(1024 * 1024); // 1MB
			largeData.fill(42);
			const expectedObjectInfo = {
				...sampleObjectInfo,
				name: objectName,
				size: largeData.length,
				chunks: 1024, // Large file might be chunked
			};

			mockOS.putBlob.mockResolvedValue(expectedObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: largeData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, largeData);
			expect(result).toEqual(expectedObjectInfo);
		});

		it('should put empty object successfully', async () => {
			const objectName = 'empty-file.txt';
			const emptyData = new Uint8Array(0);
			const expectedObjectInfo = {
				...sampleObjectInfo,
				name: objectName,
				size: 0,
			};

			mockOS.putBlob.mockResolvedValue(expectedObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: emptyData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, emptyData);
			expect(result).toEqual(expectedObjectInfo);
		});

		it('should handle object names with special characters', async () => {
			const objectName = 'test-file_with-special.chars@123.txt';
			const testData = new Uint8Array([84, 101, 115, 116]); // "Test"
			const expectedObjectInfo = {
				...sampleObjectInfo,
				name: objectName,
			};

			mockOS.putBlob.mockResolvedValue(expectedObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: testData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, testData);
			expect(result).toEqual(expectedObjectInfo);
		});

		it('should handle object names with path separators', async () => {
			const objectName = 'folder/subfolder/file.txt';
			const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
			const expectedObjectInfo = {
				...sampleObjectInfo,
				name: objectName,
			};

			mockOS.putBlob.mockResolvedValue(expectedObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: testData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, testData);
			expect(result).toEqual(expectedObjectInfo);
		});

		it('should handle Unicode object names', async () => {
			const objectName = 'файл-тест-🚀.txt';
			const testData = new Uint8Array([240, 159, 154, 128]); // 🚀 emoji in UTF-8
			const expectedObjectInfo = {
				...sampleObjectInfo,
				name: objectName,
			};

			mockOS.putBlob.mockResolvedValue(expectedObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: testData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, testData);
			expect(result).toEqual(expectedObjectInfo);
		});

		it('should throw error when data is not provided', async () => {
			const objectName = 'test-file.txt';

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'no data provided',
			);
			expect(mockOS.putBlob).not.toHaveBeenCalled();
		});

		it('should throw error when data is null', async () => {
			const objectName = 'test-file.txt';

			await expect(
				handler.execute(mockOS, {
					name: objectName,
					data: null as any,
				}),
			).rejects.toThrow('no data provided');
			expect(mockOS.putBlob).not.toHaveBeenCalled();
		});

		it('should throw error when data is undefined', async () => {
			const objectName = 'test-file.txt';

			await expect(
				handler.execute(mockOS, {
					name: objectName,
					data: undefined,
				}),
			).rejects.toThrow('no data provided');
			expect(mockOS.putBlob).not.toHaveBeenCalled();
		});

		it('should propagate bucket not found errors', async () => {
			const objectName = 'file-in-missing-bucket.txt';
			const testData = new Uint8Array([116, 101, 115, 116]); // "test"

			const bucketError = new Error('Bucket does not exist');
			mockOS.putBlob.mockRejectedValue(bucketError);

			await expect(
				handler.execute(mockOS, {
					name: objectName,
					data: testData,
				}),
			).rejects.toThrow('Bucket does not exist');
			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, testData);
		});

		it('should propagate permission errors', async () => {
			const objectName = 'restricted-file.txt';
			const testData = new Uint8Array([116, 101, 115, 116]); // "test"

			const permissionError = new Error('Permission denied for object creation');
			mockOS.putBlob.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockOS, {
					name: objectName,
					data: testData,
				}),
			).rejects.toThrow('Permission denied for object creation');
		});

		it('should propagate quota exceeded errors', async () => {
			const objectName = 'large-file.txt';
			const testData = new Uint8Array([116, 101, 115, 116]); // "test"

			const quotaError = new Error('Storage quota exceeded');
			mockOS.putBlob.mockRejectedValue(quotaError);

			await expect(
				handler.execute(mockOS, {
					name: objectName,
					data: testData,
				}),
			).rejects.toThrow('Storage quota exceeded');
		});

		it('should propagate NATS connection errors', async () => {
			const objectName = 'test-file.txt';
			const testData = new Uint8Array([116, 101, 115, 116]); // "test"

			const connectionError = new Error('NATS connection closed');
			mockOS.putBlob.mockRejectedValue(connectionError);

			await expect(
				handler.execute(mockOS, {
					name: objectName,
					data: testData,
				}),
			).rejects.toThrow('NATS connection closed');
		});

		it('should handle timeout errors', async () => {
			const objectName = 'slow-upload.txt';
			const testData = new Uint8Array([116, 101, 115, 116]); // "test"

			const timeoutError = new Error('Upload timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOS.putBlob.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockOS, {
					name: objectName,
					data: testData,
				}),
			).rejects.toThrow('Upload timeout');
		});

		it('should handle object already exists scenarios', async () => {
			const objectName = 'existing-file.txt';
			const testData = new Uint8Array([116, 101, 115, 116]); // "test"
			const expectedObjectInfo = {
				...sampleObjectInfo,
				name: objectName,
				mtime: new Date(), // Updated timestamp
			};

			mockOS.putBlob.mockResolvedValue(expectedObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: testData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, testData);
			expect(result).toEqual(expectedObjectInfo);
		});

		it('should handle object with very long name', async () => {
			const objectName = 'a'.repeat(1000) + '.txt';
			const testData = new Uint8Array([116, 101, 115, 116]); // "test"
			const expectedObjectInfo = {
				...sampleObjectInfo,
				name: objectName,
			};

			mockOS.putBlob.mockResolvedValue(expectedObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: testData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, testData);
			expect(result).toEqual(expectedObjectInfo);
		});

		it('should handle multiple chunk uploads for large files', async () => {
			const objectName = 'multi-chunk-file.dat';
			const largeData = new Uint8Array(5 * 1024 * 1024); // 5MB
			largeData.fill(123);
			const expectedObjectInfo = {
				...sampleObjectInfo,
				name: objectName,
				size: largeData.length,
				chunks: 5,
			};

			mockOS.putBlob.mockResolvedValue(expectedObjectInfo as any);

			const result = await handler.execute(mockOS, { name: objectName, data: largeData });

			expect(mockOS.putBlob).toHaveBeenCalledWith({ name: objectName }, largeData);
			expect(result).toEqual(expectedObjectInfo);
		});

		it('should handle concurrent upload scenarios', async () => {
			const objectName = 'concurrent-file.txt';
			const testData = new Uint8Array([116, 101, 115, 116]); // "test"

			const concurrentError = new Error('Concurrent modification detected');
			(concurrentError as any).code = 'CONCURRENT_MODIFICATION';
			mockOS.putBlob.mockRejectedValue(concurrentError);

			await expect(
				handler.execute(mockOS, {
					name: objectName,
					data: testData,
				}),
			).rejects.toThrow('Concurrent modification detected');
		});
	});
});
