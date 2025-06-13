import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NatsKv } from '../NatsKv.node';
import * as NatsConnection from '../../utils/NatsConnection';
import { NodeApiError } from 'n8n-workflow';

jest.mock('../../utils/NatsConnection');

describe('NatsKv Node', () => {
	let node: NatsKv;
	let mockExecuteFunctions: IExecuteFunctions;
	let mockNc: any;
	let mockJs: any;
	let mockJsm: any;
	let mockKv: any;
	
	beforeEach(() => {
		jest.clearAllMocks();
		
		node = new NatsKv();
		
		// Mock KV store methods
		mockKv = {
			get: jest.fn(),
			put: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			purge: jest.fn(),
			keys: jest.fn(),
			history: jest.fn(),
			status: jest.fn(),
		};
		
		// Mock JetStream manager
		mockJsm = {
			streams: {
				delete: jest.fn().mockResolvedValue(true),
			},
		};
		
		// Mock JetStream
		mockJs = {
			views: {
				kv: jest.fn().mockResolvedValue(mockKv),
			},
			jetstreamManager: jest.fn().mockResolvedValue(mockJsm),
		};
		
		// Mock NATS connection
		mockNc = {
			jetstream: jest.fn().mockReturnValue(mockJs),
			flush: jest.fn().mockResolvedValue(undefined),
		};
		
		// Mock execute functions
		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNodeParameter: jest.fn() as jest.MockedFunction<IExecuteFunctions['getNodeParameter']>,
			getCredentials: jest.fn().mockResolvedValue({}),
			getNode: jest.fn().mockReturnValue({}),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
			},
			continueOnFail: jest.fn().mockReturnValue(false),
			logger: {
				error: jest.fn(),
			},
		} as any;
		
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNc);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
	});
	
	describe('execute', () => {
		it('should create a KV bucket', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('createBucket') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({ // options
					history: 20,
					ttl: 3600,
					replicas: 2,
				});
			
			const mockStatus = {
				bucket: 'test-bucket',
				values: 0,
				size: 0,
				ttl: 3600000000000,
			};
			mockKv.status.mockResolvedValue(mockStatus);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockJs.views.kv).toHaveBeenCalledWith('test-bucket', expect.objectContaining({
				history: 20,
				ttl: 3600000000000, // converted to nanoseconds
				replicas: 2,
			}));
			
			expect(result[0][0].json).toMatchObject({
				operation: 'createBucket',
				bucket: 'test-bucket',
				success: true,
			});
		});
		
		it('should delete a KV bucket', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('deleteBucket') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}); // options
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockJsm.streams.delete).toHaveBeenCalledWith('KV_test-bucket');
			expect(result[0][0].json).toMatchObject({
				operation: 'deleteBucket',
				bucket: 'test-bucket',
				success: true,
			});
		});
		
		it('should get a value from KV bucket', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}) // options
				.mockReturnValueOnce('test-key'); // key
			
			const mockEntry = {
				value: new TextEncoder().encode(JSON.stringify({ foo: 'bar' })),
				revision: 5,
				created: new Date('2023-01-01'),
				delta: 1,
			};
			mockKv.get.mockResolvedValue(mockEntry);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockKv.get).toHaveBeenCalledWith('test-key');
			expect(result[0][0].json).toMatchObject({
				operation: 'get',
				bucket: 'test-bucket',
				key: 'test-key',
				found: true,
				value: { foo: 'bar' },
				revision: 5,
			});
		});
		
		it('should handle missing key in get operation', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}) // options
				.mockReturnValueOnce('missing-key'); // key
			
			mockKv.get.mockResolvedValue(null);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(result[0][0].json).toMatchObject({
				operation: 'get',
				bucket: 'test-bucket',
				key: 'missing-key',
				found: false,
			});
		});
		
		it('should put a value into KV bucket', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('put') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({ valueType: 'json' }) // options
				.mockReturnValueOnce('test-key') // key
				.mockReturnValueOnce(JSON.stringify({ foo: 'bar' })); // value
			
			mockKv.put.mockResolvedValue(10);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockKv.put).toHaveBeenCalledWith(
				'test-key',
				expect.any(Uint8Array)
			);
			expect(result[0][0].json).toMatchObject({
				operation: 'put',
				bucket: 'test-bucket',
				key: 'test-key',
				success: true,
				revision: 10,
			});
		});
		
		it('should update a value with revision check', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('update') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({ revision: 5 }) // options
				.mockReturnValueOnce('test-key') // key
				.mockReturnValueOnce('new value'); // value
			
			mockKv.update.mockResolvedValue(6);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockKv.update).toHaveBeenCalledWith(
				'test-key',
				expect.any(Uint8Array),
				5
			);
			expect(result[0][0].json).toMatchObject({
				operation: 'update',
				bucket: 'test-bucket',
				key: 'test-key',
				success: true,
				revision: 6,
			});
		});
		
		it('should delete a key from KV bucket', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('delete') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}) // options
				.mockReturnValueOnce('test-key'); // key
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockKv.delete).toHaveBeenCalledWith('test-key');
			expect(result[0][0].json).toMatchObject({
				operation: 'delete',
				bucket: 'test-bucket',
				key: 'test-key',
				success: true,
			});
		});
		
		it('should list all keys in bucket', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('list') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}); // options
			
			const mockKeys = ['key1', 'key2', 'key3'];
			mockKv.keys.mockResolvedValue({
				[Symbol.asyncIterator]: async function* () {
					for (const key of mockKeys) {
						yield key;
					}
				},
			});
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(result[0][0].json).toMatchObject({
				operation: 'list',
				bucket: 'test-bucket',
				keys: mockKeys,
				count: 3,
			});
		});
		
		it('should get history for a key', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('history') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}) // options
				.mockReturnValueOnce('test-key'); // key
			
			const mockHistory = [
				{
					value: new TextEncoder().encode('value1'),
					revision: 1,
					created: new Date('2023-01-01'),
					operation: 'PUT',
					delta: 0,
				},
				{
					value: new TextEncoder().encode('value2'),
					revision: 2,
					created: new Date('2023-01-02'),
					operation: 'PUT',
					delta: 1,
				},
			];
			
			mockKv.history.mockResolvedValue({
				[Symbol.asyncIterator]: async function* () {
					for (const entry of mockHistory) {
						yield entry;
					}
				},
			});
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockKv.history).toHaveBeenCalledWith({ key: 'test-key' });
			expect(result[0][0].json).toMatchObject({
				operation: 'history',
				bucket: 'test-bucket',
				key: 'test-key',
				count: 2,
			});
			expect(result[0][0].json.history).toHaveLength(2);
		});
		
		it('should get bucket status', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('status') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}); // options
			
			const mockStatus = {
				bucket: 'test-bucket',
				values: 100,
				size: 1024,
				ttl: 3600,
			};
			mockKv.status.mockResolvedValue(mockStatus);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(result[0][0].json).toMatchObject({
				operation: 'status',
				bucket: 'test-bucket',
				values: 100,
			});
		});
		
		it('should handle connection errors', async () => {
			(NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
				new Error('Connection failed')
			);
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('get')
				.mockReturnValueOnce('test-bucket')
				.mockReturnValueOnce({})
				.mockReturnValueOnce('test-key');
			
			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'NATS KV operation failed: Connection failed'
			);
		});
		
		it('should close connection on completion', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('get')
				.mockReturnValueOnce('test-bucket')
				.mockReturnValueOnce({})
				.mockReturnValueOnce('test-key');
			
			mockKv.get.mockResolvedValue(null);
			
			await node.execute.call(mockExecuteFunctions);
			
			expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(mockNc);
		});
	});
});