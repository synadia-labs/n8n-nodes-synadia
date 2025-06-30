import { NatsObjectStore } from '../NatsObjectStore.node';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { objectStoreOperationHandlers } from '../../utils/operations/objectstore';
import { IExecuteFunctions } from 'n8n-workflow';
import { jetstream, Objm } from '../../bundled/nats-bundled';

jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled');
jest.mock('../../utils/operations/objectstore', () => ({
	objectStoreOperationHandlers: {
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
					error: 'Unsupported operation: unknown. Use NATS Object Store Manager for bucket operations.',
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

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Unsupported operation: unknown. Use NATS Object Store Manager for bucket operations.');
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

		it('should have object operations only', () => {
			const operations = node.description.properties.find(p => p.name === 'operation');
			expect(operations?.options).toHaveLength(5);
			
			const operationValues = (operations?.options as any[]).map(o => o.value);
			expect(operationValues).toContain('put');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('info');
			expect(operationValues).toContain('list');
			
			// Should NOT contain bucket operations
			expect(operationValues).not.toContain('createBucket');
			expect(operationValues).not.toContain('deleteBucket');
			expect(operationValues).not.toContain('status');
		});
	});
});