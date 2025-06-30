import { DeleteConsumerOperationHandler } from '../../../operations/consumers/DeleteConsumerOperationHandler';
import {
	createMockJetStreamManager,
	createNotFoundError,
	createPermissionError,
} from '../testUtils';

describe('DeleteConsumerOperationHandler', () => {
	let handler: DeleteConsumerOperationHandler;
	let mockJSM: ReturnType<typeof createMockJetStreamManager>;

	beforeEach(() => {
		handler = new DeleteConsumerOperationHandler();
		mockJSM = createMockJetStreamManager();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('delete');
		});
	});

	describe('execute', () => {
		it('should delete an existing consumer successfully', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'test-consumer';

			mockJSM.consumers.delete.mockResolvedValue(true);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle consumer not found scenario', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'nonexistent-consumer';

			mockJSM.consumers.delete.mockResolvedValue(false);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual({
				deleted: false,
			});
		});

		it('should delete a durable consumer', async () => {
			const streamName = 'DURABLE-STREAM';
			const consumerName = 'durable-consumer';

			mockJSM.consumers.delete.mockResolvedValue(true);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle special characters in consumer name', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'consumer-with_special-chars123';

			mockJSM.consumers.delete.mockResolvedValue(true);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle special characters in stream name', async () => {
			const streamName = 'STREAM_WITH-SPECIAL_CHARS';
			const consumerName = 'test-consumer';

			mockJSM.consumers.delete.mockResolvedValue(true);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should throw error when consumerName is not provided', async () => {
			const streamName = 'TEST-STREAM';

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow(
				'No consumer name provided',
			);
			expect(mockJSM.consumers.delete).not.toHaveBeenCalled();
		});

		it('should throw error when consumerName is empty string', async () => {
			const streamName = 'TEST-STREAM';

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName: '',
				}),
			).rejects.toThrow('No consumer name provided');
			expect(mockJSM.consumers.delete).not.toHaveBeenCalled();
		});

		it('should throw error when consumerName is null', async () => {
			const streamName = 'TEST-STREAM';

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName: null as any,
				}),
			).rejects.toThrow('No consumer name provided');
			expect(mockJSM.consumers.delete).not.toHaveBeenCalled();
		});

		it('should throw error when consumerName is undefined', async () => {
			const streamName = 'TEST-STREAM';

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName: undefined,
				}),
			).rejects.toThrow('No consumer name provided');
			expect(mockJSM.consumers.delete).not.toHaveBeenCalled();
		});

		it('should propagate stream not found errors', async () => {
			const streamName = 'NONEXISTENT-STREAM';
			const consumerName = 'test-consumer';

			const notFoundError = createNotFoundError('Stream not found');
			mockJSM.consumers.delete.mockRejectedValue(notFoundError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Stream not found');
			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
		});

		it('should propagate consumer not found errors', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'missing-consumer';

			const notFoundError = createNotFoundError('Consumer not found');
			mockJSM.consumers.delete.mockRejectedValue(notFoundError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Consumer not found');
			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
		});

		it('should propagate permission errors', async () => {
			const streamName = 'RESTRICTED-STREAM';
			const consumerName = 'restricted-consumer';

			const permissionError = createPermissionError('Permission denied for consumer deletion');
			mockJSM.consumers.delete.mockRejectedValue(permissionError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Permission denied for consumer deletion');
			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
		});

		it('should handle active consumer deletion errors', async () => {
			const streamName = 'ACTIVE-STREAM';
			const consumerName = 'active-consumer';

			const activeError = new Error('Consumer has active subscriptions');
			(activeError as any).code = '400';
			mockJSM.consumers.delete.mockRejectedValue(activeError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Consumer has active subscriptions');
		});

		it('should handle network timeout errors', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'timeout-consumer';

			const timeoutError = new Error('Consumer deletion timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockJSM.consumers.delete.mockRejectedValue(timeoutError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Consumer deletion timeout');
		});

		it('should handle JetStream not enabled errors', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'test-consumer';

			const jetStreamError = new Error('JetStream not enabled for account');
			(jetStreamError as any).code = '503';
			mockJSM.consumers.delete.mockRejectedValue(jetStreamError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('JetStream not enabled for account');
		});

		it('should handle concurrent deletion scenarios', async () => {
			const streamName = 'CONCURRENT-STREAM';
			const consumerName = 'concurrent-consumer';

			const concurrentError = new Error('Concurrent modification detected');
			(concurrentError as any).code = 'CONCURRENT_MODIFICATION';
			mockJSM.consumers.delete.mockRejectedValue(concurrentError);

			await expect(
				handler.execute(mockJSM, {
					streamName,
					consumerName,
				}),
			).rejects.toThrow('Concurrent modification detected');
		});

		it('should handle long consumer names', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'very-long-consumer-name-that-might-cause-issues-with-some-systems';

			mockJSM.consumers.delete.mockResolvedValue(true);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle case-sensitive consumer names', async () => {
			const streamName = 'TEST-STREAM';
			const consumerName = 'CaseSensitive-Consumer';

			mockJSM.consumers.delete.mockResolvedValue(true);

			const result = await handler.execute(mockJSM, {
				streamName,
				consumerName,
			});

			expect(mockJSM.consumers.delete).toHaveBeenCalledWith(streamName, consumerName);
			expect(result).toEqual({
				deleted: true,
			});
		});
	});
});
