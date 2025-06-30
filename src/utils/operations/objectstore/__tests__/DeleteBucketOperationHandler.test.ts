import { DeleteBucketOperationHandler } from '../DeleteBucketOperationHandler';
import { jetstream, Objm } from '../../../../bundled/nats-bundled';

jest.mock('../../../../bundled/nats-bundled');

describe('DeleteBucketOperationHandler', () => {
	let handler: DeleteBucketOperationHandler;
	let mockNc: any;
	let mockJs: any;
	let mockObjManager: any;
	let mockObjectStore: any;

	beforeEach(() => {
		handler = new DeleteBucketOperationHandler();
		
		mockObjectStore = {
			destroy: jest.fn().mockResolvedValue(true),
		};

		mockObjManager = {
			open: jest.fn().mockResolvedValue(mockObjectStore),
		};

		mockJs = {};
		mockNc = {};

		(jetstream as jest.Mock).mockReturnValue(mockJs);
		(Objm as jest.Mock).mockReturnValue(mockObjManager);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should delete a bucket successfully', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockNc, params);

			expect(jetstream).toHaveBeenCalledWith(mockNc);
			expect(Objm).toHaveBeenCalledWith(mockJs);
			expect(mockObjManager.open).toHaveBeenCalledWith('test-bucket');
			expect(mockObjectStore.destroy).toHaveBeenCalled();
			expect(result).toEqual({
				operation: 'deleteBucket',
				bucket: 'test-bucket',
				success: true,
			});
		});

		it('should handle bucket with special characters', async () => {
			const params = {
				bucket: 'my-test_bucket.123',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockNc, params);

			expect(mockObjManager.open).toHaveBeenCalledWith('my-test_bucket.123');
			expect(result.success).toBe(true);
		});

		it('should return false when deletion fails', async () => {
			mockObjectStore.destroy.mockResolvedValue(false);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockNc, params);

			expect(result).toEqual({
				operation: 'deleteBucket',
				bucket: 'test-bucket',
				success: false,
			});
		});

		it('should handle deletion errors', async () => {
			mockObjectStore.destroy.mockRejectedValue(new Error('Bucket not found'));

			const params = {
				bucket: 'nonexistent-bucket',
				options: {},
				itemIndex: 0,
			};

			await expect(handler.execute(mockNc, params)).rejects.toThrow('Bucket not found');
		});

		it('should handle object store open errors', async () => {
			mockObjManager.open.mockRejectedValue(new Error('Failed to open bucket'));

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			await expect(handler.execute(mockNc, params)).rejects.toThrow('Failed to open bucket');
		});
	});
});