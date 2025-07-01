import { GetInfoOperationHandler } from '../operations/GetInfoOperationHandler';
import {
	createMockJetStreamManager,
	sampleConsumerInfo,
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
		it('should get consumer info for existing consumer', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'test-consumer';

			mockJSM.consumers.info.mockResolvedValue(sampleConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.info).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual(sampleConsumerInfo);
		});

		it('should get info for durable consumer with detailed statistics', async () => {
			const streamName = 'DETAILED-STREAM';
			const consumerName = 'detailed-consumer';
			const detailedConsumerInfo = {
				...sampleConsumerInfo,
				name: consumerName,
				stream_name: streamName,
				config: {
					...sampleConsumerInfo.config,
					durable_name: consumerName,
					description: 'A detailed consumer for testing',
				},
				delivered: {
					consumer_seq: 1000,
					stream_seq: 1000,
					last_active: new Date(),
				},
				ack_floor: {
					consumer_seq: 950,
					stream_seq: 950,
					last_active: new Date(),
				},
				num_ack_pending: 50,
				num_redelivered: 5,
				num_waiting: 0,
				num_pending: 100,
			};

			mockJSM.consumers.info.mockResolvedValue(detailedConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.info).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual(detailedConsumerInfo);
			expect((result as any).num_ack_pending).toBe(50);
			expect((result as any).num_redelivered).toBe(5);
		});

		it('should get info for ephemeral consumer', async () => {
			const streamName = 'EPHEMERAL-STREAM';
			const consumerName = 'ephemeral-consumer-id';
			const ephemeralConsumerInfo = {
				...sampleConsumerInfo,
				name: consumerName,
				stream_name: streamName,
				config: {
					...sampleConsumerInfo.config,
					durable_name: '', // Ephemeral consumers have empty durable names
				},
			};

			mockJSM.consumers.info.mockResolvedValue(ephemeralConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(result).toEqual(ephemeralConsumerInfo);
			expect((result as any).config.durable_name).toBe('');
		});

		it('should get info for consumer with specific delivery policy', async () => {
			const streamName = 'POLICY-STREAM';
			const consumerName = 'policy-consumer';
			const policyConsumerInfo = {
				...sampleConsumerInfo,
				name: consumerName,
				config: {
					...sampleConsumerInfo.config,
					deliver_policy: 'by_start_sequence' as const,
					opt_start_seq: 500,
					ack_policy: 'none' as const,
				},
			};

			mockJSM.consumers.info.mockResolvedValue(policyConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(result).toEqual(policyConsumerInfo);
			expect((result as any).config.deliver_policy).toBe('by_start_sequence');
			expect((result as any).config.opt_start_seq).toBe(500);
		});

		it('should get info for consumer with subject filtering', async () => {
			const streamName = 'FILTERED-STREAM';
			const consumerName = 'filtered-consumer';
			const filteredConsumerInfo = {
				...sampleConsumerInfo,
				name: consumerName,
				config: {
					...sampleConsumerInfo.config,
					filter_subject: 'orders.critical.*',
				},
			};

			mockJSM.consumers.info.mockResolvedValue(filteredConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(result).toEqual(filteredConsumerInfo);
			expect((result as any).config.filter_subject).toBe('orders.critical.*');
		});

		it('should handle consumer names with special characters', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'consumer-with_special-chars123';
			const specialConsumerInfo = {
				...sampleConsumerInfo,
				name: consumerName,
			};

			mockJSM.consumers.info.mockResolvedValue(specialConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.info).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual(specialConsumerInfo);
		});

		it('should throw error when consumerName is not provided', async () => {
			const streamName = 'TEST-STREAM';

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow(
				'No consumer name provided',
			);
			expect(mockJSM.consumers.info).not.toHaveBeenCalled();
		});

		it('should throw error when consumerName is empty string', async () => {
			const streamName = 'TEST-STREAM';

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName: '',
				}),
			).rejects.toThrow('No consumer name provided');
			expect(mockJSM.consumers.info).not.toHaveBeenCalled();
		});

		it('should throw error when consumerName is null', async () => {
			const streamName = 'TEST-STREAM';

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName: null as any,
				}),
			).rejects.toThrow('No consumer name provided');
			expect(mockJSM.consumers.info).not.toHaveBeenCalled();
		});

		it('should throw error when consumerName is undefined', async () => {
			const streamName = 'TEST-STREAM';

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName: undefined,
				}),
			).rejects.toThrow('No consumer name provided');
			expect(mockJSM.consumers.info).not.toHaveBeenCalled();
		});

		it('should propagate stream not found errors', async () => {
			const streamName = 'NONEXISTENT-STREAM';
			const consumerName = 'test-consumer';

			const notFoundError = createNotFoundError('Stream not found');
			mockJSM.consumers.info.mockRejectedValue(notFoundError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Stream not found');
			expect(mockJSM.consumers.info).toHaveBeenCalledWith(streamName, consumerName);
		});

		it('should propagate consumer not found errors', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'nonexistent-consumer';

			const notFoundError = createNotFoundError('Consumer not found');
			mockJSM.consumers.info.mockRejectedValue(notFoundError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Consumer not found');
			expect(mockJSM.consumers.info).toHaveBeenCalledWith(streamName, consumerName);
		});

		it('should propagate permission errors', async () => {
			const streamName = 'RESTRICTED-STREAM';
			const consumerName = 'restricted-consumer';

			const permissionError = createPermissionError('Permission denied for consumer info');
			mockJSM.consumers.info.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Permission denied for consumer info');
			expect(mockJSM.consumers.info).toHaveBeenCalledWith(streamName, consumerName);
		});

		it('should handle network timeout errors', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'timeout-consumer';

			const timeoutError = new Error('Consumer info timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockJSM.consumers.info.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Consumer info timeout');
		});

		it('should handle JetStream not enabled errors', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'test-consumer';

			const jetStreamError = new Error('JetStream not enabled for account');
			(jetStreamError as any).code = '503';
			mockJSM.consumers.info.mockRejectedValue(jetStreamError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('JetStream not enabled for account');
		});

		it('should return consumer info with timestamps', async () => {
			const streamName = 'TIMESTAMP-STREAM';
			const consumerName = 'timestamp-consumer';
			const now = new Date();
			const createdTime = new Date(now.getTime() - 3600000); // 1 hour ago

			const timestampConsumerInfo = {
				...sampleConsumerInfo,
				name: consumerName,
				created: createdTime,
				ts: now,
				delivered: {
					...sampleConsumerInfo.delivered,
					last_active: new Date(now.getTime() - 60000), // 1 minute ago
				},
				ack_floor: {
					...sampleConsumerInfo.ack_floor,
					last_active: new Date(now.getTime() - 120000), // 2 minutes ago
				},
			};

			mockJSM.consumers.info.mockResolvedValue(timestampConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(result).toEqual(timestampConsumerInfo);
			expect((result as any).created).toEqual(createdTime);
			expect((result as any).ts).toEqual(now);
		});

		it('should get info for consumer with active push subscription', async () => {
			const streamName = 'PUSH-STREAM';
			const consumerName = 'push-consumer';
			const pushConsumerInfo = {
				...sampleConsumerInfo,
				name: consumerName,
				config: {
					...sampleConsumerInfo.config,
					deliver_subject: 'push.delivery.subject',
				},
				push_bound: true,
			};

			mockJSM.consumers.info.mockResolvedValue(pushConsumerInfo);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(result).toEqual(pushConsumerInfo);
			expect((result as any).config.deliver_subject).toBe('push.delivery.subject');
			expect((result as any).push_bound).toBe(true);
		});
	});
});
