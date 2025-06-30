import { PutObjectOperationHandler } from '../PutObjectOperationHandler';

describe('PutObjectOperationHandler', () => {
	let handler: PutObjectOperationHandler;
	let mockOs: any;

	beforeEach(() => {
		handler = new PutObjectOperationHandler();
		
		mockOs = {
			putBlob: jest.fn().mockResolvedValue({
				name: 'test-file.txt',
				size: 13,
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

			expect(mockOs.putBlob).toHaveBeenCalledWith(
				{ name: 'test-file.txt', description: undefined },
				new TextEncoder().encode('Hello, World!')
			);
			expect(result).toEqual({
				operation: 'put',
				bucket: 'test-bucket',
				name: 'test-file.txt',
				success: true,
				info: {
					name: 'test-file.txt',
					size: 13,
					digest: 'sha256-abc123',
					mtime: '2023-01-01T00:00:00Z',
				},
			});
		});

		it('should put a JSON string object', async () => {
			const jsonString = '{"key":"value","number":42}';
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'data.json',
				data: jsonString,
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.putBlob).toHaveBeenCalledWith(
				{ name: 'data.json', description: undefined },
				new TextEncoder().encode('{"key":"value","number":42}')
			);
			expect(result.success).toBe(true);
		});

		it('should put Buffer data', async () => {
			const binaryBuffer = Buffer.from('binary content');
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'binary-file.bin',
				data: binaryBuffer,
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.putBlob).toHaveBeenCalledWith(
				{ name: 'binary-file.bin', description: undefined },
				new Uint8Array(binaryBuffer)
			);
			expect(result.success).toBe(true);
		});

		it('should handle custom options', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {
					description: 'Test file',
					headers: '{"Content-Type": "text/plain", "Author": "Test"}',
				},
				itemIndex: 0,
				name: 'test-file.txt',
				data: 'content',
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.putBlob).toHaveBeenCalledWith(
				{
					name: 'test-file.txt',
					description: 'Test file',
					headers: {
						'Content-Type': 'text/plain',
						'Author': 'Test',
					},
				},
				new TextEncoder().encode('content')
			);
			expect(result.success).toBe(true);
		});

		it('should handle Uint8Array data', async () => {
			const uint8Data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'data.bin',
				data: uint8Data,
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.putBlob).toHaveBeenCalledWith(
				{ name: 'data.bin', description: undefined },
				uint8Data
			);
			expect(result.success).toBe(true);
		});

		it('should handle object data by stringifying', async () => {
			const objectData = { test: 'value', number: 123 };
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'data.json',
				data: objectData,
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.putBlob).toHaveBeenCalledWith(
				{ name: 'data.json', description: undefined },
				new TextEncoder().encode('{"test":"value","number":123}')
			);
			expect(result.success).toBe(true);
		});

		it('should throw error for missing name', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: '',
				data: 'content',
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow(
				'Name and data are required for put operation'
			);
		});

		it('should throw error for missing data', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'test.txt',
				data: undefined,
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow(
				'Name and data are required for put operation'
			);
		});

		it('should handle empty string data', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'empty.txt',
				data: '',
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.putBlob).toHaveBeenCalledWith(
				{ name: 'empty.txt', description: undefined },
				new TextEncoder().encode('')
			);
			expect(result.success).toBe(true);
		});
	});
});