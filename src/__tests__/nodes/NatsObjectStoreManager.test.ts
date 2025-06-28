import { NatsObjectStoreManager } from '../../nodes/NatsObjectStoreManager.node';

describe('NatsObjectStoreManager (Simple)', () => {
	let node: NatsObjectStoreManager;

	beforeEach(() => {
		node = new NatsObjectStoreManager();
	});

	it('should have correct node description', () => {
		expect(node.description.displayName).toBe('NATS Object Store Manager');
		expect(node.description.name).toBe('natsObjectStoreManager');
		expect(node.description.description).toBe('Manage NATS JetStream Object Store buckets');
	});

	it('should have create, delete, and status operations', () => {
		const operations = node.description.properties?.find(p => p.name === 'operation') as any;
		expect(operations?.options).toHaveLength(3);
		expect(operations?.options?.map((op: any) => op.value)).toEqual(['createBucket', 'deleteBucket', 'status']);
	});

	it('should require bucket name parameter', () => {
		const bucketParam = node.description.properties?.find(p => p.name === 'bucket');
		expect(bucketParam?.required).toBe(true);
		expect(bucketParam?.type).toBe('string');
	});

	it('should have options for createBucket operation', () => {
		const optionsParam = node.description.properties?.find(p => p.name === 'options');
		expect(optionsParam?.type).toBe('collection');
		expect(optionsParam?.displayOptions?.show?.operation).toEqual(['createBucket']);
	});
});