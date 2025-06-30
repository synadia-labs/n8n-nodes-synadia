import { NatsStreamManager } from '../../nodes/NatsStreamManager/NatsStreamManager.node';

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
		const operations = node.description.properties?.find((p) => p.name === 'operation') as any;
		expect(operations?.options).toHaveLength(6);
		expect(operations?.options?.map((op: any) => op.value)).toEqual([
			'create',
			'delete',
			'get',
			'list',
			'purge',
			'update',
		]);
	});

	it('should require stream name parameter', () => {
		const streamParam = node.description.properties?.find((p) => p.name === 'streamName');
		expect(streamParam?.required).toBe(true);
		expect(streamParam?.type).toBe('string');
	});

	it('should have subjects parameter in streamConfig', () => {
		const streamConfigParam = node.description.properties?.find((p) => p.name === 'streamConfig');
		expect(streamConfigParam?.type).toBe('collection');
		const subjectsOption = (streamConfigParam as any)?.options?.find(
			(opt: any) => opt.name === 'subjects',
		);
		expect(subjectsOption?.type).toBe('string');
	});

	it('should have comprehensive streamConfig for stream configuration', () => {
		const streamConfigParam = node.description.properties?.find((p) => p.name === 'streamConfig');
		expect(streamConfigParam?.type).toBe('collection');

		// Check for key config options
		const configNames = (streamConfigParam as any)?.options?.map((opt: any) => opt.name);
		expect(configNames).toContain('description');
		expect(configNames).toContain('retention');
		expect(configNames).toContain('storage');
		expect(configNames).toContain('num_replicas');
	});
});
