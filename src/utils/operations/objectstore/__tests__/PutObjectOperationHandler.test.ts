import { PutObjectOperationHandler } from '../PutObjectOperationHandler';

describe('PutObjectOperationHandler', () => {
	let handler: PutObjectOperationHandler;
	let mockOs: any;

	beforeEach(() => {
		handler = new PutObjectOperationHandler();
		
		mockOs = {
			put: jest.fn().mockResolvedValue({
				name: 'test-file.txt',
				size: 1024,
				chunks: 1,
				digest: 'sha256-abc123',
				mtime: '2023-01-01T00:00:00Z',
			}),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should put a string object', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'test-file.txt',
				data: 'Hello, World!',
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.put).toHaveBeenCalled();
			const putCall = mockOs.put.mock.calls[0];
			expect(putCall[0].name).toBe('test-file.txt');
			expect(putCall[0].chunkSize).toBe(131072); // Default chunk size
			
			// Check that a ReadableStream was created
			const stream = putCall[1];
			expect(stream).toBeInstanceOf(ReadableStream);

			expect(result).toEqual({
				operation: 'put',
				bucket: 'test-bucket',
				name: 'test-file.txt',
				success: true,
				info: {
					name: 'test-file.txt',
					size: 1024,
					chunks: 1,
					digest: 'sha256-abc123',
					mtime: '2023-01-01T00:00:00Z',
				},
			});
		});

		it('should put a JSON object', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {
					dataType: 'json',
				},
				itemIndex: 0,
				name: 'data.json',
				data: '{"key": "value"}',
			};

			await handler.execute(mockOs, params);

			const putCall = mockOs.put.mock.calls[0];
			expect(putCall[0].name).toBe('data.json');
		});

		it('should put binary data', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {
					dataType: 'binary',
				},
				itemIndex: 0,
				name: 'binary.dat',
				data: Buffer.from('Hello').toString('base64'),
			};

			await handler.execute(mockOs, params);

			const putCall = mockOs.put.mock.calls[0];
			expect(putCall[0].name).toBe('binary.dat');
		});

		it('should handle custom options', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {
					headers: '{"X-Custom": "value"}',
					description: 'Test file',
					chunkSize: 256 * 1024,
				},
				itemIndex: 0,
				name: 'custom.txt',
				data: 'Test data',
			};

			await handler.execute(mockOs, params);

			const putCall = mockOs.put.mock.calls[0];
			expect(putCall[0].headers).toEqual({ 'X-Custom': 'value' });
			expect(putCall[0].description).toBe('Test file');
			expect(putCall[0].chunkSize).toBe(256 * 1024);
		});

		it('should throw error if name is missing', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				data: 'Test data',
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow('Name and data are required for put operation');
		});

		it('should throw error if data is missing', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'test.txt',
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow('Name and data are required for put operation');
		});
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('put');
		});
	});
});