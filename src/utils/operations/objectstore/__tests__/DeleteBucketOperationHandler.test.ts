import { DeleteBucketOperationHandler } from '../DeleteBucketOperationHandler';
import { jetstreamManager } from '../../../../bundled/nats-bundled';

jest.mock('../../../../bundled/nats-bundled');

describe('DeleteBucketOperationHandler', () => {
	let handler: DeleteBucketOperationHandler;
	let mockNc: any;
	let mockJsm: any;

	beforeEach(() => {
		handler = new DeleteBucketOperationHandler();
		
		mockJsm = {
			streams: {
				delete: jest.fn().mockResolvedValue(true),
			},
		};

		mockNc = {};

		(jetstreamManager as jest.Mock).mockResolvedValue(mockJsm);
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

			expect(jetstreamManager).toHaveBeenCalledWith(mockNc);
			expect(mockJsm.streams.delete).toHaveBeenCalledWith('OBJ_test-bucket');
			expect(result).toEqual({
				operation: 'deleteBucket',
				bucket: 'test-bucket',
				success: true,
			});
		});

		it('should handle bucket with special characters', async () => {
			const params = {
				bucket: 'my-test_bucket.prod',
				options: {},
				itemIndex: 0,
			};

			await handler.execute(mockNc, params);

			expect(mockJsm.streams.delete).toHaveBeenCalledWith('OBJ_my-test_bucket.prod');
		});

		it('should return false when deletion fails', async () => {
			mockJsm.streams.delete.mockResolvedValue(false);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockNc, params);

			expect(result.success).toBe(false);
		});
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('deleteBucket');
		});
	});
});