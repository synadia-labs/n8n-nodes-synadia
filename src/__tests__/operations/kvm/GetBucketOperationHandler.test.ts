import { GetBucketOperationHandler } from '../../../operations/kvm/GetBucketOperationHandler';
import { createMockKvm, createMockKV, sampleKvStatus } from '../testUtils';

describe('GetBucketOperationHandler', () => {
	let handler: GetBucketOperationHandler;
	let mockKvm: ReturnType<typeof createMockKvm>;
	let mockKV: ReturnType<typeof createMockKV>;

	beforeEach(() => {
		handler = new GetBucketOperationHandler();
		mockKvm = createMockKvm();
		mockKV = createMockKV();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('get');
		});
	});

	describe('execute', () => {
		it('should get KV bucket status successfully', async () => {
			const bucketName = 'test-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(sampleKvStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.status).toHaveBeenCalled();
			expect(result).toEqual(sampleKvStatus);
		});

		it('should get status for bucket with special characters in name', async () => {
			const bucketName = 'bucket-with_special.chars123';
			const expectedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.status).toHaveBeenCalled();
			expect(result).toEqual(expectedStatus);
		});

		it('should get status for bucket with dashes and underscores', async () => {
			const bucketName = 'test-bucket_name-123';
			const expectedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(result).toEqual(expectedStatus);
		});

		it('should get status for bucket with long name', async () => {
			const bucketName = 'very-long-bucket-name-with-many-characters-and-descriptive-text';
			const expectedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(result).toEqual(expectedStatus);
		});

		it('should get status for bucket with high values count', async () => {
			const bucketName = 'high-values-bucket';
			const highValuesStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				values: 50000,
				streamInfo: {
					...sampleKvStatus.streamInfo,
					state: {
						...sampleKvStatus.streamInfo.state,
						messages: 50000,
						bytes: 512000000,
					},
				},
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(highValuesStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(result).toEqual(highValuesStatus);
			expect(result.values).toBe(50000);
		});

		it('should get status for bucket with custom TTL', async () => {
			const bucketName = 'ttl-bucket';
			const ttlStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				ttl: 7200, // 2 hours
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(ttlStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(result).toEqual(ttlStatus);
			expect(result.ttl).toBe(7200);
		});

		it('should get status for bucket with custom history', async () => {
			const bucketName = 'history-bucket';
			const historyStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				history: 20,
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(historyStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(result).toEqual(historyStatus);
			expect(result.history).toBe(20);
		});

		it('should get status for memory storage bucket', async () => {
			const bucketName = 'memory-bucket';
			const memoryStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				bucket_location: 'memory',
				streamInfo: {
					...sampleKvStatus.streamInfo,
					config: {
						...sampleKvStatus.streamInfo.config,
						storage: 'memory' as const,
					},
				},
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(memoryStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(result).toEqual(memoryStatus);
			expect(result.bucket_location).toBe('memory');
		});

		it('should get status for file storage bucket', async () => {
			const bucketName = 'file-bucket';
			const fileStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				bucket_location: 'file',
				streamInfo: {
					...sampleKvStatus.streamInfo,
					config: {
						...sampleKvStatus.streamInfo.config,
						storage: 'file' as const,
					},
				},
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(fileStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(result).toEqual(fileStatus);
			expect(result.bucket_location).toBe('file');
		});

		it('should get status for empty bucket', async () => {
			const bucketName = 'empty-bucket';
			const emptyStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				values: 0,
				streamInfo: {
					...sampleKvStatus.streamInfo,
					state: {
						...sampleKvStatus.streamInfo.state,
						messages: 0,
						bytes: 0,
						first_seq: 0,
						last_seq: 0,
					},
				},
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(emptyStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(result).toEqual(emptyStatus);
			expect(result.values).toBe(0);
		});

		it('should propagate bucket not found errors', async () => {
			const bucketName = 'nonexistent-bucket';

			const notFoundError = new Error('Bucket does not exist');
			(notFoundError as any).code = '404';
			mockKvm.open.mockRejectedValue(notFoundError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket does not exist',
			);
			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.status).not.toHaveBeenCalled();
		});

		it('should propagate permission errors', async () => {
			const bucketName = 'restricted-bucket';

			const permissionError = new Error('Permission denied for bucket access');
			(permissionError as any).code = '403';
			mockKvm.open.mockRejectedValue(permissionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Permission denied for bucket access',
			);
			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
		});

		it('should propagate permission errors on status call', async () => {
			const bucketName = 'restricted-status-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			const permissionError = new Error('Permission denied for status access');
			(permissionError as any).code = '403';
			mockKV.status.mockRejectedValue(permissionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Permission denied for status access',
			);
			expect(mockKvm.open).toHaveBeenCalledWith(bucketName);
			expect(mockKV.status).toHaveBeenCalled();
		});

		it('should propagate NATS connection errors', async () => {
			const bucketName = 'test-bucket';

			const connectionError = new Error('NATS connection closed');
			mockKvm.open.mockRejectedValue(connectionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'NATS connection closed',
			);
		});

		it('should propagate NATS connection errors on status', async () => {
			const bucketName = 'test-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			const connectionError = new Error('NATS connection closed during status');
			mockKV.status.mockRejectedValue(connectionError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'NATS connection closed during status',
			);
		});

		it('should handle timeout errors on open', async () => {
			const bucketName = 'timeout-bucket';

			const timeoutError = new Error('Bucket open timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockKvm.open.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Bucket open timeout',
			);
		});

		it('should handle timeout errors on status', async () => {
			const bucketName = 'timeout-status-bucket';

			mockKvm.open.mockResolvedValue(mockKV);
			const timeoutError = new Error('Status call timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockKV.status.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Status call timeout',
			);
		});

		it('should handle JetStream not enabled errors', async () => {
			const bucketName = 'test-bucket';

			const jetStreamError = new Error('JetStream not enabled for account');
			(jetStreamError as any).code = '503';
			mockKvm.open.mockRejectedValue(jetStreamError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'JetStream not enabled for account',
			);
		});

		it('should handle empty bucket name', async () => {
			const emptyBucketName = '';

			const emptyError = new Error('Invalid bucket name');
			(emptyError as any).code = '400';
			mockKvm.open.mockRejectedValue(emptyError);

			await expect(handler.execute(mockKvm, { bucket: emptyBucketName })).rejects.toThrow(
				'Invalid bucket name',
			);
		});

		it('should handle network errors', async () => {
			const bucketName = 'network-bucket';

			const networkError = new Error('Network connection lost');
			mockKvm.open.mockRejectedValue(networkError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Network connection lost',
			);
		});

		it('should handle server errors', async () => {
			const bucketName = 'server-error-bucket';

			const serverError = new Error('Internal server error');
			(serverError as any).code = '500';
			mockKvm.open.mockRejectedValue(serverError);

			await expect(handler.execute(mockKvm, { bucket: bucketName })).rejects.toThrow(
				'Internal server error',
			);
		});

		it('should get detailed status with stream information', async () => {
			const bucketName = 'detailed-bucket';
			const detailedStatus = {
				...sampleKvStatus,
				bucket: bucketName,
				values: 2500,
				history: 15,
				ttl: 14400,
				bucket_location: 'file',
				backingStore: 'JetStream',
				streamInfo: {
					config: {
						name: `KV_${bucketName}`,
						subjects: [`$KV.${bucketName}.>`],
						retention: 'workqueue' as const,
						max_consumers: -1,
						max_msgs: 5000,
						max_bytes: 1048576,
						max_age: 14400000000000,
						storage: 'file' as const,
					},
					state: {
						messages: 2500,
						bytes: 256000,
						first_seq: 1,
						last_seq: 2500,
					},
				},
			};

			mockKvm.open.mockResolvedValue(mockKV);
			mockKV.status.mockResolvedValue(detailedStatus as any);

			const result = await handler.execute(mockKvm, { bucket: bucketName });

			expect(result).toEqual(detailedStatus);
			expect((result as any).streamInfo.config.name).toBe(`KV_${bucketName}`);
			expect((result as any).streamInfo.state.messages).toBe(2500);
		});
	});
});
