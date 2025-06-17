import { LinkObjectOperationHandler } from '../LinkObjectOperationHandler';
import { jetstream, Objm } from '../../../../bundled/nats-bundled';

jest.mock('../../../../bundled/nats-bundled');

describe('LinkObjectOperationHandler', () => {
	let handler: LinkObjectOperationHandler;
	let mockOs: any;
	let mockSourceOs: any;
	let mockNc: any;
	let mockJs: any;
	let mockObjm: any;

	beforeEach(() => {
		handler = new LinkObjectOperationHandler();
		
		const mockSourceInfo = {
			name: 'source-file.txt',
			bucket: 'source-bucket',
			size: 1024,
			chunks: 1,
			digest: 'sha256-source123',
		};

		const mockLinkInfo = {
			name: 'linked-file.txt',
			size: 1024,
			chunks: 1,
			digest: 'sha256-source123',
			mtime: '2023-01-01T00:00:00Z',
		};

		mockSourceOs = {
			info: jest.fn().mockResolvedValue(mockSourceInfo),
		};

		mockOs = {
			link: jest.fn().mockResolvedValue(mockLinkInfo),
		};

		mockObjm = {
			open: jest.fn().mockResolvedValue(mockSourceOs),
		};

		mockJs = {};
		mockNc = {};

		(jetstream as jest.Mock).mockReturnValue(mockJs);
		(Objm as jest.Mock).mockImplementation(() => mockObjm);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should create a link to an object in another bucket', async () => {
			const params = {
				bucket: 'target-bucket',
				options: {},
				itemIndex: 0,
				name: 'linked-file.txt',
				sourceBucket: 'source-bucket',
				sourceName: 'source-file.txt',
			};

			const context = { os: mockOs, nc: mockNc };
			const result = await handler.execute(context, params);

			expect(jetstream).toHaveBeenCalledWith(mockNc);
			expect(Objm).toHaveBeenCalledWith(mockJs);
			expect(mockObjm.open).toHaveBeenCalledWith('source-bucket');
			expect(mockSourceOs.info).toHaveBeenCalledWith('source-file.txt');
			expect(mockOs.link).toHaveBeenCalledWith('linked-file.txt', expect.objectContaining({
				name: 'source-file.txt',
				bucket: 'source-bucket',
			}));

			expect(result).toEqual({
				operation: 'link',
				bucket: 'target-bucket',
				name: 'linked-file.txt',
				success: true,
				linkSource: 'source-bucket/source-file.txt',
				info: {
					name: 'linked-file.txt',
					size: 1024,
					chunks: 1,
					digest: 'sha256-source123',
					mtime: '2023-01-01T00:00:00Z',
				},
			});
		});

		it('should throw error if source object not found', async () => {
			mockSourceOs.info.mockResolvedValue(null);

			const params = {
				bucket: 'target-bucket',
				options: {},
				itemIndex: 0,
				name: 'linked-file.txt',
				sourceBucket: 'source-bucket',
				sourceName: 'missing.txt',
			};

			const context = { os: mockOs, nc: mockNc };

			await expect(handler.execute(context, params)).rejects.toThrow(
				'Source object "missing.txt" not found in bucket "source-bucket"'
			);
		});

		it('should throw error if required parameters are missing', async () => {
			const params = {
				bucket: 'target-bucket',
				options: {},
				itemIndex: 0,
				name: 'linked-file.txt',
			};

			const context = { os: mockOs, nc: mockNc };

			await expect(handler.execute(context, params)).rejects.toThrow(
				'Name, sourceBucket, and sourceName are required for link operation'
			);
		});

		it('should throw error if context is missing NatsConnection', async () => {
			const params = {
				bucket: 'target-bucket',
				options: {},
				itemIndex: 0,
				name: 'linked-file.txt',
				sourceBucket: 'source-bucket',
				sourceName: 'source-file.txt',
			};

			await expect(handler.execute(mockOs, params)).rejects.toThrow(
				'Link operation requires NatsConnection context'
			);
		});

		it('should handle source bucket with special characters', async () => {
			const params = {
				bucket: 'target-bucket',
				options: {},
				itemIndex: 0,
				name: 'linked-file.txt',
				sourceBucket: 'my-source_bucket.prod',
				sourceName: 'path/to/file.txt',
			};

			const context = { os: mockOs, nc: mockNc };
			const result = await handler.execute(context, params);

			expect(mockObjm.open).toHaveBeenCalledWith('my-source_bucket.prod');
			expect(mockSourceOs.info).toHaveBeenCalledWith('path/to/file.txt');
			expect(result.linkSource).toBe('my-source_bucket.prod/path/to/file.txt');
		});
	});

	describe('operationName', () => {
		it('should have correct operation name', () => {
			expect(handler.operationName).toBe('link');
		});
	});
});