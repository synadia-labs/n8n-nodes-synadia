import { CreateBucketOperationHandler } from '../CreateBucketOperationHandler';
import { jetstream, Objm } from '../../../../bundled/nats-bundled';

jest.mock('../../../../bundled/nats-bundled');

describe('CreateBucketOperationHandler', () => {
	let handler: CreateBucketOperationHandler;
	let mockNc: any;
	let mockJs: any;
	let mockObjm: any;
	let mockOs: any;

	beforeEach(() => {
		handler = new CreateBucketOperationHandler();
		
		mockOs = {
			status: jest.fn().mockResolvedValue({
				bucket: 'test-bucket',
				size: 0,
				metadata: {},
				chunks: 0,
			}),
		};

		mockObjm = {
			create: jest.fn().mockResolvedValue(mockOs),
		};

		mockJs = {};
		mockNc = {};

		(jetstream as jest.Mock).mockReturnValue(mockJs);
		(Objm as jest.Mock).mockImplementation(() => mockObjm);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should create a bucket with default options', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockNc, params);

			expect(jetstream).toHaveBeenCalledWith(mockNc);
			expect(Objm).toHaveBeenCalledWith(mockJs);
			expect(mockObjm.create).toHaveBeenCalledWith('test-bucket', {
				storage: 'file',
				replicas: 1,
			});
			expect(mockOs.status).toHaveBeenCalled();
			expect(result).toEqual({
				operation: 'createBucket',
				bucket: 'test-bucket',
				success: true,
				status: {
					bucket: 'test-bucket',
					size: 0,
					metadata: {},
					objects: 0,
				},
			});
		});

		it('should create a bucket with custom options', async () => {
			const params = {
				bucket: 'custom-bucket',
				options: {
					description: 'Test bucket',
					ttl: 3600,
					maxBucketSize: 1000000,
					storage: 'memory',
					replicas: 3,
				},
				itemIndex: 0,
			};

			await handler.execute(mockNc, params);

			expect(mockObjm.create).toHaveBeenCalledWith('custom-bucket', {
				storage: 'memory',
				replicas: 3,
				description: 'Test bucket',
				ttl: 3600000000000, // Converted to nanoseconds
				max_bytes: 1000000,
			});
		});

		it('should handle ttl conversion correctly', async () => {
			const params = {
				bucket: 'ttl-bucket',
				options: {
					ttl: 60, // 60 seconds
				},
				itemIndex: 0,
			};

			await handler.execute(mockNc, params);

			const createCall = mockObjm.create.mock.calls[0];
			expect(createCall[1].ttl).toBe(60000000000); // 60 seconds in nanoseconds
		});

		it('should ignore maxBucketSize if 0 or not provided', async () => {
			const params = {
				bucket: 'size-bucket',
				options: {
					maxBucketSize: 0,
				},
				itemIndex: 0,
			};

			await handler.execute(mockNc, params);

			const createCall = mockObjm.create.mock.calls[0];
			expect(createCall[1].max_bytes).toBeUndefined();
		});
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('createBucket');
		});
	});
});