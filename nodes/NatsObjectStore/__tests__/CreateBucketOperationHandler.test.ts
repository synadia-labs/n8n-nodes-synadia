import { CreateBucketOperationHandler } from '../operations/CreateBucketOperationHandler';
import { createMockObjm, createMockObjectStore, sampleObjectStoreStatus } from './testUtils';

describe('CreateBucketOperationHandler', () => {
	let handler: CreateBucketOperationHandler;
	let mockOsm: ReturnType<typeof createMockObjm>;
	let mockOS: ReturnType<typeof createMockObjectStore>;

	beforeEach(() => {
		handler = new CreateBucketOperationHandler();
		mockOsm = createMockObjm();
		mockOS = createMockObjectStore();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('createBucket');
		});
	});

	describe('execute', () => {
		it('should create object store bucket successfully with minimal config', async () => {
			const bucketName = 'test-bucket';
			const objConfig = {
				description: 'Test object store bucket',
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(sampleObjectStoreStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: objConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(mockOS.status).toHaveBeenCalled();
			expect(result).toEqual(sampleObjectStoreStatus);
		});

		it('should create object store bucket with full configuration', async () => {
			const bucketName = 'configured-bucket';
			const objConfig = {
				description: 'Fully configured object store bucket',
				ttl: 7200,
				storage: 'file' as const,
				replicas: 3,
				placement: {
					cluster: 'test-cluster',
					tags: ['ssd', 'fast'],
				},
				max_bucket_size: 1073741824, // 1GB
			};

			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				description: objConfig.description,
				ttl: objConfig.ttl,
				storage: objConfig.storage,
				replicas: objConfig.replicas,
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: objConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(mockOS.status).toHaveBeenCalled();
			expect(result).toEqual(expectedStatus);
		});

		it('should create object store bucket with memory storage', async () => {
			const bucketName = 'memory-bucket';
			const objConfig = {
				description: 'Memory-based object store',
				storage: 'memory' as const,
				max_bucket_size: 536870912, // 512MB
			};

			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				storage: 'memory' as const,
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: objConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(result).toEqual(expectedStatus);
		});

		it('should create object store bucket with file storage', async () => {
			const bucketName = 'file-bucket';
			const objConfig = {
				description: 'File-based object store',
				storage: 'file' as const,
				replicas: 2,
			};

			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				storage: 'file' as const,
				replicas: 2,
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: objConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(result).toEqual(expectedStatus);
		});

		it('should create object store bucket with TTL configuration', async () => {
			const bucketName = 'ttl-bucket';
			const objConfig = {
				description: 'Bucket with TTL',
				ttl: 14400, // 4 hours
			};

			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				ttl: 14400,
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: objConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(result).toEqual(expectedStatus);
		});

		it('should create object store bucket with replication settings', async () => {
			const bucketName = 'replicated-bucket';
			const objConfig = {
				description: 'Replicated object store',
				replicas: 5,
				storage: 'file' as const,
			};

			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				replicas: 5,
				storage: 'file' as const,
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: objConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(result).toEqual(expectedStatus);
		});

		it('should handle bucket names with special characters', async () => {
			const bucketName = 'bucket-with_special.chars123';
			const objConfig = {
				description: 'Bucket with special characters',
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(sampleObjectStoreStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: objConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(result).toEqual(sampleObjectStoreStatus);
		});

		it('should handle bucket names with dashes and underscores', async () => {
			const bucketName = 'test-bucket_name-123';
			const objConfig = {
				description: 'Test bucket with dashes and underscores',
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(sampleObjectStoreStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: objConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(result).toEqual(sampleObjectStoreStatus);
		});

		it('should propagate bucket already exists errors', async () => {
			const bucketName = 'existing-bucket';
			const objConfig = {
				description: 'Existing bucket',
			};

			const existsError = new Error('Object store bucket already exists');
			(existsError as any).code = '400';
			mockOsm.create.mockRejectedValue(existsError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: objConfig as any,
				}),
			).rejects.toThrow('Object store bucket already exists');
			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
		});

		it('should propagate permission errors', async () => {
			const bucketName = 'restricted-bucket';
			const objConfig = {
				description: 'Restricted bucket',
			};

			const permissionError = new Error('Permission denied for object store creation');
			(permissionError as any).code = '403';
			mockOsm.create.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: objConfig as any,
				}),
			).rejects.toThrow('Permission denied for object store creation');
		});

		it('should propagate NATS connection errors', async () => {
			const bucketName = 'test-bucket';
			const objConfig = {
				description: 'Test bucket',
			};

			const connectionError = new Error('NATS connection closed');
			mockOsm.create.mockRejectedValue(connectionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: objConfig as any,
				}),
			).rejects.toThrow('NATS connection closed');
		});

		it('should propagate invalid configuration errors', async () => {
			const bucketName = 'invalid-config-bucket';
			const invalidConfig = {
				description: 'Invalid configuration',
				replicas: -1, // Invalid negative value
			};

			const configError = new Error('Invalid object store configuration');
			(configError as any).code = '400';
			mockOsm.create.mockRejectedValue(configError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: invalidConfig as any,
				}),
			).rejects.toThrow('Invalid object store configuration');
		});

		it('should handle timeout errors', async () => {
			const bucketName = 'timeout-bucket';
			const objConfig = {
				description: 'Timeout bucket',
			};

			const timeoutError = new Error('Object store creation timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOsm.create.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: objConfig as any,
				}),
			).rejects.toThrow('Object store creation timeout');
		});

		it('should handle JetStream not enabled errors', async () => {
			const bucketName = 'test-bucket';
			const objConfig = {
				description: 'Test bucket',
			};

			const jetStreamError = new Error('JetStream not enabled for account');
			(jetStreamError as any).code = '503';
			mockOsm.create.mockRejectedValue(jetStreamError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: objConfig as any,
				}),
			).rejects.toThrow('JetStream not enabled for account');
		});

		it('should handle quota exceeded errors', async () => {
			const bucketName = 'quota-bucket';
			const objConfig = {
				description: 'Quota bucket',
			};

			const quotaError = new Error('Account storage quota exceeded');
			mockOsm.create.mockRejectedValue(quotaError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: objConfig as any,
				}),
			).rejects.toThrow('Account storage quota exceeded');
		});

		it('should handle bucket name length limits', async () => {
			const longBucketName = 'a'.repeat(1000);
			const objConfig = {
				description: 'Long name bucket',
			};

			const lengthError = new Error('Object store bucket name too long');
			(lengthError as any).code = '400';
			mockOsm.create.mockRejectedValue(lengthError);

			await expect(
				handler.execute(mockOsm, {
					bucket: longBucketName,
					objConfig: objConfig as any,
				}),
			).rejects.toThrow('Object store bucket name too long');
		});

		it('should handle empty bucket name', async () => {
			const emptyBucketName = '';
			const objConfig = {
				description: 'Empty name bucket',
			};

			const emptyError = new Error('Invalid object store bucket name');
			(emptyError as any).code = '400';
			mockOsm.create.mockRejectedValue(emptyError);

			await expect(
				handler.execute(mockOsm, {
					bucket: emptyBucketName,
					objConfig: objConfig as any,
				}),
			).rejects.toThrow('Invalid object store bucket name');
		});

		it('should handle status call failure after successful creation', async () => {
			const bucketName = 'status-fail-bucket';
			const objConfig = {
				description: 'Status fail bucket',
			};

			mockOsm.create.mockResolvedValue(mockOS);
			const statusError = new Error('Failed to get object store status');
			mockOS.status.mockRejectedValue(statusError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: objConfig as any,
				}),
			).rejects.toThrow('Failed to get object store status');
			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(mockOS.status).toHaveBeenCalled();
		});

		it('should create bucket with comprehensive configuration', async () => {
			const bucketName = 'comprehensive-bucket';
			const comprehensiveConfig = {
				description: 'A fully configured object store bucket for testing',
				ttl: 28800, // 8 hours
				storage: 'file' as const,
				replicas: 3,
				max_bucket_size: 2147483648, // 2GB
				placement: {
					cluster: 'production-cluster',
					tags: ['ssd', 'high-performance', 'backup'],
				},
				compression: true,
				metadata: {
					owner: 'test-team',
					environment: 'production',
				},
			};

			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				description: comprehensiveConfig.description,
				ttl: comprehensiveConfig.ttl,
				storage: comprehensiveConfig.storage,
				replicas: comprehensiveConfig.replicas,
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: comprehensiveConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, comprehensiveConfig);
			expect(result).toEqual(expectedStatus);
		});

		it('should create sealed object store bucket', async () => {
			const bucketName = 'sealed-bucket';
			const objConfig = {
				description: 'Sealed object store bucket',
				sealed: true,
			};

			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				sealed: true,
			};

			mockOsm.create.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: objConfig as any,
			});

			expect(mockOsm.create).toHaveBeenCalledWith(bucketName, objConfig);
			expect(result).toEqual(expectedStatus);
		});
	});
});
