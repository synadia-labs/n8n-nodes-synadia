import { InfoObjectOperationHandler } from '../operations/InfoObjectOperationHandler';
import { createMockObjectStore, sampleObjectInfo } from './testUtils';

describe('InfoObjectOperationHandler', () => {
	let handler: InfoObjectOperationHandler;
	let mockOS: ReturnType<typeof createMockObjectStore>;

	beforeEach(() => {
		handler = new InfoObjectOperationHandler();
		mockOS = createMockObjectStore();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('info');
		});
	});

	describe('execute', () => {
		it('should get object info successfully', async () => {
			const objectName = 'test-file.txt';
			const objectInfo = { ...sampleObjectInfo, name: objectName };

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should return found false when object does not exist', async () => {
			const objectName = 'nonexistent-file.txt';

			mockOS.info.mockResolvedValue(null);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: false,
			});
		});

		it('should return found false when info is undefined', async () => {
			const objectName = 'undefined-info-file.txt';

			mockOS.info.mockResolvedValue(undefined as any);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: false,
			});
		});

		it('should get info for object with special characters in name', async () => {
			const objectName = 'test-file_with-special.chars@123.txt';
			const objectInfo = { ...sampleObjectInfo, name: objectName };

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should get info for object with path separators in name', async () => {
			const objectName = 'folder/subfolder/file.txt';
			const objectInfo = { ...sampleObjectInfo, name: objectName };

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should handle Unicode object names', async () => {
			const objectName = 'файл-тест-🚀.txt';
			const objectInfo = { ...sampleObjectInfo, name: objectName };

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should handle very long object names', async () => {
			const objectName = 'a'.repeat(1000) + '.txt';
			const objectInfo = { ...sampleObjectInfo, name: objectName };

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should get info for large object', async () => {
			const objectName = 'large-file.dat';
			const objectInfo = {
				...sampleObjectInfo,
				name: objectName,
				size: 1024 * 1024 * 10, // 10MB
				chunks: 10,
			};

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should get info for empty object', async () => {
			const objectName = 'empty-file.txt';
			const objectInfo = {
				...sampleObjectInfo,
				name: objectName,
				size: 0,
				chunks: 0,
			};

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should get info for deleted object', async () => {
			const objectName = 'deleted-file.txt';
			const objectInfo = {
				...sampleObjectInfo,
				name: objectName,
				deleted: true,
			};

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should handle objects with dots in name', async () => {
			const objectName = '.hidden-file.txt';
			const objectInfo = { ...sampleObjectInfo, name: objectName };

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should handle empty string object name', async () => {
			const objectName = '';

			mockOS.info.mockResolvedValue(null);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: false,
			});
		});

		it('should handle objects with spaces in name', async () => {
			const objectName = 'file with spaces.txt';
			const objectInfo = { ...sampleObjectInfo, name: objectName };

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should get info for object with multiple revisions', async () => {
			const objectName = 'versioned-file.txt';
			const objectInfo = {
				...sampleObjectInfo,
				name: objectName,
				revision: 5,
			};

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should propagate permission errors', async () => {
			const objectName = 'restricted-file.txt';

			const permissionError = new Error('Permission denied');
			mockOS.info.mockRejectedValue(permissionError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Permission denied',
			);
			expect(mockOS.info).toHaveBeenCalledWith(objectName);
		});

		it('should propagate bucket not found errors', async () => {
			const objectName = 'file-in-missing-bucket.txt';

			const bucketError = new Error('Bucket does not exist');
			mockOS.info.mockRejectedValue(bucketError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Bucket does not exist',
			);
		});

		it('should propagate NATS connection errors', async () => {
			const objectName = 'test-file.txt';

			const connectionError = new Error('NATS connection closed');
			mockOS.info.mockRejectedValue(connectionError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'NATS connection closed',
			);
		});

		it('should propagate timeout errors', async () => {
			const objectName = 'slow-info-file.txt';

			const timeoutError = new Error('Request timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOS.info.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Request timeout',
			);
		});

		it('should propagate network errors', async () => {
			const objectName = 'network-issue-file.txt';

			const networkError = new Error('Network connection timeout');
			mockOS.info.mockRejectedValue(networkError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Network connection timeout',
			);
		});

		it('should propagate authorization errors', async () => {
			const objectName = 'unauthorized-file.txt';

			const authError = new Error('Unauthorized access');
			(authError as any).code = '401';
			mockOS.info.mockRejectedValue(authError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Unauthorized access',
			);
		});

		it('should propagate stream errors', async () => {
			const objectName = 'stream-error-file.txt';

			const streamError = new Error('Stream not found');
			mockOS.info.mockRejectedValue(streamError);

			await expect(handler.execute(mockOS, { name: objectName })).rejects.toThrow(
				'Stream not found',
			);
		});

		it('should handle object with complex metadata', async () => {
			const objectName = 'complex-metadata-file.txt';
			const objectInfo = {
				...sampleObjectInfo,
				name: objectName,
				description: 'Complex object with extensive metadata',
				size: 2048,
				chunks: 3,
				digest: 'SHA-256=def456',
				mtime: new Date('2023-01-15T10:30:00Z').toISOString(),
				revision: 10,
			};

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should handle objects with only extension', async () => {
			const objectName = '.config';
			const objectInfo = { ...sampleObjectInfo, name: objectName };

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});

		it('should handle objects with multiple extensions', async () => {
			const objectName = 'archive.tar.gz';
			const objectInfo = { ...sampleObjectInfo, name: objectName };

			mockOS.info.mockResolvedValue(objectInfo);

			const result = await handler.execute(mockOS, { name: objectName });

			expect(mockOS.info).toHaveBeenCalledWith(objectName);
			expect(result).toEqual({
				found: true,
				info: objectInfo,
			});
		});
	});
});
