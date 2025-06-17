import { InfoObjectOperationHandler } from '../InfoObjectOperationHandler';

describe('InfoObjectOperationHandler', () => {
	let handler: InfoObjectOperationHandler;
	let mockOs: any;

	beforeEach(() => {
		handler = new InfoObjectOperationHandler();
		
		mockOs = {
			info: jest.fn(),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should get object info successfully', async () => {
			const mockInfo = {
				name: 'test-file.txt',
				size: 1024,
				chunks: 2,
				digest: 'sha256-abc123',
				mtime: '2023-01-01T00:00:00Z',
				headers: { 'X-Custom': 'value' },
				options: { link: null },
			};

			mockOs.info.mockResolvedValue(mockInfo);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'test-file.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.info).toHaveBeenCalledWith('test-file.txt');
			expect(result).toEqual({
				operation: 'info',
				bucket: 'test-bucket',
				name: 'test-file.txt',
				found: true,
				info: {
					name: 'test-file.txt',
					size: 1024,
					chunks: 2,
					digest: 'sha256-abc123',
					mtime: '2023-01-01T00:00:00Z',
					headers: { 'X-Custom': 'value' },
					options: { link: null },
				},
			});
		});

		it('should handle object not found', async () => {
			mockOs.info.mockResolvedValue(null);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'missing.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(result).toEqual({
				operation: 'info',
				bucket: 'test-bucket',
				name: 'missing.txt',
				found: false,
			});
		});

		it('should throw error if name is missing', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow('Name is required for info operation');
		});

		it('should handle linked objects', async () => {
			const mockInfo = {
				name: 'linked-file.txt',
				size: 2048,
				chunks: 1,
				digest: 'sha256-def456',
				mtime: '2023-01-02T00:00:00Z',
				headers: {},
				options: {
					link: {
						bucket: 'source-bucket',
						name: 'source-file.txt',
					},
				},
			};

			mockOs.info.mockResolvedValue(mockInfo);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'linked-file.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(result.info.options.link).toEqual({
				bucket: 'source-bucket',
				name: 'source-file.txt',
			});
		});
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('info');
		});
	});
});