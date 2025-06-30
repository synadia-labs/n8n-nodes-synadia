import { NatsStreamManager } from '../../nodes/NatsStreamManager.node';

describe('NatsStreamManager (Simple)', () => {
	let node: NatsStreamManager;

	beforeEach(() => {
		node = new NatsStreamManager();
	});

	it('should have correct node description', () => {
		expect(node.description.displayName).toBe('NATS Stream Manager');
		expect(node.description.name).toBe('natsStreamManager');
		expect(node.description.description).toBe('Manage NATS JetStream streams');
	});

	it('should have all stream management operations', () => {
		const operations = node.description.properties?.find(p => p.name === 'operation') as any;
		expect(operations?.options).toHaveLength(6);
		expect(operations?.options?.map((op: any) => op.value)).toEqual([
			'createStream', 'deleteStream', 'getInfo', 'listStreams', 'purgeStream', 'updateStream'
		]);
	});

	it('should require stream name parameter', () => {
		const streamParam = node.description.properties?.find(p => p.name === 'streamName');
		expect(streamParam?.required).toBe(true);
		expect(streamParam?.type).toBe('string');
	});

	it('should have subjects parameter', () => {
		const subjectsParam = node.description.properties?.find(p => p.name === 'subjects');
		expect(subjectsParam?.type).toBe('string');
		expect(subjectsParam?.placeholder).toBe('orders.>, payments.*');
	});

	it('should have comprehensive options for stream configuration', () => {
		const optionsParam = node.description.properties?.find(p => p.name === 'options');
		expect(optionsParam?.type).toBe('collection');
		
		// Check for key options
		const optionNames = (optionsParam as any)?.options?.map((opt: any) => opt.name);
		expect(optionNames).toContain('description');
		expect(optionNames).toContain('retention');
		expect(optionNames).toContain('storage');
		expect(optionNames).toContain('replicas');
	});
});