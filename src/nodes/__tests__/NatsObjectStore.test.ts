import { NatsObjectStore } from '../NatsObjectStore.node';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { objectStoreOperationHandlers } from '../../utils/operations/objectstore';
import { IExecuteFunctions } from 'n8n-workflow';
import { jetstream, Objm } from '../../bundled/nats-bundled';

jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled');
jest.mock('../../utils/operations/objectstore', () => ({
	objectStoreOperationHandlers: {
		createBucket: {
			execute: jest.fn().mockResolvedValue({
				operation: 'createBucket',
				bucket: 'test-bucket',
				success: true,
				status: { bucket: 'test-bucket', size: 0, objects: 0 },
			}),
		},
		deleteBucket: {
			execute: jest.fn().mockResolvedValue({
				operation: 'deleteBucket',
				bucket: 'test-bucket',
				success: true,
			}),
		},
		put: {
			execute: jest.fn().mockResolvedValue({
				operation: 'put',
				bucket: 'test-bucket',
				name: 'test.txt',
				success: true,
				info: { name: 'test.txt', size: 100 },
			}),
		},
		get: {
			execute: jest.fn().mockResolvedValue({
				operation: 'get',
				bucket: 'test-bucket',
				name: 'test.txt',
				found: true,
				data: 'test data',
			}),
		},
		delete: {
			execute: jest.fn().mockResolvedValue({
				operation: 'delete',
				bucket: 'test-bucket',
				name: 'test.txt',
				success: true,
			}),
		},
		info: {
			execute: jest.fn().mockResolvedValue({
				operation: 'info',
				bucket: 'test-bucket',
				name: 'test.txt',
				found: true,
				info: { name: 'test.txt', size: 100 },
			}),
		},
		list: {
			execute: jest.fn().mockResolvedValue({
				operation: 'list',
				bucket: 'test-bucket',
				objects: [],
				count: 0,
			}),
		},
		link: {
			execute: jest.fn().mockResolvedValue({
				operation: 'link',
				bucket: 'test-bucket',
				name: 'link.txt',
				success: true,
				linkSource: 'source-bucket/source.txt',
			}),
		},
		status: {
			execute: jest.fn().mockResolvedValue({
				operation: 'status',
				bucket: 'test-bucket',
				size: 0,
				objects: 0,
			}),
		},
	},
}));

