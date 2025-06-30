import { CreateBucketOperationHandler } from '../../../operations/kvm/CreateBucketOperationHandler';
import { createMockKvm, createMockKV, sampleKvStatus } from '../testUtils';

describe('CreateBucketOperationHandler', () => {
	let handler: CreateBucketOperationHandler;
	let mockKvm: ReturnType<typeof createMockKvm>;
	let mockKV: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		handler = new CreateBucketOperationHandler();
		mockKvm = createMockKvm();
		mockKV = createMockKV();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('create');
		});
	});

	describe('execute', () => {
		it('should create KV bucket successfully with minimal config', async () => {
			const bucketName = 'test-bucket';

			mockKvm.create.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(sampleKvStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, undefined);
			expect(mockKV.status).toHaveBeenCalled();
			expect(result).toEqual(sampleKvStatus);
		});

		it('should create KV bucket successfully with full config', async () => {
			const bucketName = 'configured-bucket';
			const kvConfig = {
				description: 'Test bucket with configuration',
				max_value_size: 1024,
				history: 5,
				ttl: 3600,
				max_bucket_size: 1048576,
				storage: 'file' as const,
				num_replicas: 3,
			};

			const expectedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				ttl: kvConfig.ttl,
				history: kvConfig.history,
			};

			mockKvm.create.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockKvm, {
				bucket: bucketName,
				kvConfig: kvConfig as any,
			});

			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, kvConfig);
			expect(mockKV.status).toHaveBeenCalled();
			expect(result).toEqual(expectedStatus);
		});

		it('should create KV bucket with memory storage', async () => {
			const bucketName = 'memory-bucket';
			const kvConfig = {
				storage: 'memory' as const,
				max_bucket_size: 524288,
			};

			const expectedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				bucket_location: 'memory',
			};

			mockKvm.create.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockKvm, {
				bucket: bucketName,
				kvConfig: kvConfig as any,
			});

			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, kvConfig);
			expect(result).toEqual(expectedStatus);
		});

		it('should create KV bucket with file storage', async () => {
			const bucketName = 'file-bucket';
			const kvConfig = {
				storage: 'file' as const,
				num_replicas: 2,
			};

			const expectedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				bucket_location: 'file',
			};

			mockKvm.create.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockKvm, {
				bucket: bucketName,
				kvConfig: kvConfig as any,
			});

			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, kvConfig);
			expect(result).toEqual(expectedStatus);
		});

		it('should create KV bucket with TTL configuration', async () => {
			const bucketName = 'ttl-bucket';
			const kvConfig = {
				ttl: 7200, // 2 hours
				description: 'Bucket with TTL',
			};

			const expectedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				ttl: 7200,
			};

			mockKvm.create.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockKvm, {
				bucket: bucketName,
				kvConfig: kvConfig as any,
			});

			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, kvConfig);
			expect(result).toEqual(expectedStatus);
		});

		it('should create KV bucket with history settings', async () => {
			const bucketName = 'history-bucket';
			const kvConfig = {
				history: 20,
				max_value_size: 2048,
			};

			const expectedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				history: 20,
			};

			mockKvm.create.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockKvm, {
				bucket: bucketName,
				kvConfig: kvConfig as any,
			});

			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, kvConfig);
			expect(result).toEqual(expectedStatus);
		});

		it('should handle bucket names with special characters', async () => {
			const bucketName = 'bucket-with_special.chars123';

			mockKvm.create.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(sampleKvStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, undefined);
			expect(result).toEqual(sampleKvStatus);
		});

		it('should handle bucket names with dashes and underscores', async () => {
			const bucketName = 'test-bucket_name-123';

			mockKvm.create.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(sampleKvStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, undefined);
			expect(result).toEqual(sampleKvStatus);
		});

		it('should propagate bucket already exists errors', async () => {
			const bucketName = 'existing-bucket';

			const existsError = new Error('Bucket already exists');
			(existsError as any).code = '400';
			mockKvm.create.mockRejectedValue(existsError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket already exists',
			);
			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, undefined);
		});

		it('should propagate permission errors', async () => {
			const bucketName = 'restricted-bucket';

			const permissionError = new Error('Permission denied for bucket creation');
			(permissionError as any).code = '403';
			mockKvm.create.mockRejectedValue(permissionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Permission denied for bucket creation',
			);
		});

		it('should propagate NATS connection errors', async () => {
			const bucketName = 'test-bucket';

			const connectionError = new Error('NATS connection closed');
			mockKvm.create.mockRejectedValue(connectionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'NATS connection closed',
			);
		});

		it('should propagate invalid configuration errors', async () => {
			const bucketName = 'invalid-config-bucket';
			const invalidConfig = {
				max_value_size: -1, // Invalid negative value
			};

			const configError = new Error('Invalid bucket configuration');
			(configError as any).code = '400';
			mockKvm.create.mockRejectedValue(configError);

			await expect(
				handler.execute(mockKvm, {
					bucket: bucketName,
					kvConfig: invalidConfig as any,
				}),
			).rejects.toThrow('Invalid bucket configuration');
		});

		it('should handle timeout errors', async () => {
			const bucketName = 'timeout-bucket';

			const timeoutError = new Error('Bucket creation timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockKvm.create.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket creation timeout',
			);
		});

		it('should handle JetStream not enabled errors', async () => {
			const bucketName = 'test-bucket';

			const jetStreamError = new Error('JetStream not enabled for account');
			(jetStreamError as any).code = '503';
			mockKvm.create.mockRejectedValue(jetStreamError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'JetStream not enabled for account',
			);
		});

		it('should handle quota exceeded errors', async () => {
			const bucketName = 'quota-bucket';

			const quotaError = new Error('Account storage quota exceeded');
			mockKvm.create.mockRejectedValue(quotaError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Account storage quota exceeded',
			);
		});

		it('should handle bucket name length limits', async () => {
			const longBucketName = 'a'.repeat(1000);

			const lengthError = new Error('Bucket name too long');
			(lengthError as any).code = '400';
			mockKvm.create.mockRejectedValue(lengthError);

			await expect(handler.execute(mockKvm, { bucket: longBucketName })).rejects.toThrow(
				'Bucket name too long',
			);
		});

		it('should handle empty bucket name', async () => {
			const emptyBucketName = '';

			const emptyError = new Error('Invalid bucket name');
			(emptyError as any).code = '400';
			mockKvm.create.mockRejectedValue(emptyError);

			await expect(handler.execute(mockKvm, { bucket: emptyBucketName })).rejects.toThrow(
				'Invalid bucket name',
			);
		});

		it('should handle status call failure after successful creation', async () => {
			const bucketName = 'status-fail-bucket';

			mockKvm.create.mockResolvedValue(mockKV);
			const statusError = new Error('Failed to get bucket status');
			mockKV.status.mockRejectedValue(statusError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Failed to get bucket status',
			);
			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, undefined);
			expect(mockKV.status).toHaveBeenCalled();
		});

		it('should create bucket with comprehensive configuration', async () => {
			const bucketName = 'comprehensive-bucket';
			const comprehensiveConfig = {
				description: 'A fully configured KV bucket for testing',
				max_value_size: 4096,
				history: 15,
				ttl: 14400,
				max_bucket_size: 2097152,
				storage: 'file' as const,
				num_replicas: 2,
				allow_direct: true,
			};

			const expectedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				ttl: comprehensiveConfig.ttl,
				history: comprehensiveConfig.history,
				bucket_location: 'file',
			};

			mockKvm.create.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockKvm, {
				bucket: bucketName,
				kvConfig: comprehensiveConfig as any,
			});

			expect(mockKvm.create).toHaveBeenCalledWith(bucketName, comprehensiveConfig);
			expect(result).toEqual(expectedStatus);
		});
	});
});
