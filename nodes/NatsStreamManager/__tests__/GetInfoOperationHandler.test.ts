import { GetInfoOperationHandler } from '../operations/GetInfoOperationHandler';
import {
	createMockJetStreamManager,
	sampleStreamInfo,
	createNotFoundError,
	createPermissionError,
} from './testUtils';

describe('GetInfoOperationHandler', () => {
	let handler: GetInfoOperationHandler;
	let mockJSM: ReturnType<typeof createMockJetStreamManager>;

	beforeEach(() => {
		handler = new GetInfoOperationHandler();
		mockJSM = createMockJetStreamManager();
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
		it('should get stream info for existing stream', async () => {
			const streamName = 'TEST-STREAM';

			mockJSM.streams.info.mockResolvedValue(sampleStreamInfo);

			const result = await handler.execute(mockJSM, { streamName });

			expect(mockJSM.streams.info).toHaveBeenCalledWith(streamName);
			expect(result).toEqual(sampleStreamInfo);
		});

		it('should get stream info with detailed state', async () => {
			const streamName = 'DETAILED-STREAM';
			const detailedStreamInfo = {
				...sampleStreamInfo,
				config: {
					...sampleStreamInfo.config,
					name: streamName,
				},
				state: {
					...sampleStreamInfo.state,
					messages: 12345,
					bytes: 987654321,
					first_seq: 1,
					last_seq: 12345,
					consumer_count: 3,
				},
			};

			mockJSM.streams.info.mockResolvedValue(detailedStreamInfo);

			const result = await handler.execute(mockJSM, { streamName });

			expect(mockJSM.streams.info).toHaveBeenCalledWith(streamName);
			expect(result).toEqual(detailedStreamInfo);
			expect((result as any).state.messages).toBe(12345);
			expect((result as any).state.consumer_count).toBe(3);
		});

		it('should get stream info for stream with complex configuration', async () => {
			const streamName = 'COMPLEX-STREAM';
			const complexStreamInfo = {
				...sampleStreamInfo,
				config: {
					...sampleStreamInfo.config,
					name: streamName,
					subjects: ['orders.*', 'events.>'],
					retention: 'workqueue' as const,
					max_consumers: 10,
					max_msgs: 100000,
					storage: 'memory' as const,
					num_replicas: 3,
				},
			};

			mockJSM.streams.info.mockResolvedValue(complexStreamInfo);

			const result = await handler.execute(mockJSM, { streamName });

			expect(result).toEqual(complexStreamInfo);
			expect((result as any).config.subjects).toEqual(['orders.*', 'events.>']);
			expect((result as any).config.retention).toBe('workqueue');
		});

		it('should handle stream names with special characters', async () => {
			const streamName = 'TEST_STREAM-123';
			const streamInfo = {
				...sampleStreamInfo,
				config: {
					...sampleStreamInfo.config,
					name: streamName,
				},
			};

			mockJSM.streams.info.mockResolvedValue(streamInfo);

			const result = await handler.execute(mockJSM, { streamName });

			expect(mockJSM.streams.info).toHaveBeenCalledWith(streamName);
			expect(result).toEqual(streamInfo);
		});

		it('should throw error when streamName is not provided', async () => {
			await expect(handler.execute(mockJSM, {})).rejects.toThrow('no stream name provided');
			expect(mockJSM.streams.info).not.toHaveBeenCalled();
		});

		it('should throw error when streamName is empty string', async () => {
			await expect(handler.execute(mockJSM, { streamName: '' })).rejects.toThrow(
				'no stream name provided',
			);
			expect(mockJSM.streams.info).not.toHaveBeenCalled();
		});

		it('should throw error when streamName is null', async () => {
			await expect(handler.execute(mockJSM, { streamName: null as any })).rejects.toThrow(
				'no stream name provided',
			);
			expect(mockJSM.streams.info).not.toHaveBeenCalled();
		});

		it('should throw error when streamName is undefined', async () => {
			await expect(handler.execute(mockJSM, { streamName: undefined })).rejects.toThrow(
				'no stream name provided',
			);
			expect(mockJSM.streams.info).not.toHaveBeenCalled();
		});

		it('should propagate stream not found errors', async () => {
			const streamName = 'NONEXISTENT-STREAM';
			const notFoundError = createNotFoundError('Stream not found');

			mockJSM.streams.info.mockRejectedValue(notFoundError);

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow('Stream not found');
			expect(mockJSM.streams.info).toHaveBeenCalledWith(streamName);
		});

		it('should propagate permission errors', async () => {
			const streamName = 'RESTRICTED-STREAM';
			const permissionError = createPermissionError('Permission denied for stream info');

			mockJSM.streams.info.mockRejectedValue(permissionError);

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow(
				'Permission denied for stream info',
			);
			expect(mockJSM.streams.info).toHaveBeenCalledWith(streamName);
		});

		it('should handle network timeout errors', async () => {
			const streamName = 'TIMEOUT-STREAM';
			const timeoutError = new Error('Stream info timeout');
			(timeoutError as any).code = 'TIMEOUT';

			mockJSM.streams.info.mockRejectedValue(timeoutError);

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow('Stream info timeout');
		});

		it('should handle JetStream not enabled errors', async () => {
			const streamName = 'TEST-STREAM';
			const jetStreamError = new Error('JetStream not enabled for account');
			(jetStreamError as any).code = '503';

			mockJSM.streams.info.mockRejectedValue(jetStreamError);

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow(
				'JetStream not enabled for account',
			);
		});

		it('should return stream info with timestamps', async () => {
			const streamName = 'TIMESTAMP-STREAM';
			const now = new Date();
			const createdTime = new Date(now.getTime() - 3600000); // 1 hour ago

			const timestampStreamInfo = {
				...sampleStreamInfo,
				config: {
					...sampleStreamInfo.config,
					name: streamName,
				},
				created: createdTime,
				ts: now,
				state: {
					...sampleStreamInfo.state,
					first_ts: createdTime,
					last_ts: now,
				},
			};

			mockJSM.streams.info.mockResolvedValue(timestampStreamInfo);

			const result = await handler.execute(mockJSM, { streamName });

			expect(result).toEqual(timestampStreamInfo);
			expect((result as any).created).toEqual(createdTime);
			expect((result as any).ts).toEqual(now);
		});

		it('should handle empty stream state', async () => {
			const streamName = 'EMPTY-STREAM';
			const emptyStreamInfo = {
				...sampleStreamInfo,
				config: {
					...sampleStreamInfo.config,
					name: streamName,
				},
				state: {
					messages: 0,
					bytes: 0,
					first_seq: 0,
					first_ts: new Date(),
					last_seq: 0,
					last_ts: new Date(),
					consumer_count: 0,
				},
			};

			mockJSM.streams.info.mockResolvedValue(emptyStreamInfo);

			const result = await handler.execute(mockJSM, { streamName });

			expect(result).toEqual(emptyStreamInfo);
			expect((result as any).state.messages).toBe(0);
			expect((result as any).state.consumer_count).toBe(0);
		});
	});
});