describe('NatsObjectStore', () => {
	let node: NatsObjectStore;
	let mockExecuteFunctions: IExecuteFunctions;
	let mockNc: any;
	let mockJs: any;
	let mockObjm: any;
	let mockOs: any;

	beforeEach(() => {
		node = new NatsObjectStore();
		
		mockOs = {};
		mockObjm = {
			open: jest.fn().mockResolvedValue(mockOs),
		};
		mockJs = {};
		mockNc = {};

		(createNatsConnection as jest.Mock).mockResolvedValue(mockNc);
		(closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
		(jetstream as jest.Mock).mockReturnValue(mockJs);
		(Objm as jest.Mock).mockImplementation(() => mockObjm);

		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				servers: 'nats://localhost:4222',
			}),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
			},
			continueOnFail: jest.fn().mockReturnValue(false),
			getNode: jest.fn().mockReturnValue({
				id: 'test-node-id',
				name: 'Test Node',
				type: 'n8n-nodes-synadia.natsObjectStore',
				position: [0, 0],
				typeVersion: 1,
			}),
			logger: {
				error: jest.fn(),
				warn: jest.fn(),
				info: jest.fn(),
				debug: jest.fn(),
			},
		} as any;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should create a bucket', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param: string, index: number, defaultValue?: any) => {
					switch (param) {
						case 'operation': return 'createBucket';
						case 'bucket': return 'test-bucket';
						case 'options': return {};
						default: return defaultValue;
					}
				});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(createNatsConnection).toHaveBeenCalled();
			expect(objectStoreOperationHandlers.createBucket.execute).toHaveBeenCalledWith(
				mockNc,
				expect.objectContaining({
					bucket: 'test-bucket',
					options: {},
				})
			);
			expect(result).toEqual([[{
				json: {
					operation: 'createBucket',
					bucket: 'test-bucket',
					success: true,
					status: { bucket: 'test-bucket', size: 0, objects: 0 },
				},
			}]]);
			expect(closeNatsConnection).toHaveBeenCalledWith(mockNc, expect.any(Object));
		});

		it('should delete a bucket', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param: string) => {
					switch (param) {
						case 'operation': return 'deleteBucket';
						case 'bucket': return 'test-bucket';
						case 'options': return {};
						default: return '';
					}
				});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(objectStoreOperationHandlers.deleteBucket.execute).toHaveBeenCalledWith(
				mockNc,
				expect.objectContaining({
					bucket: 'test-bucket',
				})
			);
			expect(result).toEqual([[{
				json: {
					operation: 'deleteBucket',
					bucket: 'test-bucket',
					success: true,
				},
			}]]);
		});

		it('should put an object', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param: string) => {
					switch (param) {
						case 'operation': return 'put';
						case 'bucket': return 'test-bucket';
						case 'name': return 'test.txt';
						case 'data': return 'test data';
						case 'options': return {};
						default: return '';
					}
				});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(Objm).toHaveBeenCalledWith(mockJs);
			expect(mockObjm.open).toHaveBeenCalledWith('test-bucket');
			expect(objectStoreOperationHandlers.put.execute).toHaveBeenCalledWith(
				mockOs,
				expect.objectContaining({
					bucket: 'test-bucket',
					name: 'test.txt',
					data: 'test data',
				})
			);
			expect(result).toEqual([[{
				json: {
					operation: 'put',
					bucket: 'test-bucket',
					name: 'test.txt',
					success: true,
					info: { name: 'test.txt', size: 100 },
				},
			}]]);
		});

		it('should get an object', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param: string) => {
					switch (param) {
						case 'operation': return 'get';
						case 'bucket': return 'test-bucket';
						case 'name': return 'test.txt';
						case 'options': return {};
						default: return '';
					}
				});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(objectStoreOperationHandlers.get.execute).toHaveBeenCalledWith(
				mockOs,
				expect.objectContaining({
					bucket: 'test-bucket',
					name: 'test.txt',
				})
			);
			expect(result).toEqual([[{
				json: {
					operation: 'get',
					bucket: 'test-bucket',
					name: 'test.txt',
					found: true,
					data: 'test data',
				},
			}]]);
		});

		it('should handle link operation with correct context', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param: string) => {
					switch (param) {
						case 'operation': return 'link';
						case 'bucket': return 'test-bucket';
						case 'name': return 'link.txt';
						case 'linkSource': return 'source-bucket/source.txt';
						case 'options': return {};
						default: return '';
					}
				});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(objectStoreOperationHandlers.link.execute).toHaveBeenCalledWith(
				{ os: mockOs, nc: mockNc },
				expect.objectContaining({
					bucket: 'test-bucket',
					name: 'link.txt',
					sourceBucket: 'source-bucket',
					sourceName: 'source.txt',
				})
			);
		});

		it('should handle multiple items', async () => {
			(mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([
				{ json: {} },
				{ json: {} },
			]);

			let callCount = 0;
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param: string, index: number) => {
					if (param === 'operation') {
						return callCount++ < 2 ? 'get' : 'info';
					}
					switch (param) {
						case 'bucket': return 'test-bucket';
						case 'name': return `file${index}.txt`;
						case 'options': return {};
						default: return '';
					}
				});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0]).toHaveLength(2);
		});

		it('should handle errors with continueOnFail', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param: string) => {
					switch (param) {
						case 'operation': return 'unknown';
						case 'bucket': return 'test-bucket';
						case 'options': return {};
						default: return '';
					}
				});
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toEqual([[{
				json: {
					error: 'Unknown operation: unknown',
					operation: 'unknown',
					bucket: 'test-bucket',
				},
				pairedItem: { item: 0 },
			}]]);
		});

		it('should throw error without continueOnFail', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param: string) => {
					switch (param) {
						case 'operation': return 'unknown';
						case 'bucket': return 'test-bucket';
						default: return {};
					}
				});
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Unknown operation: unknown');
		});

		it('should handle invalid link source format', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param: string) => {
					switch (param) {
						case 'operation': return 'link';
						case 'bucket': return 'test-bucket';
						case 'name': return 'link.txt';
						case 'linkSource': return 'invalid-format';
						case 'options': return {};
						default: return '';
					}
				});
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(false);

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Link source must be in format: bucket-name/object-path');
		});
	});

	describe('node description', () => {
		it('should have correct metadata', () => {
			expect(node.description.displayName).toBe('NATS Object Store');
			expect(node.description.name).toBe('natsObjectStore');
			expect(node.description.version).toBe(1);
			expect(node.description.credentials).toEqual([{
				name: 'natsApi',
				required: true,
			}]);
		});

		it('should have all operations', () => {
			const operations = node.description.properties.find(p => p.name === 'operation');
			expect(operations?.options).toHaveLength(9);
			
			const operationValues = (operations?.options as any[]).map(o => o.value);
			expect(operationValues).toContain('createBucket');
			expect(operationValues).toContain('deleteBucket');
			expect(operationValues).toContain('put');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('info');
			expect(operationValues).toContain('list');
			expect(operationValues).toContain('link');
			expect(operationValues).toContain('status');
		});
	});
});