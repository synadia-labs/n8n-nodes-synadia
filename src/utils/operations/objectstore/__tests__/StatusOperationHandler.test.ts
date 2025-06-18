import { StatusOperationHandler } from '../StatusOperationHandler';

describe('StatusOperationHandler', () => {
	let handler: StatusOperationHandler;
	let mockOs: any;

	beforeEach(() => {
		handler = new StatusOperationHandler();
		
		mockOs = {
			status: jest.fn(),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should get bucket status successfully', async () => {
			const mockStatus = {
				bucket: 'test-bucket',
				size: 1048576,
				chunks: 42,
				bytes: 1048576,
				storage: 'file',
				replicas: 3,
			};

			mockOs.status.mockResolvedValue(mockStatus);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.status).toHaveBeenCalled();
			expect(result).toEqual({
				operation: 'status',
				bucket: 'test-bucket',
				size: 1048576,
				objects: 42,
				bytes: 1048576,
				storage: 'file',
				replicas: 3,
			});
		});

		it('should handle status with minimal information', async () => {
			const mockStatus = {
				bucket: 'minimal-bucket',
				size: 0,
			};

			mockOs.status.mockResolvedValue(mockStatus);

			const params = {
				bucket: 'minimal-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockOs, params);

			expect(result).toEqual({
				operation: 'status',
				bucket: 'minimal-bucket',
				size: 0,
				objects: 0,
				bytes: 0,
				storage: undefined,
				replicas: undefined,
			});
		});

		it('should handle status with objects count', async () => {
			const mockStatus = {
				bucket: 'test-bucket',
				size: 5000,
				objects: 10, // Sometimes returned as objects instead of chunks
			};

			mockOs.status.mockResolvedValue(mockStatus);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockOs, params);

			// Handler uses chunks field, not objects field
			expect(result.objects).toBe(0); // Falls back to 0 when chunks is not present
		});

		it('should use size as fallback for bytes', async () => {
			const mockStatus = {
				bucket: 'test-bucket',
				size: 2048,
				chunks: 2,
			};

			mockOs.status.mockResolvedValue(mockStatus);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockOs, params);

			expect(result.bytes).toBe(2048);
		});

		it('should handle memory storage type', async () => {
			const mockStatus = {
				bucket: 'memory-bucket',
				size: 1024,
				storage: 'memory',
				replicas: 1,
			};

			mockOs.status.mockResolvedValue(mockStatus);

			const params = {
				bucket: 'memory-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockOs, params);

			expect(result.storage).toBe('memory');
			expect(result.replicas).toBe(1);
		});
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('status');
		});
	});
});