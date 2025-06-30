import { GetBucketOperationHandler } from '../../../operations/osm/GetBucketOperationHandler';
import { createMockObjm, createMockObjectStore, sampleObjectStoreStatus } from '../testUtils';

describe('GetBucketOperationHandler', () => {
	let handler: GetBucketOperationHandler;
	let mockOsm: ReturnType<typeof createMockObjm>;
	let mockOS: ReturnType<typeof createMockObjectStore>;

	beforeEach(() => {
		handler = new GetBucketOperationHandler();
		mockOsm = createMockObjm();
		mockOS = createMockObjectStore();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('status');
		});
	});

	describe('execute', () => {
		it('should get object store bucket status successfully', async () => {
			const bucketName = 'test-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(sampleObjectStoreStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.status).toHaveBeenCalled();
			expect(result).toEqual(sampleObjectStoreStatus);
		});

		it('should get status for bucket with special characters in name', async () => {
			const bucketName = 'bucket-with_special.chars123';
			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.status).toHaveBeenCalled();
			expect(result).toEqual(expectedStatus);
		});

		it('should get status for bucket with dashes and underscores', async () => {
			const bucketName = 'test-bucket_name-123';
			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(result).toEqual(expectedStatus);
		});

		it('should get status for bucket with long name', async () => {
			const bucketName =
				'very-long-object-store-bucket-name-with-many-characters-and-descriptive-text';
			const expectedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(expectedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(result).toEqual(expectedStatus);
		});

		it('should get status for bucket with large size', async () => {
			const bucketName = 'large-bucket';
			const largeStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				size: 10737418240, // 10GB
				streamInfo: {
					...sampleObjectStoreStatus.streamInfo,
					state: {
						...sampleObjectStoreStatus.streamInfo.state,
						messages: 100000,
						bytes: 10737418240,
					},
				},
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(largeStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(largeStatus);
			expect((result as any).size).toBe(10737418240);
		});

		it('should get status for bucket with custom TTL', async () => {
			const bucketName = 'ttl-bucket';
			const ttlStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				ttl: 14400, // 4 hours
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(ttlStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(ttlStatus);
			expect((result as any).ttl).toBe(14400);
		});

		it('should get status for bucket with custom replication', async () => {
			const bucketName = 'replicated-bucket';
			const replicatedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				replicas: 5,
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(replicatedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(replicatedStatus);
			expect((result as any).replicas).toBe(5);
		});

		it('should get status for memory storage bucket', async () => {
			const bucketName = 'memory-bucket';
			const memoryStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				storage: 'memory' as const,
				streamInfo: {
					...sampleObjectStoreStatus.streamInfo,
					config: {
						...sampleObjectStoreStatus.streamInfo.config,
						storage: 'memory' as const,
					},
				},
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(memoryStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(memoryStatus);
			expect((result as any).storage).toBe('memory');
		});

		it('should get status for file storage bucket', async () => {
			const bucketName = 'file-bucket';
			const fileStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				storage: 'file' as const,
				streamInfo: {
					...sampleObjectStoreStatus.streamInfo,
					config: {
						...sampleObjectStoreStatus.streamInfo.config,
						storage: 'file' as const,
					},
				},
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(fileStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(fileStatus);
			expect((result as any).storage).toBe('file');
		});

		it('should get status for empty bucket', async () => {
			const bucketName = 'empty-bucket';
			const emptyStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				size: 0,
				streamInfo: {
					...sampleObjectStoreStatus.streamInfo,
					state: {
						...sampleObjectStoreStatus.streamInfo.state,
						messages: 0,
						bytes: 0,
						first_seq: 0,
						last_seq: 0,
					},
				},
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(emptyStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(emptyStatus);
			expect((result as any).size).toBe(0);
		});

		it('should get status for sealed bucket', async () => {
			const bucketName = 'sealed-bucket';
			const sealedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				sealed: true,
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(sealedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(sealedStatus);
			expect((result as any).sealed).toBe(true);
		});

		it('should propagate bucket not found errors', async () => {
			const bucketName = 'nonexistent-bucket';

			const notFoundError = new Error('Object store bucket does not exist');
			(notFoundError as any).code = '404';
			mockOsm.open.mockRejectedValue(notFoundError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Object store bucket does not exist');
			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.status).not.toHaveBeenCalled();
		});

		it('should propagate permission errors', async () => {
			const bucketName = 'restricted-bucket';

			const permissionError = new Error('Permission denied for object store access');
			(permissionError as any).code = '403';
			mockOsm.open.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Permission denied for object store access');
			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
		});

		it('should propagate permission errors on status call', async () => {
			const bucketName = 'restricted-status-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const permissionError = new Error('Permission denied for status access');
			(permissionError as any).code = '403';
			mockOS.status.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Permission denied for status access');
			expect(mockOsm.open).toHaveBeenCalledWith(bucketName);
			expect(mockOS.status).toHaveBeenCalled();
		});

		it('should propagate NATS connection errors', async () => {
			const bucketName = 'test-bucket';

			const connectionError = new Error('NATS connection closed');
			mockOsm.open.mockRejectedValue(connectionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('NATS connection closed');
		});

		it('should propagate NATS connection errors on status', async () => {
			const bucketName = 'test-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const connectionError = new Error('NATS connection closed during status');
			mockOS.status.mockRejectedValue(connectionError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('NATS connection closed during status');
		});

		it('should handle timeout errors on open', async () => {
			const bucketName = 'timeout-bucket';

			const timeoutError = new Error('Object store open timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOsm.open.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Object store open timeout');
		});

		it('should handle timeout errors on status', async () => {
			const bucketName = 'timeout-status-bucket';

			mockOsm.open.mockResolvedValue(mockOS);
			const timeoutError = new Error('Status call timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockOS.status.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Status call timeout');
		});

		it('should handle JetStream not enabled errors', async () => {
			const bucketName = 'test-bucket';

			const jetStreamError = new Error('JetStream not enabled for account');
			(jetStreamError as any).code = '503';
			mockOsm.open.mockRejectedValue(jetStreamError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('JetStream not enabled for account');
		});

		it('should handle empty bucket name', async () => {
			const emptyBucketName = '';

			const emptyError = new Error('Invalid object store bucket name');
			(emptyError as any).code = '400';
			mockOsm.open.mockRejectedValue(emptyError);

			await expect(
				handler.execute(mockOsm, {
					bucket: emptyBucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Invalid object store bucket name');
		});

		it('should handle network errors', async () => {
			const bucketName = 'network-bucket';

			const networkError = new Error('Network connection lost');
			mockOsm.open.mockRejectedValue(networkError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Network connection lost');
		});

		it('should handle server errors', async () => {
			const bucketName = 'server-error-bucket';

			const serverError = new Error('Internal server error');
			(serverError as any).code = '500';
			mockOsm.open.mockRejectedValue(serverError);

			await expect(
				handler.execute(mockOsm, {
					bucket: bucketName,
					objConfig: {} as any,
				}),
			).rejects.toThrow('Internal server error');
		});

		it('should get detailed status with stream information', async () => {
			const bucketName = 'detailed-bucket';
			const detailedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				description: 'Detailed object store bucket',
				ttl: 28800,
				storage: 'file' as const,
				replicas: 3,
				sealed: false,
				size: 5368709120, // 5GB
				streamInfo: {
					config: {
						name: `OBJ_${bucketName}`,
						subjects: [`$O.${bucketName}.C.>`, `$O.${bucketName}.M.>`],
						retention: 'limits' as const,
						max_consumers: -1,
						max_msgs: 50000,
						max_bytes: 5368709120,
						storage: 'file' as const,
					},
					state: {
						messages: 25000,
						bytes: 5368709120,
						first_seq: 1,
						last_seq: 25000,
					},
				},
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(detailedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(detailedStatus);
			expect((result as any).streamInfo.config.name).toBe(`OBJ_${bucketName}`);
			expect((result as any).streamInfo.state.messages).toBe(25000);
		});

		it('should get status with custom description', async () => {
			const bucketName = 'described-bucket';
			const describedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				description: 'This is a custom object store bucket for testing purposes',
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(describedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(describedStatus);
			expect((result as any).description).toBe(
				'This is a custom object store bucket for testing purposes',
			);
		});

		it('should get status for bucket with compression enabled', async () => {
			const bucketName = 'compressed-bucket';
			const compressedStatus = {
				...sampleObjectStoreStatus,
				bucket: bucketName,
				compression: true,
			};

			mockOsm.open.mockResolvedValue(mockOS);
			mockOS.status.mockResolvedValue(compressedStatus as any);

			const result = await handler.execute(mockOsm, {
				bucket: bucketName,
				objConfig: {} as any,
			});

			expect(result).toEqual(compressedStatus);
			expect((result as any).compression).toBe(true);
		});
	});
});
