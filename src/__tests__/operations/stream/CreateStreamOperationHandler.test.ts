import { CreateStreamOperationHandler } from '../../../operations/stream/CreateStreamOperationHandler';
import {
	createMockJetStreamManager,
	sampleStreamInfo,
	createNotFoundError,
	createPermissionError,
	createStreamConfig,
} from '../testUtils';

describe('CreateStreamOperationHandler', () => {
	let handler: CreateStreamOperationHandler;
	let mockJSM: ReturnType<typeof createMockJetStreamManager>;

	beforeEach(() => {
		handler = new CreateStreamOperationHandler();
		mockJSM = createMockJetStreamManager();
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
		it('should create a stream with valid configuration', async () => {
			const streamConfig = createStreamConfig({
				name: 'TEST-STREAM',
				subjects: ['test.*', 'events.>'],
				retention: 'limits' as const,
				max_msgs: 1000,
				storage: 'file' as const,
			});

			mockJSM.streams.add.mockResolvedValue(sampleStreamInfo);

			const result = await handler.execute(mockJSM, { streamConfig });

			expect(mockJSM.streams.add).toHaveBeenCalledWith(streamConfig);
			expect(result).toEqual(sampleStreamInfo);
		});

		it('should create a stream with minimal configuration', async () => {
			const streamConfig = createStreamConfig({
				name: 'MINIMAL-STREAM',
				subjects: ['minimal.*'],
			});

			const minimalStreamInfo = {
				...sampleStreamInfo,
				config: {
					...sampleStreamInfo.config,
					name: 'MINIMAL-STREAM',
					subjects: ['minimal.*'],
				},
			};

			mockJSM.streams.add.mockResolvedValue(minimalStreamInfo);

			const result = await handler.execute(mockJSM, { streamConfig });

			expect(mockJSM.streams.add).toHaveBeenCalledWith(streamConfig);
			expect(result).toEqual(minimalStreamInfo);
		});

		it('should create a stream with memory storage', async () => {
			const streamConfig = createStreamConfig({
				name: 'MEMORY-STREAM',
				subjects: ['memory.*'],
				storage: 'memory' as const,
				max_msgs: 100,
			});

			const memoryStreamInfo = {
				...sampleStreamInfo,
				config: {
					...sampleStreamInfo.config,
					name: 'MEMORY-STREAM',
					subjects: ['memory.*'],
					storage: 'memory' as const,
				},
			};

			mockJSM.streams.add.mockResolvedValue(memoryStreamInfo);

			const result = await handler.execute(mockJSM, { streamConfig });

			expect(mockJSM.streams.add).toHaveBeenCalledWith(streamConfig);
			expect(result).toEqual(memoryStreamInfo);
		});

		it('should throw error when streamConfig is not provided', async () => {
			await expect(handler.execute(mockJSM, {})).rejects.toThrow('no config provided');
			expect(mockJSM.streams.add).not.toHaveBeenCalled();
		});

		it('should propagate stream already exists errors', async () => {
			const streamConfig = createStreamConfig({
				name: 'EXISTING-STREAM',
				subjects: ['existing.*'],
			});

			const existsError = new Error('Stream already exists');
			(existsError as any).code = '400';
			mockJSM.streams.add.mockRejectedValue(existsError);

			await expect(handler.execute(mockJSM, { streamConfig })).rejects.toThrow(
				'Stream already exists',
			);
			expect(mockJSM.streams.add).toHaveBeenCalledWith(streamConfig);
		});

		it('should propagate permission errors', async () => {
			const streamConfig = createStreamConfig({
				name: 'RESTRICTED-STREAM',
				subjects: ['restricted.*'],
			});

			const permissionError = createPermissionError('Permission denied for stream creation');
			mockJSM.streams.add.mockRejectedValue(permissionError);

			await expect(handler.execute(mockJSM, { streamConfig })).rejects.toThrow(
				'Permission denied for stream creation',
			);
			expect(mockJSM.streams.add).toHaveBeenCalledWith(streamConfig);
		});
	});
});
