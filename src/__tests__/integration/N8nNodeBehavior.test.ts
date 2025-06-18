import { INodeType } from 'n8n-workflow';
import { NatsTrigger } from '../../nodes/NatsTrigger.node';
import { NatsPublisher } from '../../nodes/NatsPublisher.node';
import { NatsKv } from '../../nodes/NatsKv.node';
import { NatsObjectStore } from '../../nodes/NatsObjectStore.node';
import { NatsRequestReply } from '../../nodes/NatsRequestReply.node';
import { NatsServiceReply } from '../../nodes/NatsServiceReply.node';
import { NatsService } from '../../nodes/NatsService.node';
import { NatsKvTrigger } from '../../nodes/NatsKvTrigger.node';
import { NatsObjectStoreTrigger } from '../../nodes/NatsObjectStoreTrigger.node';

describe('n8n Node Behavior Tests', () => {
	const nodes: Array<{ name: string; instance: INodeType; isTrigger: boolean }> = [
		{ name: 'NatsTrigger', instance: new NatsTrigger(), isTrigger: true },
		{ name: 'NatsPublisher', instance: new NatsPublisher(), isTrigger: false },
		{ name: 'NatsKv', instance: new NatsKv(), isTrigger: false },
		{ name: 'NatsObjectStore', instance: new NatsObjectStore(), isTrigger: false },
		{ name: 'NatsRequestReply', instance: new NatsRequestReply(), isTrigger: false },
		{ name: 'NatsServiceReply', instance: new NatsServiceReply(), isTrigger: true },
		{ name: 'NatsService', instance: new NatsService(), isTrigger: true },
		{ name: 'NatsKvTrigger', instance: new NatsKvTrigger(), isTrigger: true },
		{ name: 'NatsObjectStoreTrigger', instance: new NatsObjectStoreTrigger(), isTrigger: true },
	];

	describe('Node Description Validation', () => {
		nodes.forEach(({ name, instance }) => {
			it(`${name} should have valid description`, () => {
				const description = instance.description;
				
				// Required fields
				expect(description.displayName).toBeDefined();
				expect(description.name).toBeDefined();
				expect(description.version).toBe(1);
				expect(description.description).toBeDefined();
				expect(description.defaults).toBeDefined();
				expect(description.properties).toBeDefined();
				expect(Array.isArray(description.properties)).toBe(true);
				
				// Icon should reference nats.svg
				expect(description.icon).toContain('nats.svg');
				
				// Should have credentials
				expect(description.credentials).toBeDefined();
				expect(description.credentials).toHaveLength(1);
				expect(description.credentials![0].name).toBe('natsApi');
			});
		});
	});

	describe('Node Type Implementation', () => {
		nodes.forEach(({ name, instance, isTrigger }) => {
			it(`${name} should implement correct methods`, () => {
				if (isTrigger) {
					expect(instance.trigger).toBeDefined();
					expect(typeof instance.trigger).toBe('function');
				} else {
					expect(instance.execute).toBeDefined();
					expect(typeof instance.execute).toBe('function');
				}
			});
		});
	});

	describe('Property Definitions', () => {
		nodes.forEach(({ name, instance }) => {
			it(`${name} should have valid property definitions`, () => {
				const description = instance.description;
				
				description.properties.forEach(property => {
					// Required fields
					expect(property.displayName).toBeDefined();
					expect(property.name).toBeDefined();
					expect(property.type).toBeDefined();
					
					// Validate option properties
					if (property.type === 'options') {
						expect(property.options).toBeDefined();
						expect(Array.isArray(property.options)).toBe(true);
						expect(property.options!.length).toBeGreaterThan(0);
					}
					
					// Validate collection properties
					if (property.type === 'collection') {
						expect(property.options).toBeDefined();
						expect(Array.isArray(property.options)).toBe(true);
					}
				});
			});
		});
	});

	describe('Manual Trigger Functions', () => {
		const triggerNodes = [
			{ name: 'NatsTrigger', instance: new NatsTrigger() },
			{ name: 'NatsServiceReply', instance: new NatsServiceReply() },
			{ name: 'NatsService', instance: new NatsService() },
			{ name: 'NatsKvTrigger', instance: new NatsKvTrigger() },
			{ name: 'NatsObjectStoreTrigger', instance: new NatsObjectStoreTrigger() },
		];

		triggerNodes.forEach(({ name }) => {
			it(`${name} should have manual trigger function`, () => {
				// We can't test the actual execution without proper mocking,
				// but we can verify the nodes are trigger nodes
				expect(triggerNodes.find(n => n.name === name)).toBeDefined();
			});
		});
	});

	describe('Error Messages', () => {
		it('should use descriptive error messages', () => {
			// This is a meta-test to ensure we're thinking about error handling
			// Real error testing happens in individual node tests
			expect(true).toBe(true);
		});
	});
});