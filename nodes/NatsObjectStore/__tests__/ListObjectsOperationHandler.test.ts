import { ListObjectsOperationHandler } from '../operations/ListObjectsOperationHandler';
import { createMockObjectStore, sampleObjectInfo } from './testUtils';

describe('ListObjectsOperationHandler', () => {
	let handler: ListObjectsOperationHandler;
	let mockOS: ReturnType<typeof createMockObjectStore>;

	beforeEach(() => {
		handler = new ListObjectsOperationHandler();
		mockOS = createMockObjectStore();
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
		it('should list objects successfully', async () => {
			const objectInfos = [
				{ ...sampleObjectInfo, name: 'file1.txt' },
				{ ...sampleObjectInfo, name: 'file2.txt' },
				{ ...sampleObjectInfo, name: 'file3.txt' },
			];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 3,
			});
		});

		it('should return empty list when no objects exist', async () => {
			// Mock empty async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					// Empty iterator
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: [],
				count: 0,
			});
		});

		it('should list single object', async () => {
			const objectInfo = { ...sampleObjectInfo, name: 'single-file.txt' };

			// Mock async iterator with single item
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					yield objectInfo;
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: [objectInfo],
				count: 1,
			});
		});

		it('should list objects with various file types', async () => {
			const objectInfos = [
				{ ...sampleObjectInfo, name: 'document.pdf', size: 2048 },
				{ ...sampleObjectInfo, name: 'image.png', size: 1024 },
				{ ...sampleObjectInfo, name: 'video.mp4', size: 5120 },
				{ ...sampleObjectInfo, name: 'archive.zip', size: 512 },
			];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 4,
			});
		});

		it('should list objects with special characters in names', async () => {
			const objectInfos = [
				{ ...sampleObjectInfo, name: 'file_with-special.chars@123.txt' },
				{ ...sampleObjectInfo, name: 'файл-тест-🚀.txt' },
				{ ...sampleObjectInfo, name: 'file with spaces.txt' },
				{ ...sampleObjectInfo, name: '.hidden-file' },
			];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 4,
			});
		});

		it('should list objects with path separators', async () => {
			const objectInfos = [
				{ ...sampleObjectInfo, name: 'folder1/file1.txt' },
				{ ...sampleObjectInfo, name: 'folder1/subfolder/file2.txt' },
				{ ...sampleObjectInfo, name: 'folder2/file3.txt' },
				{ ...sampleObjectInfo, name: 'root-file.txt' },
			];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 4,
			});
		});

		it('should list objects with various sizes', async () => {
			const objectInfos = [
				{ ...sampleObjectInfo, name: 'tiny.txt', size: 0 },
				{ ...sampleObjectInfo, name: 'small.txt', size: 1024 },
				{ ...sampleObjectInfo, name: 'medium.txt', size: 1024 * 1024 },
				{ ...sampleObjectInfo, name: 'large.txt', size: 1024 * 1024 * 10 },
			];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 4,
			});
		});

		it('should list objects with different metadata', async () => {
			const objectInfos = [
				{
					...sampleObjectInfo,
					name: 'file1.txt',
					description: 'First file',
					revision: 1,
					deleted: false,
				},
				{
					...sampleObjectInfo,
					name: 'file2.txt',
					description: 'Second file',
					revision: 5,
					deleted: false,
				},
				{
					...sampleObjectInfo,
					name: 'file3.txt',
					description: 'Deleted file',
					revision: 3,
					deleted: true,
				},
			];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 3,
			});
		});

		it('should handle large number of objects', async () => {
			const objectInfos = Array.from({ length: 1000 }, (_, i) => ({
				...sampleObjectInfo,
				name: `file${i}.txt`,
				size: i * 10,
			}));

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 1000,
			});
		});

		it('should handle objects with very long names', async () => {
			const objectInfos = [
				{ ...sampleObjectInfo, name: 'a'.repeat(1000) + '.txt' },
				{ ...sampleObjectInfo, name: 'b'.repeat(500) + '.pdf' },
			];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 2,
			});
		});

		it('should propagate permission errors', async () => {
			const permissionError = new Error('Permission denied');
			mockOS.list.mockRejectedValue(permissionError);

			await expect(handler.execute(mockOS, {} as any)).rejects.toThrow('Permission denied');
			expect(mockOS.list).toHaveBeenCalledWith();
		});

		it('should propagate bucket not found errors', async () => {
			const bucketError = new Error('Bucket does not exist');
			mockOS.list.mockRejectedValue(bucketError);

			await expect(handler.execute(mockOS, {} as any)).rejects.toThrow('Bucket does not exist');
		});

		it('should propagate NATS connection errors', async () => {
			const connectionError = new Error('NATS connection closed');
			mockOS.list.mockRejectedValue(connectionError);

			await expect(handler.execute(mockOS, {} as any)).rejects.toThrow('NATS connection closed');
		});

		it('should propagate timeout errors', async () => {
			const timeoutError = new Error('Request timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOS.list.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockOS, {} as any)).rejects.toThrow('Request timeout');
		});

		it('should propagate network errors', async () => {
			const networkError = new Error('Network connection timeout');
			mockOS.list.mockRejectedValue(networkError);

			await expect(handler.execute(mockOS, {} as any)).rejects.toThrow(
				'Network connection timeout',
			);
		});

		it('should propagate authorization errors', async () => {
			const authError = new Error('Unauthorized access');
			(authError as any).code = '401';
			mockOS.list.mockRejectedValue(authError);

			await expect(handler.execute(mockOS, {} as any)).rejects.toThrow('Unauthorized access');
		});

		it('should propagate stream errors', async () => {
			const streamError = new Error('Stream not found');
			mockOS.list.mockRejectedValue(streamError);

			await expect(handler.execute(mockOS, {} as any)).rejects.toThrow('Stream not found');
		});

		it('should handle async iterator errors during iteration', async () => {
			// Mock async iterator that throws during iteration
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					yield { ...sampleObjectInfo, name: 'file1.txt' };
					throw new Error('Iterator error during processing');
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			await expect(handler.execute(mockOS, {} as any)).rejects.toThrow(
				'Iterator error during processing',
			);
		});

		it('should handle objects with null values in metadata', async () => {
			const objectInfos = [
				{
					...sampleObjectInfo,
					name: 'file-with-nulls.txt',
					description: null as any,
					digest: null as any,
				},
			];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 1,
			});
		});

		it('should handle objects with undefined values in metadata', async () => {
			const objectInfos = [
				{
					...sampleObjectInfo,
					name: 'file-with-undefined.txt',
					description: undefined as any,
					nuid: undefined as any,
				},
			];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			const result = await handler.execute(mockOS, {} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 1,
			});
		});

		it('should ignore parameters (underscore parameter)', async () => {
			const objectInfos = [{ ...sampleObjectInfo, name: 'test-file.txt' }];

			// Mock async iterator
			const mockAsyncIterator = {
				async *[Symbol.asyncIterator]() {
					for (const info of objectInfos) {
						yield info;
					}
				},
			};

			mockOS.list.mockResolvedValue(mockAsyncIterator as any);

			// Pass some parameters that should be ignored
			const result = await handler.execute(mockOS, {
				name: 'should-be-ignored',
				prefix: 'ignored',
			} as any);

			expect(mockOS.list).toHaveBeenCalledWith();
			expect(result).toEqual({
				objects: objectInfos,
				count: 1,
			});
		});
	});
});
