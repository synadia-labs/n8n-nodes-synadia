import { NatsConsumerManager } from '../../nodes/NATSConsumerManager/NatsConsumerManager.node';

describe('NatsConsumerManager (Simple)', () => {
	let node: NatsConsumerManager;

	beforeEach(() => {
		node = new NatsConsumerManager();
	});

	it('should have correct node description', () => {
		expect(node.description.displayName).toBe('NATS Consumer Manager');
		expect(node.description.name).toBe('natsConsumerManager');
		expect(node.description.description).toBe('Manage NATS JetStream consumers');
	});

	it('should have all consumer management operations', () => {
		const operations = node.description.properties?.find((p) => p.name === 'operation') as any;
		expect(operations?.options).toHaveLength(4);
		expect(operations?.options?.map((op: any) => op.value)).toEqual([
			'create',
			'delete',
			'get',
			'list',
		]);
	});

	it('should require stream name parameter', () => {
		const streamParam = node.description.properties?.find((p) => p.name === 'streamName');
		expect(streamParam?.required).toBe(true);
		expect(streamParam?.type).toBe('string');
	});

	it('should require consumer name parameter', () => {
		const consumerParam = node.description.properties?.find((p) => p.name === 'consumerName');
		expect(consumerParam?.type).toBe('string');
	});

	it('should have comprehensive consumerConfig for consumer configuration', () => {
		const configParam = node.description.properties?.find((p) => p.name === 'consumerConfig');
		expect(configParam?.type).toBe('collection');

		// Check for key config options
		const configNames = (configParam as any)?.options?.map((opt: any) => opt.name);
		expect(configNames).toContain('description');
		expect(configNames).toContain('deliver_policy');
		expect(configNames).toContain('ack_policy');
		expect(configNames).toContain('max_deliver');
	});
});
