import { NatsKv } from '../NatsKv.node';
import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import * as NatsConnection from '../../../utils/NatsConnection';
import { Kvm } from '../../../bundled/nats-bundled';

// Mock dependencies
jest.mock('../../../utils/NatsConnection');
jest.mock('../../../bundled/nats-bundled', () => ({
	Kvm: jest.fn(),
}));

describe('NatsKv (Combined)', () => {
	let node: NatsKv;
	let mockExecuteFunctions: IExecuteFunctions;
	let mockKvm: any;
	let mockKv: any;

	beforeEach(() => {
		node = new NatsKv();

		mockKv = {
			get: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
			list: jest.fn(),
			history: jest.fn(),
			status: jest.fn(),
		};

		mockKvm = {
			create: jest.fn().mockResolvedValue(mockKv),
			delete: jest.fn(),
			status: jest.fn(),
			open: jest.fn().mockResolvedValue(mockKv),
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
				type: 'n8n-nodes-synadia.natsKv',
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
		(Kvm as jest.Mock).mockReturnValue(mockKvm);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Node Description', () => {
		it('should have correct node description', () => {
			expect(node.description.displayName).toBe('NATS KV');
			expect(node.description.name).toBe('natsKv');
			expect(node.description.description).toBe('Interact with NATS JetStream Key-Value Store - manage buckets and keys');
		});

		it('should have resource selection with bucket and key options', () => {
			const resourceParam = node.description.properties?.find((p) => p.name === 'resource') as any;
			expect(resourceParam?.options).toHaveLength(2);
			expect(resourceParam?.options?.map((op: any) => op.value)).toEqual(['bucket', 'key']);
		});

		it('should have bucket operations when resource is bucket', () => {
			const operationParam = node.description.properties?.find(
				(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('bucket')
			) as any;
			expect(operationParam?.options?.map((op: any) => op.value)).toEqual(['create', 'delete', 'get']);
		});

		it('should have key operations when resource is key', () => {
			const operationParam = node.description.properties?.find(
				(p) => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('key')
			) as any;
			expect(operationParam?.options?.map((op: any) => op.value)).toEqual(['get', 'put', 'delete', 'list', 'history']);
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
			mockKvm.create.mockResolvedValue(mockKv);
			mockKv.status.mockResolvedValue(bucketResult);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockKvm.create).toHaveBeenCalled();
			expect(result[0]).toHaveLength(1);
		});

		it('should validate bucket names for bucket operations', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('bucket') // resource
				.mockReturnValueOnce('create') // operation
				.mockReturnValueOnce('invalid bucket') // bucket with space
				.mockReturnValueOnce({}); // config

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Bucket name cannot contain spaces'
			);
		});

		it('should handle unknown bucket operations gracefully', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('bucket') // resource
				.mockReturnValueOnce('unknown') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce({}); // config

			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0]).toHaveLength(1);
			expect(result[0][0].error).toBeDefined();
		});
	});

	describe('Key Operations', () => {
		it('should handle key get operation', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('key') // resource
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('test-key') // key
				.mockReturnValueOnce(''); // value

			mockKv.get.mockResolvedValue({ key: 'test-key', value: 'test-value' });

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockKvm.open).toHaveBeenCalledWith('test-bucket');
			expect(mockKv.get).toHaveBeenCalled();
			expect(result[0]).toHaveLength(1);
		});

		it('should handle key put operation', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('key') // resource
				.mockReturnValueOnce('put') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('test-key') // key
				.mockReturnValueOnce('test-value'); // value

			const putResult = { success: true };
			mockKv.put.mockResolvedValue(putResult);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockKvm.open).toHaveBeenCalledWith('test-bucket');
			expect(result[0]).toHaveLength(1);
		});

		it('should handle unknown key operations gracefully', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('key') // resource
				.mockReturnValueOnce('unknown') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('test-key') // key
				.mockReturnValueOnce(''); // value

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
				.mockReturnValueOnce('key') // resource
				.mockReturnValueOnce('get') // operation
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('test-key') // key
				.mockReturnValueOnce(''); // value

			mockKv.get.mockResolvedValue({ key: 'test-key', value: 'test-value' });

			await node.execute.call(mockExecuteFunctions);

			expect(NatsConnection.closeNatsConnection).toHaveBeenCalled();
		});
	});
});