import { IExecuteFunctions, ITriggerFunctions, INode, INodeType, NodeConnectionType, INodeTypeDescription, INodeExecutionData } from 'n8n-workflow';
import { NatsTrigger } from '../../nodes/NatsTrigger.node';
import { NatsPublisher } from '../../nodes/NatsPublisher.node';
import { NatsKv } from '../../nodes/NatsKv.node';
import { NatsObjectStore } from '../../nodes/NatsObjectStore.node';
import { NatsRequestReply } from '../../nodes/NatsRequestReply.node';
import { NatsServiceReply } from '../../nodes/NatsServiceReply.node';
import { NatsService } from '../../nodes/NatsService.node';
import { NatsKvTrigger } from '../../nodes/NatsKvTrigger.node';
import { NatsObjectStoreTrigger } from '../../nodes/NatsObjectStoreTrigger.node';

// Mock dependencies
jest.mock('../../bundled/nats-bundled');
jest.mock('../../utils/NatsConnection');

describe('n8n Node Behavior Integration Tests', () => {
	// Test all nodes implement INodeType correctly
	describe('INodeType Implementation', () => {
		const nodes: Array<{ name: string; instance: INodeType }> = [
			{ name: 'NatsTrigger', instance: new NatsTrigger() },
			{ name: 'NatsPublisher', instance: new NatsPublisher() },
			{ name: 'NatsKv', instance: new NatsKv() },
			{ name: 'NatsObjectStore', instance: new NatsObjectStore() },
			{ name: 'NatsRequestReply', instance: new NatsRequestReply() },
			{ name: 'NatsServiceReply', instance: new NatsServiceReply() },
			{ name: 'NatsService', instance: new NatsService() },
			{ name: 'NatsKvTrigger', instance: new NatsKvTrigger() },
			{ name: 'NatsObjectStoreTrigger', instance: new NatsObjectStoreTrigger() },
		];

		nodes.forEach(({ name, instance }) => {
			describe(`${name}`, () => {
				it('should have valid description property', () => {
					const description = instance.description;
					
					// Basic properties
					expect(description.displayName).toBeDefined();
					expect(description.name).toBeDefined();
					expect(description.icon).toBe('file:nats.svg');
					expect(description.group).toEqual(['trigger', 'output']);
					expect(description.version).toBe(1);
					expect(description.description).toBeDefined();
					expect(description.defaults).toHaveProperty('name');
					
					// Should use NodeConnectionType enum, not strings
					if ('inputs' in description) {
						expect(description.inputs).toEqual(NodeConnectionType.Main);
					}
					if ('outputs' in description) {
						expect(description.outputs).toEqual(NodeConnectionType.Main);
					}
					
					// Credentials
					expect(description.credentials).toEqual([
						{
							name: 'natsApi',
							required: true,
						},
					]);
					
					// Properties
					expect(description.properties).toBeDefined();
					expect(Array.isArray(description.properties)).toBe(true);
					expect(description.properties.length).toBeGreaterThan(0);
				});

				it('should have required methods', () => {
					if (name.includes('Trigger')) {
						expect(instance.trigger).toBeDefined();
						expect(typeof instance.trigger).toBe('function');
					} else {
						expect(instance.execute).toBeDefined();
						expect(typeof instance.execute).toBe('function');
					}
				});

				it('should have proper property definitions', () => {
					const description = instance.description;
					
					description.properties.forEach(property => {
						// Each property should have required fields
						expect(property.displayName).toBeDefined();
						expect(property.name).toBeDefined();
						expect(property.type).toBeDefined();
						
						// Options properties should have proper structure
						if (property.type === 'options') {
							expect(property.options).toBeDefined();
							expect(Array.isArray(property.options)).toBe(true);
							
							property.options?.forEach(option => {
								expect(option.name).toBeDefined();
								if ('value' in option) {
									expect(option.value).toBeDefined();
								}
							});
						}
						
						// Collection properties should have proper structure
						if (property.type === 'collection') {
							expect(property.options).toBeDefined();
							expect(Array.isArray(property.options)).toBe(true);
						}
						
						// Conditional display rules should be valid
						if (property.displayOptions) {
							expect(property.displayOptions).toHaveProperty('show');
							// or hide, but at least one
						}
					});
				});
			});
		});
	});

	// Test trigger nodes have proper manual trigger functions
	describe('Manual Trigger Functions', () => {
		const triggerNodes = [
			{ name: 'NatsTrigger', instance: new NatsTrigger() },
			{ name: 'NatsServiceReply', instance: new NatsServiceReply() },
			{ name: 'NatsService', instance: new NatsService() },
			{ name: 'NatsKvTrigger', instance: new NatsKvTrigger() },
			{ name: 'NatsObjectStoreTrigger', instance: new NatsObjectStoreTrigger() },
		];

		triggerNodes.forEach(({ name, instance }) => {
			it(`${name} should provide sample data in manual mode`, async () => {
				const mockTriggerFunctions: ITriggerFunctions = {
					emit: jest.fn(),
					getNode: jest.fn(() => ({
						id: 'test-id',
						name: 'Test Node',
						type: 'test-type',
						typeVersion: 1,
						position: [0, 0],
						parameters: {},
					})),
					getNodeParameter: jest.fn((param) => {
						// Return minimal required params
						const params: Record<string, any> = {
							subject: 'test.subject',
							bucket: 'test-bucket',
							responseData: '{"test": "data"}',
						};
						return params[param] || '';
					}),
					getCredentials: jest.fn(),
					helpers: {
						returnJsonArray: jest.fn((data) => data.map((item: any) => ({ json: item }))),
					} as any,
					logger: {
						error: jest.fn(),
						warn: jest.fn(),
						info: jest.fn(),
						debug: jest.fn(),
					} as any,
				} as unknown as ITriggerFunctions;

				// Mock connection to prevent actual connection attempts
				const mockConnection = {
					close: jest.fn(),
					subscribe: jest.fn().mockReturnValue({
						unsubscribe: jest.fn(),
						[Symbol.asyncIterator]: jest.fn().mockReturnValue({
							next: jest.fn().mockResolvedValue({ done: true }),
						}),
					}),
				};

				jest.spyOn(require('../../utils/NatsConnection'), 'createNatsConnection')
					.mockResolvedValue(mockConnection);

				const result = await instance.trigger.call(mockTriggerFunctions);
				
				expect(result).toBeDefined();
				expect(result).toHaveProperty('manualTriggerFunction');
				
				if (result.manualTriggerFunction) {
					const sampleData = await result.manualTriggerFunction() as INodeExecutionData[] | undefined;
					
					if (sampleData !== undefined && sampleData !== null && Array.isArray(sampleData)) {
						expect(sampleData).toBeDefined();
						expect(sampleData.length).toBeGreaterThan(0);
						expect(sampleData[0]).toHaveProperty('json');
						
						// Verify sample data structure matches expected format
						const jsonData = sampleData[0].json;
						expect(jsonData).toBeDefined();
						
						// Check for common fields based on node type
						if (name === 'NatsTrigger' || name === 'NatsServiceReply') {
							expect(jsonData).toHaveProperty('subject');
							expect(jsonData).toHaveProperty('data');
							expect(jsonData).toHaveProperty('timestamp');
						} else if (name === 'NatsKvTrigger') {
							expect(jsonData).toHaveProperty('bucket');
							expect(jsonData).toHaveProperty('key');
							expect(jsonData).toHaveProperty('value');
						} else if (name === 'NatsObjectStoreTrigger') {
							expect(jsonData).toHaveProperty('bucket');
							expect(jsonData).toHaveProperty('object');
							expect(jsonData).toHaveProperty('operation');
						}
					}
				}
			});
		});
	});

	// Test error handling follows n8n patterns
	describe('Error Handling', () => {
		it('should use proper n8n error classes', async () => {
			const publisher = new NatsPublisher();
			const mockExecuteFunctions: IExecuteFunctions = {
				getNode: jest.fn(() => ({
					id: 'test-id',
					name: 'Test Node',
					type: 'test-type',
					typeVersion: 1,
					position: [0, 0],
					parameters: {},
				})),
				getNodeParameter: jest.fn((param) => {
					if (param === 'subject') return ''; // Invalid empty subject
					return '';
				}),
				getCredentials: jest.fn(),
				getInputData: jest.fn().mockReturnValue([]),
				helpers: {} as any,
				logger: {} as any,
			} as unknown as IExecuteFunctions;

			// Should throw ApplicationError for validation
			await expect(publisher.execute.call(mockExecuteFunctions))
				.rejects.toThrow('Subject cannot be empty');
		});
	});

	// Test credential usage
	describe('Credential Handling', () => {
		it('should properly request and use credentials', async () => {
			const trigger = new NatsTrigger();
			const mockTriggerFunctions: ITriggerFunctions = {
				emit: jest.fn(),
				getNode: jest.fn(() => ({
					id: 'test-id',
					name: 'Test Node',
					type: 'test-type',
					typeVersion: 1,
					position: [0, 0],
					parameters: {},
				})),
				getNodeParameter: jest.fn(() => 'test.subject'),
				getCredentials: jest.fn().mockResolvedValue({
					serverUrls: 'nats://localhost:4222',
					authType: 'token',
					token: 'test-token',
				}),
				helpers: {} as any,
				logger: {} as any,
			} as unknown as ITriggerFunctions;

			const createNatsConnection = jest.spyOn(
				require('../../utils/NatsConnection'), 
				'createNatsConnection'
			).mockResolvedValue({
				close: jest.fn(),
				subscribe: jest.fn().mockReturnValue({
					unsubscribe: jest.fn(),
					[Symbol.asyncIterator]: jest.fn().mockReturnValue({
						next: jest.fn().mockResolvedValue({ done: true }),
					}),
				}),
			});

			await trigger.trigger.call(mockTriggerFunctions);

			// Should request credentials
			expect(mockTriggerFunctions.getCredentials).toHaveBeenCalledWith('natsApi');
			
			// Should pass credentials to connection
			expect(createNatsConnection).toHaveBeenCalledWith(
				expect.objectContaining({
					serverUrls: 'nats://localhost:4222',
					authType: 'token',
					token: 'test-token',
				})
			);
		});
	});

	// Test node parameters validation
	describe('Parameter Validation', () => {
		const testCases = [
			{
				node: new NatsPublisher(),
				invalidParams: { subject: 'invalid subject' }, // Contains space
				expectedError: 'Subject cannot contain spaces',
			},
			{
				node: new NatsKv(),
				invalidParams: { operation: 'put', bucket: '', key: 'test' },
				expectedError: 'Bucket name cannot be empty',
			},
		];

		testCases.forEach(({ node, invalidParams, expectedError }) => {
			it(`${node.description.name} should validate parameters`, async () => {
				const mockExecuteFunctions: IExecuteFunctions = {
					getNode: jest.fn(() => ({
						id: 'test-id',
						name: 'Test Node',
						type: 'test-type',
						typeVersion: 1,
						position: [0, 0],
						parameters: {},
					})),
					getNodeParameter: jest.fn((param) => invalidParams[param as keyof typeof invalidParams]),
					getCredentials: jest.fn().mockResolvedValue({
						serverUrls: 'nats://localhost:4222',
					}),
					getInputData: jest.fn().mockReturnValue([{ json: {} }]),
					helpers: {
						returnJsonArray: jest.fn((data) => data.map((item: any) => ({ json: item }))),
					} as any,
					logger: {} as any,
				} as unknown as IExecuteFunctions;

				await expect(node.execute!.call(mockExecuteFunctions))
					.rejects.toThrow(expectedError);
			});
		});
	});

	// Test data transformation follows n8n patterns
	describe('Data Transformation', () => {
		it('should use returnJsonArray helper correctly', async () => {
			const kvNode = new NatsKv();
			const mockExecuteFunctions: IExecuteFunctions = {
				getNode: jest.fn(),
				getNodeParameter: jest.fn((param) => {
					const params: Record<string, any> = {
						operation: 'get',
						bucket: 'test-bucket',
						key: 'test-key',
					};
					return params[param];
				}),
				getCredentials: jest.fn().mockResolvedValue({
					serverUrls: 'nats://localhost:4222',
				}),
				getInputData: jest.fn().mockReturnValue([{ json: {} }]),
				helpers: {
					returnJsonArray: jest.fn((data) => data.map((item: any) => ({ json: item }))),
				} as any,
				logger: {} as any,
			} as unknown as IExecuteFunctions;

			// Mock KV store
			const mockKvStore = {
				get: jest.fn().mockResolvedValue({
					value: new TextEncoder().encode('test-value'),
					revision: 1,
				}),
			};

			jest.spyOn(require('../../bundled/nats-bundled'), 'kv')
				.mockResolvedValue(mockKvStore);
			jest.spyOn(require('../../utils/NatsConnection'), 'createNatsConnection')
				.mockResolvedValue({});

			const result = await kvNode.execute.call(mockExecuteFunctions);

			// Should use returnJsonArray helper
			expect(mockExecuteFunctions.helpers.returnJsonArray).toHaveBeenCalledWith([
				expect.objectContaining({
					bucket: 'test-bucket',
					key: 'test-key',
					value: 'test-value',
					revision: 1,
				}),
			]);

			// Result should be properly formatted
			expect(result).toEqual([[{
				json: expect.objectContaining({
					bucket: 'test-bucket',
					key: 'test-key',
					value: 'test-value',
					revision: 1,
				}),
			}]]);
		});
	});

	// Test connection lifecycle
	describe('Connection Lifecycle', () => {
		it('should properly close connections on trigger shutdown', async () => {
			const trigger = new NatsTrigger();
			const mockConnection = {
				close: jest.fn(),
				subscribe: jest.fn().mockReturnValue({
					unsubscribe: jest.fn(),
					[Symbol.asyncIterator]: jest.fn().mockReturnValue({
						next: jest.fn().mockResolvedValue({ done: true }),
					}),
				}),
			};

			jest.spyOn(require('../../utils/NatsConnection'), 'createNatsConnection')
				.mockResolvedValue(mockConnection);
			jest.spyOn(require('../../utils/NatsConnection'), 'closeNatsConnection')
				.mockResolvedValue(undefined);

			const mockTriggerFunctions: ITriggerFunctions = {
				emit: jest.fn(),
				getNode: jest.fn(() => ({
					id: 'test-id',
					name: 'Test Node',
					type: 'test-type',
					typeVersion: 1,
					position: [0, 0],
					parameters: {},
				})),
				getNodeParameter: jest.fn(() => 'test.subject'),
				getCredentials: jest.fn().mockResolvedValue({
					serverUrls: 'nats://localhost:4222',
				}),
				helpers: {} as any,
				logger: {} as any,
			} as unknown as ITriggerFunctions;

			const result = await trigger.trigger.call(mockTriggerFunctions);
			
			expect(result).toHaveProperty('closeFunction');
			
			// Call close function if it exists
			if (result.closeFunction) {
				await result.closeFunction();
			}
			
			// Should close connection
			expect(require('../../utils/NatsConnection').closeNatsConnection)
				.toHaveBeenCalledWith(mockConnection);
		});

		it('should reuse connections in execute nodes', async () => {
			const publisher = new NatsPublisher();
			const createConnectionSpy = jest.spyOn(
				require('../../utils/NatsConnection'), 
				'createNatsConnection'
			).mockResolvedValue({
				publish: jest.fn(),
			});

			const mockExecuteFunctions: IExecuteFunctions = {
				getNode: jest.fn(),
				getNodeParameter: jest.fn((param) => {
					const params: Record<string, any> = {
						subject: 'test.subject',
						message: 'test message',
						publishType: 'core',
					};
					return params[param];
				}),
				getCredentials: jest.fn().mockResolvedValue({
					serverUrls: 'nats://localhost:4222',
				}),
				getInputData: jest.fn().mockReturnValue([
					{ json: { id: 1 } },
					{ json: { id: 2 } },
					{ json: { id: 3 } },
				]),
				helpers: {
					returnJsonArray: jest.fn((data) => data),
				} as any,
				logger: {} as any,
			} as unknown as IExecuteFunctions;

			await publisher.execute.call(mockExecuteFunctions);

			// Should create connection only once for multiple items
			expect(createConnectionSpy).toHaveBeenCalledTimes(1);
			
			// Should close connection after processing all items
			expect(require('../../utils/NatsConnection').closeNatsConnection)
				.toHaveBeenCalled();
		});
	});
});