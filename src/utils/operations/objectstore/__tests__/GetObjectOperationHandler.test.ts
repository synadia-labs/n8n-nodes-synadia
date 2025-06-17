import { GetObjectOperationHandler } from '../GetObjectOperationHandler';

describe('GetObjectOperationHandler', () => {
	let handler: GetObjectOperationHandler;
	let mockOs: any;
	let mockReader: any;

	beforeEach(() => {
		handler = new GetObjectOperationHandler();
		
		mockReader = {
			read: jest.fn()
				.mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Hello, ') })
				.mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('World!') })
				.mockResolvedValueOnce({ done: true }),
			releaseLock: jest.fn(),
		};

		const mockStream = {
			getReader: jest.fn().mockReturnValue(mockReader),
		};

		mockOs = {
			get: jest.fn().mockResolvedValue({
				data: mockStream,
				info: {
					name: 'test-file.txt',
					size: 13,
					chunks: 1,
					digest: 'sha256-abc123',
					mtime: '2023-01-01T00:00:00Z',
				},
			}),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should get an object successfully', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'test-file.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.get).toHaveBeenCalledWith('test-file.txt');
			expect(mockReader.releaseLock).toHaveBeenCalled();
			expect(result).toEqual({
				operation: 'get',
				bucket: 'test-bucket',
				name: 'test-file.txt',
				found: true,
				data: 'Hello, World!',
				info: {
					name: 'test-file.txt',
					size: 13,
					chunks: 1,
					digest: 'sha256-abc123',
					mtime: '2023-01-01T00:00:00Z',
				},
			});
		});

		it('should parse JSON if requested', async () => {
			mockReader.read = jest.fn()
				.mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('{"key": "value"}') })
				.mockResolvedValueOnce({ done: true });

			const params = {
				bucket: 'test-bucket',
				options: {
					parseJson: true,
				},
				itemIndex: 0,
				name: 'data.json',
			};

			const result = await handler.execute(mockOs, params);

			expect(result.data).toEqual({ key: 'value' });
		});

		it('should keep as string if JSON parsing fails', async () => {
			mockReader.read = jest.fn()
				.mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('not json') })
				.mockResolvedValueOnce({ done: true });

			const params = {
				bucket: 'test-bucket',
				options: {
					parseJson: true,
				},
				itemIndex: 0,
				name: 'data.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(result.data).toBe('not json');
		});

		it('should handle object not found', async () => {
			mockOs.get.mockResolvedValue(null);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'missing.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(result).toEqual({
				operation: 'get',
				bucket: 'test-bucket',
				name: 'missing.txt',
				found: false,
			});
		});

		it('should handle multiple chunks', async () => {
			mockReader.read = jest.fn()
				.mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Chunk 1 ') })
				.mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Chunk 2 ') })
				.mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Chunk 3') })
				.mockResolvedValueOnce({ done: true });

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'large-file.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(result.data).toBe('Chunk 1 Chunk 2 Chunk 3');
		});

		it('should throw error if name is missing', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow('Name is required for get operation');
		});
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('get');
		});
	});
});