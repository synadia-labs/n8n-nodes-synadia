import { DeleteStreamOperationHandler } from '../../../operations/stream/DeleteStreamOperationHandler';
import {
	createMockJetStreamManager,
	createNotFoundError,
	createPermissionError,
} from '../testUtils';

describe('DeleteStreamOperationHandler', () => {
	let handler: DeleteStreamOperationHandler;
	let mockJSM: ReturnType<typeof createMockJetStreamManager>;

	beforeEach(() => {
		handler = new DeleteStreamOperationHandler();
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
		it('should delete an existing stream successfully', async () => {
			const streamName = 'TEST-STREAM';

			mockJSM.streams.delete.mockResolvedValue(true);

			const result = await handler.execute(mockJSM, { streamName });

			expect(mockJSM.streams.delete).toHaveBeenCalledWith(streamName);
			expect(result).toEqual({
				deleted: true,
			});
		});

		it('should handle stream not found scenario', async () => {
			const streamName = 'NONEXISTENT-STREAM';

			mockJSM.streams.delete.mockResolvedValue(false);

			const result = await handler.execute(mockJSM, { streamName });

			expect(mockJSM.streams.delete).toHaveBeenCalledWith(streamName);
			expect(result).toEqual({
				deleted: false,
			});
		});

		it('should throw error when streamName is not provided', async () => {
			await expect(handler.execute(mockJSM, {})).rejects.toThrow('no stream name provided');
			expect(mockJSM.streams.delete).not.toHaveBeenCalled();
		});

		it('should throw error when streamName is empty', async () => {
			await expect(handler.execute(mockJSM, { streamName: '' })).rejects.toThrow(
				'no stream name provided',
			);
			expect(mockJSM.streams.delete).not.toHaveBeenCalled();
		});

		it('should propagate stream not found errors', async () => {
			const streamName = 'MISSING-STREAM';
			const notFoundError = createNotFoundError('Stream not found');

			mockJSM.streams.delete.mockRejectedValue(notFoundError);

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow('Stream not found');
			expect(mockJSM.streams.delete).toHaveBeenCalledWith(streamName);
		});

		it('should propagate permission errors', async () => {
			const streamName = 'RESTRICTED-STREAM';
			const permissionError = createPermissionError('Permission denied for stream deletion');

			mockJSM.streams.delete.mockRejectedValue(permissionError);

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow(
				'Permission denied for stream deletion',
			);
			expect(mockJSM.streams.delete).toHaveBeenCalledWith(streamName);
		});

		it('should handle streams with consumers error', async () => {
			const streamName = 'STREAM-WITH-CONSUMERS';
			const consumerError = new Error('Stream has active consumers');
			(consumerError as any).code = '400';

			mockJSM.streams.delete.mockRejectedValue(consumerError);

			await expect(handler.execute(mockJSM, { streamName })).rejects.toThrow(
				'Stream has active consumers',
			);
		});
	});
});
