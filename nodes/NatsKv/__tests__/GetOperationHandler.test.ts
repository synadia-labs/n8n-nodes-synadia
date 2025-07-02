import { GetOperationHandler } from '../operations/GetOperationHandler';
import { createMockKV, createSampleKvEntry, createNotFoundError } from './testUtils';
import { KV } from '../../../bundled/nats-bundled';

describe('GetOperationHandler', () => {
	let handler: GetOperationHandler;
	let mockKV: jest.Mocked<KV>;

	beforeEach(() => {
		handler = new GetOperationHandler();
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
		it('should get an existing key successfully', async () => {
			const testKey = 'test.key';
			const sampleEntry = createSampleKvEntry({ key: testKey });
			mockKV.get.mockResolvedValue(sampleEntry);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(mockKV.get).toHaveBeenCalledWith(testKey);
			expect(result).toEqual({
				found: true,
				entry: sampleEntry,
			});
		});

		it('should return not found for non-existent key', async () => {
			const testKey = 'nonexistent.key';
			mockKV.get.mockResolvedValue(null);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(mockKV.get).toHaveBeenCalledWith(testKey);
			expect(result).toEqual({
				found: false,
			});
		});

		it('should handle empty key parameter', async () => {
			mockKV.get.mockResolvedValue(null);

			const result = await handler.execute(mockKV, { key: '' });

			expect(mockKV.get).toHaveBeenCalledWith('');
			expect(result).toEqual({
				found: false,
			});
		});

		it('should handle special characters in key', async () => {
			const specialKey = 'test.key-with_special/chars:123';
			const sampleEntry = createSampleKvEntry({ key: specialKey });
			mockKV.get.mockResolvedValue(sampleEntry);

			const result = await handler.execute(mockKV, { key: specialKey });

			expect(mockKV.get).toHaveBeenCalledWith(specialKey);
			expect(result.found).toBe(true);
		});

		it('should propagate NATS errors', async () => {
			const testKey = 'test.key';
			const natsError = createNotFoundError('Bucket not found');
			mockKV.get.mockRejectedValue(natsError);

			await expect(handler.execute(mockKV, { key: testKey })).rejects.toThrow('Bucket not found');
			expect(mockKV.get).toHaveBeenCalledWith(testKey);
		});

		it('should handle undefined key parameter gracefully', async () => {
			mockKV.get.mockResolvedValue(null);

			const result = await handler.execute(mockKV, { key: undefined as any });

			expect(mockKV.get).toHaveBeenCalledWith(undefined);
			expect(result).toEqual({
				found: false,
			});
		});

		it('should handle KV entry with null value', async () => {
			const testKey = 'test.key';
			const entryWithNullValue = createSampleKvEntry({ key: testKey, value: null });
			mockKV.get.mockResolvedValue(entryWithNullValue);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(result).toEqual({
				found: true,
				entry: entryWithNullValue,
			});
		});

		it('should handle KV entry with zero revision', async () => {
			const testKey = 'test.key';
			const zeroRevisionEntry = createSampleKvEntry({ key: testKey, revision: 0 });
			mockKV.get.mockResolvedValue(zeroRevisionEntry);

			const result = await handler.execute(mockKV, { key: testKey });

			expect(result).toEqual({
				found: true,
				entry: zeroRevisionEntry,
			});
		});
	});
});
