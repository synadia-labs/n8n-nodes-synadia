import { NatsObjectStore } from '../NatsObjectStore.node';
import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import * as NatsConnection from '../../../utils/NatsConnection';
import { Objm } from '../../../bundled/nats-bundled';

// Mock dependencies
jest.mock('../../../utils/NatsConnection');
jest.mock('../../../bundled/nats-bundled', () => ({
	Objm: jest.fn(),
	jetstream: jest.fn(),
}));

describe('NatsObjectStore (Combined)', () => {
	let node: NatsObjectStore;
	let mockExecuteFunctions: IExecuteFunctions;
	let mockOsm: any;
	let mockOs: any;

	beforeEach(() => {
		node = new NatsObjectStore();

		mockOs = {
			get: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
			info: jest.fn(),
			list: jest.fn(),
			status: jest.fn(),
			getBlob: jest.fn(),
			putBlob: jest.fn(),
		};

		mockOsm = {
			create: jest.fn().mockResolvedValue(mockOs),
			delete: jest.fn(),
			status: jest.fn(),
			open: jest.fn().mockResolvedValue(mockOs),
		};

		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: { test: 'data' } }]),
			getCredentials: jest
				.fn()
				.mockResolvedValue({ connectionType: 'url', servers: 'nats://localhost:4222' }),
			getNodeParameter: jest.fn(),
			getNode: jest.fn().mockReturnValue({
				id: 'test-node-id',
				name: 'Test Node',
				type: 'n8n-nodes-synadia.natsObjectStore',
			}),
			continueOnFail: jest.fn().mockReturnValue(false),
			logger: {
				error: jest.fn(),
				warn: jest.fn(),
				info: jest.fn(),
				debug: jest.fn(),
			},
		} as unknown as IExecuteFunctions;

		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue({});
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
		(Objm as jest.Mock).mockReturnValue(mockOsm);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Node Description', () => {
		it('should have correct node description', () => {
			expect(node.description.displayName).toBe('NATS Object Store');
			expect(node.description.name).toBe('natsObjectStore');
			expect(node.description.description).toBe('Store and retrieve objects (files, data) in NATS JetStream Object Store - manage buckets and objects');
		});

		it('should have resource selection with bucket and object options', () => {
			const resourceParam = node.description.properties?.find((p) => p.name === 'resource') as any;
			expect(resourceParam?.options).toHaveLength(2);
			expect(resourceParam?.options?.map((op: any) => op.value)).toEqual(['bucket', 'object']);
		});

		it('should have bucket operations when resource is bucket', () => {
			const operationParam = node.description.properties?.find(
				(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('bucket')
			) as any;
			expect(operationParam?.options?.map((op: any) => op.value)).toEqual(['create', 'delete', 'get']);
		});

		it('should have object operations when resource is object', () => {
			const operationParam = node.description.properties?.find(
				(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('object')
			) as any;
			expect(operationParam?.options?.map((op: any) => op.value)).toEqual(['get', 'put', 'delete', 'info', 'list']);
		});
	});

	describe('Bucket Operations', () => {
		it('should handle bucket create operation', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('bucket') // resource
				.mockReturnValueOnce('create') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}); // config

			const bucketResult = { bucket: 'test-bucket', status: 'created' };
			mockOsm.create.mockResolvedValue(mockOs);
			mockOs.status.mockResolvedValue(bucketResult);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockOsm.create).toHaveBeenCalled();
			expect(result[0]).toHaveLength(1);
		});

		// Bucket name validation is now handled by NATS library itself
		// We only validate that the bucket name is not empty

		it('should handle unknown bucket operations gracefully', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('bucket') // resource
				.mockReturnValueOnce('unknown') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}); // config

			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0]).toHaveLength(1);
			expect(result[0][0]).toHaveProperty('error');
		});
	});

	describe('Object Operations', () => {
		it('should handle object get operation', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('object') // resource
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('test-object') // name
				.mockReturnValueOnce(''); // data

			mockOs.getBlob.mockResolvedValue({ name: 'test-object', data: 'test-data' });

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockOsm.open).toHaveBeenCalledWith('test-bucket');
			expect(mockOs.getBlob).toHaveBeenCalled();
			expect(result[0]).toHaveLength(1);
		});

		it('should handle object put operation', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('object') // resource
				.mockReturnValueOnce('put') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('test-object') // name
				.mockReturnValueOnce('test-data'); // data

			const putResult = { success: true };
			mockOs.putBlob.mockResolvedValue(putResult);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockOsm.open).toHaveBeenCalledWith('test-bucket');
			expect(result[0]).toHaveLength(1);
		});

		it('should handle unknown object operations gracefully', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('object') // resource
				.mockReturnValueOnce('unknown') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('test-object') // name
				.mockReturnValueOnce(''); // data

			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0]).toHaveLength(1);
			expect(result[0][0]).toHaveProperty('error');
		});
	});

	describe('Error Handling', () => {
		it('should handle unknown resource types', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('unknown') // resource
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce('test-bucket'); // bucket

			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0]).toHaveLength(1);
			expect(result[0][0]).toHaveProperty('error');
		});

		it('should close NATS connection on cleanup', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('object') // resource
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('test-object') // name
				.mockReturnValueOnce(''); // data

			mockOs.getBlob.mockResolvedValue({ name: 'test-object', data: 'test-data' });

			await node.execute.call(mockExecuteFunctions);

			expect(NatsConnection.closeNatsConnection).toHaveBeenCalled();
		});
	});
});