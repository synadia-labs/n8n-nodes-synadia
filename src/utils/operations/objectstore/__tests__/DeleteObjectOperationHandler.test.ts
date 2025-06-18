import { DeleteObjectOperationHandler } from '../DeleteObjectOperationHandler';

describe('DeleteObjectOperationHandler', () => {
	let handler: DeleteObjectOperationHandler;
	let mockOs: any;

	beforeEach(() => {
		handler = new DeleteObjectOperationHandler();
		
		mockOs = {
			delete: jest.fn().mockResolvedValue(undefined),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should delete an object successfully', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'test-file.txt',
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.delete).toHaveBeenCalledWith('test-file.txt');
			expect(result).toEqual({
				operation: 'delete',
				bucket: 'test-bucket',
				name: 'test-file.txt',
				success: true,
			});
		});

		it('should handle special characters in name', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'path/to/file-with_special.chars.txt',
			};

			await handler.execute(mockOs, params);

			expect(mockOs.delete).toHaveBeenCalledWith('path/to/file-with_special.chars.txt');
		});

		it('should throw error if name is missing', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow('Name is required for delete operation');
		});

		it('should handle deletion error', async () => {
			mockOs.delete.mockRejectedValue(new Error('Object not found'));

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
				name: 'missing.txt',
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow('Object not found');
		});
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('delete');
		});
	});
});