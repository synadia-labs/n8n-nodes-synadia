import { NatsConsumerManager } from '../../nodes/NatsConsumerManager.node';

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
		const operations = node.description.properties?.find(p => p.name === 'operation') as any;
		expect(operations?.options).toHaveLength(4);
		expect(operations?.options?.map((op: any) => op.value)).toEqual([
			'createConsumer', 'deleteConsumer', 'getInfo', 'listConsumers'
		]);
	});

	it('should require stream name parameter', () => {
		const streamParam = node.description.properties?.find(p => p.name === 'streamName');
		expect(streamParam?.required).toBe(true);
		expect(streamParam?.type).toBe('string');
	});

	it('should require consumer name parameter', () => {
		const consumerParam = node.description.properties?.find(p => p.name === 'consumerName');
		expect(consumerParam?.required).toBe(true);
		expect(consumerParam?.type).toBe('string');
	});

	it('should have comprehensive options for consumer configuration', () => {
		const optionsParam = node.description.properties?.find(p => p.name === 'options');
		expect(optionsParam?.type).toBe('collection');
		
		// Check for key options
		const optionNames = (optionsParam as any)?.options?.map((opt: any) => opt.name);
		expect(optionNames).toContain('description');
		expect(optionNames).toContain('deliverPolicy');
		expect(optionNames).toContain('ackPolicy');
		expect(optionNames).toContain('maxDeliver');
	});
});