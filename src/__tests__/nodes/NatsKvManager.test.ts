import { NatsKvManager } from '../../nodes/NatsKvManager/NatsKvManager.node';
import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import * as NatsConnection from '../../utils/NatsConnection';
import { jetstream, jetstreamManager, Kvm } from '../../bundled/nats-bundled';

// Mock dependencies
jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled', () => ({
	jetstream: jest.fn(),
	jetstreamManager: jest.fn(),
	Kvm: jest.fn(),
}));

describe('NatsKvManager (Simple)', () => {
	let node: NatsKvManager;
	let mockExecuteFunctions: IExecuteFunctions;

	beforeEach(() => {
		node = new NatsKvManager();

		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: { test: 'data' } }]),
			getCredentials: jest
				.fn()
				.mockResolvedValue({ connectionType: 'url', servers: 'nats://localhost:4222' }),
			getNodeParameter: jest.fn(),
			getNode: jest.fn().mockReturnValue({
				id: 'test-node-id',
				name: 'Test Node',
				type: 'n8n-nodes-synadia.natsKvManager',
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
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should have correct node description', () => {
		expect(node.description.displayName).toBe('NATS KV Manager');
		expect(node.description.name).toBe('natsKvManager');
		expect(node.description.description).toBe('Manage NATS JetStream Key-Value Store buckets');
	});

	it('should have create, delete, and status operations', () => {
		const operations = node.description.properties?.find((p) => p.name === 'operation') as any;
		expect(operations?.options).toHaveLength(3);
		expect(operations?.options?.map((op: any) => op.value)).toEqual(['create', 'delete', 'get']);
	});

	it('should require bucket name parameter', () => {
		const bucketParam = node.description.properties?.find((p) => p.name === 'bucket');
		expect(bucketParam?.required).toBe(true);
		expect(bucketParam?.type).toBe('string');
	});

	it('should have config for create operation', () => {
		const configParam = node.description.properties?.find((p) => p.name === 'config');
		expect(configParam?.type).toBe('collection');
		expect(configParam?.displayOptions?.show?.operation).toEqual(['create']);
	});

	it('should validate bucket names during execution', async () => {
		(mockExecuteFunctions.getNodeParameter as jest.Mock)
			.mockReturnValueOnce('create')
			.mockReturnValueOnce('invalid bucket') // Space in name
			.mockReturnValueOnce({});

		await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
			'Bucket name cannot contain spaces',
		);
	});
});
