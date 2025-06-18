import { ListObjectsOperationHandler } from '../ListObjectsOperationHandler';

describe('ListObjectsOperationHandler', () => {
	let handler: ListObjectsOperationHandler;
	let mockOs: any;

	beforeEach(() => {
		handler = new ListObjectsOperationHandler();
		
		const mockObjects = [
			{
				name: 'file1.txt',
				size: 1024,
				chunks: 1,
				digest: 'sha256-abc123',
				mtime: '2023-01-01T00:00:00Z',
				options: {},
			},
			{
				name: 'file2.json',
				size: 2048,
				chunks: 2,
				digest: 'sha256-def456',
				mtime: '2023-01-02T00:00:00Z',
				options: { link: { bucket: 'other', name: 'source.json' } },
			},
			{
				name: 'file3.bin',
				size: 4096,
				chunks: 4,
				digest: 'sha256-ghi789',
				mtime: '2023-01-03T00:00:00Z',
				options: {},
			},
		];

		// Create an async iterator
		const asyncIterator = {
			[Symbol.asyncIterator]: function() {
				let index = 0;
				return {
					async next() {
						if (index < mockObjects.length) {
							return { value: mockObjects[index++], done: false };
						}
						return { done: true };
					},
				};
			},
		};

		mockOs = {
			list: jest.fn().mockResolvedValue(asyncIterator),
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should list all objects in a bucket', async () => {
			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockOs, params);

			expect(mockOs.list).toHaveBeenCalled();
			expect(result).toEqual({
				operation: 'list',
				bucket: 'test-bucket',
				objects: [
					{
						name: 'file1.txt',
						size: 1024,
						chunks: 1,
						digest: 'sha256-abc123',
						mtime: '2023-01-01T00:00:00Z',
						isLink: false,
					},
					{
						name: 'file2.json',
						size: 2048,
						chunks: 2,
						digest: 'sha256-def456',
						mtime: '2023-01-02T00:00:00Z',
						isLink: true,
					},
					{
						name: 'file3.bin',
						size: 4096,
						chunks: 4,
						digest: 'sha256-ghi789',
						mtime: '2023-01-03T00:00:00Z',
						isLink: false,
					},
				],
				count: 3,
			});
		});

		it('should handle empty bucket', async () => {
			const emptyIterator = {
				[Symbol.asyncIterator]: function() {
					return {
						async next() {
							return { done: true };
						},
					};
				},
			};

			mockOs.list.mockResolvedValue(emptyIterator);

			const params = {
				bucket: 'empty-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockOs, params);

			expect(result).toEqual({
				operation: 'list',
				bucket: 'empty-bucket',
				objects: [],
				count: 0,
			});
		});

		it('should correctly identify linked objects', async () => {
			const linkedObjects = [
				{
					name: 'normal.txt',
					size: 100,
					chunks: 1,
					digest: 'sha256-normal',
					mtime: '2023-01-01T00:00:00Z',
					options: {},
				},
				{
					name: 'linked.txt',
					size: 200,
					chunks: 1,
					digest: 'sha256-linked',
					mtime: '2023-01-01T00:00:00Z',
					options: { link: {} },
				},
			];

			const asyncIterator = {
				[Symbol.asyncIterator]: function() {
					let index = 0;
					return {
						async next() {
							if (index < linkedObjects.length) {
								return { value: linkedObjects[index++], done: false };
							}
							return { done: true };
						},
					};
				},
			};

			mockOs.list.mockResolvedValue(asyncIterator);

			const params = {
				bucket: 'test-bucket',
				options: {},
				itemIndex: 0,
			};

			const result = await handler.execute(mockOs, params);

			expect(result.objects[0].isLink).toBe(false);
			expect(result.objects[1].isLink).toBe(true);
		});
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('list');
		});
	});
});