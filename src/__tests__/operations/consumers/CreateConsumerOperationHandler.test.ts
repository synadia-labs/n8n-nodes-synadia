import { CreateConsumerOperationHandler } from '../../../operations/consumers/CreateConsumerOperationHandler';
import {
	createMockJetStreamManager,
	sampleConsumerInfo,
	createNotFoundError,
	createPermissionError,
} from '../testUtils';

// Helper to create a proper consumer config for testing
const createConsumerConfig = (overrides: any = {}) =>
	({
		ack_policy: 'explicit',
		deliver_policy: 'all',
		replay_policy: 'instant',
		...overrides,
	}) as any;

describe('CreateConsumerOperationHandler', () => {
	let handler: CreateConsumerOperationHandler;
	let mockJSM: ReturnType<typeof createMockJetStreamManager>;

	beforeEach(() => {
		handler = new CreateConsumerOperationHandler();
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
		it('should create a durable consumer successfully', async () => {
			const streamName = 'TEST-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'test-consumer',
				ack_wait: 30000000000,
			});

			mockJSM.consumers.add.mockResolvedValue(sampleConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerConfig,
			});

			expect(mockJSM.consumers.add).toHaveBeenCalledWith(streamName, consumerConfig);
			expect(result).toEqual(sampleConsumerInfo);
		});

		it('should create an ephemeral consumer successfully', async () => {
			const streamName = 'TEST-STREAM';
			const consumerConfig = createConsumerConfig({
				deliver_policy: 'new',
				max_deliver: 3,
			});

			const ephemeralConsumerInfo = {
				...sampleConsumerInfo,
				name: '', // Ephemeral consumers have empty names
				config: {
					...sampleConsumerInfo.config,
					durable_name: '',
				},
			};

			mockJSM.consumers.add.mockResolvedValue(ephemeralConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerConfig,
			});

			expect(mockJSM.consumers.add).toHaveBeenCalledWith(streamName, consumerConfig);
			expect(result).toEqual(ephemeralConsumerInfo);
		});

		it('should create a consumer with pull delivery mode', async () => {
			const streamName = 'PULL-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'pull-consumer',
				max_waiting: 100,
				max_ack_pending: 1000,
			});

			mockJSM.consumers.add.mockResolvedValue(sampleConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerConfig,
			});

			expect(mockJSM.consumers.add).toHaveBeenCalledWith(streamName, consumerConfig);
			expect(result).toEqual(sampleConsumerInfo);
		});

		it('should create a consumer with subject filtering', async () => {
			const streamName = 'FILTERED-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'filtered-consumer',
				filter_subject: 'orders.critical.*',
			});

			mockJSM.consumers.add.mockResolvedValue(sampleConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerConfig,
			});

			expect(mockJSM.consumers.add).toHaveBeenCalledWith(streamName, consumerConfig);
			expect(result).toEqual(sampleConsumerInfo);
		});

		it('should create a consumer with replay policy', async () => {
			const streamName = 'REPLAY-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'replay-consumer',
				deliver_policy: 'by_start_sequence',
				opt_start_seq: 100,
				replay_policy: 'original',
			});

			mockJSM.consumers.add.mockResolvedValue(sampleConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerConfig,
			});

			expect(mockJSM.consumers.add).toHaveBeenCalledWith(streamName, consumerConfig);
			expect(result).toEqual(sampleConsumerInfo);
		});

		it('should create a consumer with rate limiting', async () => {
			const streamName = 'RATE-LIMITED-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'rate-limited-consumer',
				rate_limit: 1000,
				max_request_batch: 10,
			});

			mockJSM.consumers.add.mockResolvedValue(sampleConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerConfig,
			});

			expect(mockJSM.consumers.add).toHaveBeenCalledWith(streamName, consumerConfig);
			expect(result).toEqual(sampleConsumerInfo);
		});

		it('should throw error when consumerConfig is not provided', async () => {
			const streamName = 'TEST-STREAM';

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow(
				'No consumerConfig provided',
			);
			expect(mockJSM.consumers.add).not.toHaveBeenCalled();
		});

		it('should throw error when consumerConfig is null', async () => {
			const streamName = 'TEST-STREAM';

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerConfig: null as any,
				}),
			).rejects.toThrow('No consumerConfig provided');
			expect(mockJSM.consumers.add).not.toHaveBeenCalled();
		});

		it('should throw error when consumerConfig is undefined', async () => {
			const streamName = 'TEST-STREAM';

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerConfig: undefined,
				}),
			).rejects.toThrow('No consumerConfig provided');
			expect(mockJSM.consumers.add).not.toHaveBeenCalled();
		});

		it('should propagate stream not found errors', async () => {
			const streamName = 'NONEXISTENT-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'test-consumer',
			});

			const notFoundError = createNotFoundError('Stream not found');
			mockJSM.consumers.add.mockRejectedValue(notFoundError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerConfig,
				}),
			).rejects.toThrow('Stream not found');
			expect(mockJSM.consumers.add).toHaveBeenCalledWith(streamName, consumerConfig);
		});

		it('should propagate consumer already exists errors', async () => {
			const streamName = 'TEST-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'existing-consumer',
			});

			const existsError = new Error('Consumer already exists');
			(existsError as any).code = '400';
			mockJSM.consumers.add.mockRejectedValue(existsError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerConfig,
				}),
			).rejects.toThrow('Consumer already exists');
		});

		it('should propagate permission errors', async () => {
			const streamName = 'RESTRICTED-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'test-consumer',
			});

			const permissionError = createPermissionError('Permission denied for consumer creation');
			mockJSM.consumers.add.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerConfig,
				}),
			).rejects.toThrow('Permission denied for consumer creation');
		});

		it('should handle invalid consumer config errors', async () => {
			const streamName = 'TEST-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'invalid consumer name',
			});

			const invalidError = new Error('Invalid consumer configuration');
			(invalidError as any).code = '400';
			mockJSM.consumers.add.mockRejectedValue(invalidError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerConfig,
				}),
			).rejects.toThrow('Invalid consumer configuration');
		});

		it('should handle network timeout errors', async () => {
			const streamName = 'TEST-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'timeout-consumer',
			});

			const timeoutError = new Error('Consumer creation timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockJSM.consumers.add.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerConfig,
				}),
			).rejects.toThrow('Consumer creation timeout');
		});

		it('should create consumer with comprehensive configuration', async () => {
			const streamName = 'COMPREHENSIVE-STREAM';
			const consumerConfig = createConsumerConfig({
				durable_name: 'comprehensive-consumer',
				description: 'A fully configured consumer for testing',
				filter_subject: 'events.orders.*',
				max_deliver: 5,
				ack_wait: 60000000000,
				max_ack_pending: 500,
				max_waiting: 50,
				rate_limit: 2000,
				sample_freq: '10%',
				headers_only: false,
				flow_control: true,
				idle_heartbeat: 10000000000,
				max_request_batch: 25,
				max_request_expires: 5000000000,
			});

			mockJSM.consumers.add.mockResolvedValue(sampleConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerConfig,
			});

			expect(mockJSM.consumers.add).toHaveBeenCalledWith(streamName, consumerConfig);
			expect(result).toEqual(sampleConsumerInfo);
		});
	});
});
