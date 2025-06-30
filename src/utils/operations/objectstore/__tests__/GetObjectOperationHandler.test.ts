import { GetObjectOperationHandler } from '../GetObjectOperationHandler';

describe('GetObjectOperationHandler', () => {
	let handler: GetObjectOperationHandler;
	let mockOs: any;

	beforeEach(() => {
		handler = new GetObjectOperationHandler();
		
		mockOs = {
			getBlob: jest.fn().mockResolvedValue(new TextEncoder().encode('Hello, World!')),
			info: jest.fn().mockResolvedValue({
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
		it('should get an object successfully', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'test-file.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.getBlob).toHaveBeenCalledWith('test-file.txt');
			expect(mockOs.info).toHaveBeenCalledWith('test-file.txt');
			expect(result).toEqual({
				operation: 'get',
				bucket: 'test-bucket',
				name: 'test-file.txt',
				found: true,
				data: 'Hello, World!',
				info: {
					name: 'test-file.txt',
					size: 13,
					digest: 'sha256-abc123',
					mtime: '2023-01-01T00:00:00Z',
				},
			});
		});

		it('should parse JSON if requested', async () => {
			mockOs.getBlob.mockResolvedValue(new TextEncoder().encode('{"key": "value"}'));

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
			mockOs.getBlob.mockResolvedValue(new TextEncoder().encode('not json'));

			const params = {
				bucket: 'test-bucket',
				options: {
					parseJson: true,
				},
				itemIndex: 0,
				name: 'invalid.json',
			};

			const result = await handler.execute(mockOs, params);

			expect(result.data).toBe('not json');
		});

		it('should handle object not found', async () => {
			mockOs.getBlob.mockRejectedValue(new Error('Object not found'));

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'missing-file.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(result).toEqual({
				operation: 'get',
				bucket: 'test-bucket',
				name: 'missing-file.txt',
				found: false,
			});
		});

		it('should throw error for missing name', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: '',
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow(
				'Name is required for get operation'
			);
		});

		it('should use binary data length when info size is not available', async () => {
			mockOs.info.mockResolvedValue({
				name: 'test-file.txt',
				digest: 'sha256-abc123',
				mtime: '2023-01-01T00:00:00Z',
			});

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'test-file.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(result.info.size).toBe(13); // length of 'Hello, World!'
		});
	});
});