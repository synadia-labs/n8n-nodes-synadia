import { NatsObjectStoreWatcher } from '../NatsObjectStoreWatcher.node';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { ITriggerFunctions } from 'n8n-workflow';
import { jetstream, consumerOpts, jetstreamManager } from '../../bundled/nats-bundled';

jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled');

describe('NatsObjectStoreWatcher', () => {
	let node: NatsObjectStoreWatcher;
	let mockTriggerFunctions: ITriggerFunctions;
	let mockNc: any;
	let mockJs: any;
	let mockJsm: any;
	let mockSubscription: any;
	let mockConsumerOpts: any;
	let mockEmit: jest.Mock;
	let mockGetNodeParameter: jest.Mock;
	let mockMessageIterator: any;
	let mockConsumer: any;

	beforeEach(() => {
		node = new NatsObjectStoreWatcher();
		
		// Setup mocks
		mockSubscription = {
			unsubscribe: jest.fn().mockResolvedValue(undefined),
			[Symbol.asyncIterator]: jest.fn(),
		};
		
		mockConsumerOpts = {
			deliverNew: jest.fn().mockReturnThis(),
			deliverAll: jest.fn().mockReturnThis(),
			deliverLastPerSubject: jest.fn().mockReturnThis(),
		};
		
		// Initialize mockMessageIterator before using it
		mockMessageIterator = {
			[Symbol.asyncIterator]: () => ({
				next: jest.fn().mockResolvedValue({ done: true }),
			}),
		};
		
		mockConsumer = {
			consume: jest.fn(() => {
				return Promise.resolve(mockMessageIterator);
			}),
			delete: jest.fn().mockResolvedValue(undefined),
		};
		
		mockJsm = {
			consumers: {
				add: jest.fn().mockResolvedValue({
					stream_name: 'OBJ_test-bucket',
					name: 'test-consumer',
				}),
			},
		};
		
		mockJs = {
			subscribe: jest.fn().mockResolvedValue(mockSubscription),
			consumers: {
				get: jest.fn().mockResolvedValue(mockConsumer),
			},
		};
		
		mockNc = {};
		
		mockEmit = jest.fn();
		mockGetNodeParameter = jest.fn();
		
		(jetstreamManager as jest.Mock).mockImplementation(() => Promise.resolve(mockJsm));
		
		mockTriggerFunctions = {
			getNodeParameter: mockGetNodeParameter,
			getCredentials: jest.fn().mockResolvedValue({
				servers: 'nats://localhost:4222',
			}),
			emit: mockEmit,
			helpers: {
				returnJsonArray: jest.fn((data) => data.map((item: any) => ({ json: item }))),
			},
			getMode: jest.fn().mockReturnValue('trigger'),
			getNode: jest.fn().mockReturnValue({}),
			logger: {
				error: jest.fn(),
			},
		} as any;
		
		(createNatsConnection as jest.Mock).mockResolvedValue(mockNc);
		(closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
		(jetstream as jest.Mock).mockReturnValue(mockJs);
		(consumerOpts as jest.Mock).mockReturnValue(mockConsumerOpts);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('trigger', () => {
		it('should watch object store changes', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return {};
					default: return '';
				}
			});
			
			// Mock the message with object store metadata format
			const mockMsg = {
				subject: '$O.test-bucket.M.test.txt',
				data: new TextEncoder().encode(''),
				headers: {
					get: jest.fn((key) => {
						if (key === 'X-Nats-Operation') return 'PUT';
						if (key === 'X-Nats-Object-Size') return '100';
						if (key === 'X-Nats-Object-Chunks') return '1';
						if (key === 'X-Nats-Object-Digest') return 'SHA-256=abc123';
						if (key === 'X-Nats-Object-Mtime') return '2023-10-01T12:00:00.000Z';
						return undefined;
					}),
				},
				ack: jest.fn(),
			};
			
			// Setup message iterator
			mockMessageIterator = {
				[Symbol.asyncIterator]: () => ({
					next: jest.fn()
						.mockResolvedValueOnce({ done: false, value: mockMsg })
						.mockResolvedValue({ done: true }),
				}),
			};
			
			// Start the trigger
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			
			// Let the async operations run
			await new Promise(resolve => setTimeout(resolve, 200));
			
			// Verify connections and setup
			expect(createNatsConnection).toHaveBeenCalled();
			expect(jetstream).toHaveBeenCalledWith(mockNc);
			expect(jetstreamManager).toHaveBeenCalledWith(mockNc);
			
			// Access the consumers.add mock directly
			expect(mockJsm.consumers.add).toHaveBeenCalledWith('OBJ_test-bucket', expect.objectContaining({
				filter_subject: '$O.test-bucket.M.>',
				ack_policy: 'explicit',
				deliver_policy: 'last_per_subject',
			}));
			
			// Verify emitted data
			expect(mockEmit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'test-bucket',
						operation: 'put',
						object: expect.objectContaining({
							name: 'test.txt',
							size: 100,
							chunks: 1,
							digest: 'SHA-256=abc123',
							mtime: '2023-10-01T12:00:00.000Z',
							deleted: false,
						}),
						timestamp: expect.any(String),
					}),
				}),
			])]);
			
			// Call close function
			const triggerResponse = await triggerPromise;
			if (triggerResponse && typeof triggerResponse === 'object' && 'closeFunction' in triggerResponse) {
				await (triggerResponse as any).closeFunction();
			}
			
			expect(mockConsumer.delete).toHaveBeenCalled();
			expect(closeNatsConnection).toHaveBeenCalledWith(mockNc);
		});

		it('should handle updates only option', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return { updatesOnly: true };
					default: return '';
				}
			});
			
			// Setup empty iterator (no messages)
			mockMessageIterator = {
				[Symbol.asyncIterator]: () => ({
					next: jest.fn().mockResolvedValue({ done: true }),
				}),
			};
			
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));
			
			expect(jetstreamManager).toHaveBeenCalledWith(mockNc);
			
			// Verify consumer was created with correct options
			expect(mockJsm.consumers.add).toHaveBeenCalledWith('OBJ_test-bucket', expect.objectContaining({
				filter_subject: '$O.test-bucket.M.>',
				ack_policy: 'explicit',
				deliver_policy: 'new',
			}));
			
			const triggerResponse = await triggerPromise;
			if (triggerResponse && typeof triggerResponse === 'object' && 'closeFunction' in triggerResponse) {
				await (triggerResponse as any).closeFunction();
			}
		});

		it('should handle subscription errors', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return {};
					default: return '';
				}
			});
			
			// Make message iterator throw an error
			mockMessageIterator = {
				[Symbol.asyncIterator]: () => ({
					next: jest.fn().mockRejectedValue(new Error('Subscription error')),
				}),
			};
			
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));
			
			expect(mockTriggerFunctions.logger.error).toHaveBeenCalledWith('Object store watcher error:', expect.objectContaining({ error: expect.any(Error) }));
			
			const triggerResponse = await triggerPromise;
			if (triggerResponse && typeof triggerResponse === 'object' && 'closeFunction' in triggerResponse) {
				await (triggerResponse as any).closeFunction();
			}
		});

		it('should handle connection errors', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return {};
					default: return '';
				}
			});
			
			(createNatsConnection as jest.Mock).mockRejectedValue(new Error('Connection failed'));
			
			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow('Failed to start object store watcher: Connection failed');
		});

		it('should filter messages by name pattern', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return { nameFilter: '*.jpg' };
					default: return '';
				}
			});
			
			// Create messages for different file types
			const jpgMsg = {
				subject: '$O.test-bucket.M.image.jpg',
				data: new TextEncoder().encode(''),
				headers: {
					get: jest.fn((key) => {
						if (key === 'X-Nats-Operation') return 'PUT';
						if (key === 'X-Nats-Object-Size') return '1024';
						return undefined;
					}),
				},
				ack: jest.fn(),
			};
			
			const txtMsg = {
				subject: '$O.test-bucket.M.document.txt',
				data: new TextEncoder().encode(''),
				headers: {
					get: jest.fn((key) => {
						if (key === 'X-Nats-Operation') return 'PUT';
						if (key === 'X-Nats-Object-Size') return '512';
						return undefined;
					}),
				},
				ack: jest.fn(),
			};
			
			// Setup message iterator with both messages
			mockMessageIterator = {
				[Symbol.asyncIterator]: () => ({
					next: jest.fn()
						.mockResolvedValueOnce({ done: false, value: jpgMsg })
						.mockResolvedValueOnce({ done: false, value: txtMsg })
						.mockResolvedValue({ done: true }),
				}),
			};
			
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Should only emit the .jpg file
			expect(mockEmit).toHaveBeenCalledTimes(1);
			expect(mockEmit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'test-bucket',
						operation: 'put',
						object: expect.objectContaining({
							name: 'image.jpg',
							size: 1024,
						}),
					}),
				}),
			])]);
			
			// Verify both messages were acknowledged
			expect(jpgMsg.ack).toHaveBeenCalled();
			expect(txtMsg.ack).toHaveBeenCalled();
			
			const triggerResponse = await triggerPromise;
			if (triggerResponse && typeof triggerResponse === 'object' && 'closeFunction' in triggerResponse) {
				await (triggerResponse as any).closeFunction();
			}
		});

		it('should handle delete operations', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return { includeDeletes: true };
					default: return '';
				}
			});
			
			// Mock delete message
			const mockDeleteMsg = {
				subject: '$O.test-bucket.M.deleted.txt',
				data: new TextEncoder().encode(''),
				headers: {
					get: jest.fn((key) => {
						if (key === 'X-Nats-Operation') return 'DELETE';
						if (key === 'X-Nats-Object-Size') return '0';
						if (key === 'X-Nats-Object-Chunks') return '0';
						if (key === 'X-Nats-Object-Digest') return '';
						if (key === 'X-Nats-Object-Mtime') return '2023-10-01T12:00:00.000Z';
						return undefined;
					}),
				},
				ack: jest.fn(),
			};
			
			// Setup message iterator with delete message
			mockMessageIterator = {
				[Symbol.asyncIterator]: () => ({
					next: jest.fn()
						.mockResolvedValueOnce({ done: false, value: mockDeleteMsg })
						.mockResolvedValue({ done: true }),
				}),
			};
			
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));
			
			expect(mockEmit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'test-bucket',
						operation: 'delete',
						object: expect.objectContaining({
							name: 'deleted.txt',
							size: 0,
							chunks: 0,
							digest: '',
							mtime: '2023-10-01T12:00:00.000Z',
							deleted: true,
						}),
						timestamp: expect.any(String),
					}),
				}),
			])]);
			
			const triggerResponse = await triggerPromise;
			if (triggerResponse && typeof triggerResponse === 'object' && 'closeFunction' in triggerResponse) {
				await (triggerResponse as any).closeFunction();
			}
		});
	});

	describe('manualTriggerFunction', () => {
		it('should return sample data in manual mode', async () => {
			const manualMockTriggerFunctions = {
				...mockTriggerFunctions,
				getMode: jest.fn().mockReturnValue('manual'),
				emit: jest.fn(),
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'bucket') return 'test-bucket';
					return {};
				}),
			};

			const triggerResponse = await node.trigger.call(manualMockTriggerFunctions);
			
			// Call the manual trigger function
			if (triggerResponse && typeof triggerResponse === 'object' && 'manualTriggerFunction' in triggerResponse) {
				await (triggerResponse as any).manualTriggerFunction();
			}

			expect(manualMockTriggerFunctions.emit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'test-bucket',
						operation: 'put',
						object: expect.objectContaining({
							name: 'reports/2024/sales-report.pdf',
							size: 2457600,
							chunks: 20,
							digest: 'SHA-256=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=',
							mtime: expect.any(String),
							deleted: false,
						}),
						timestamp: expect.any(String),
					}),
				}),
			])]);
		});
	});

	describe('node description', () => {
		it('should have correct metadata', () => {
			expect(node.description.displayName).toBe('NATS Object Store Watcher');
			expect(node.description.name).toBe('natsObjectStoreWatcher');
			expect(node.description.version).toBe(1);
			expect(node.description.credentials).toEqual([{
				name: 'natsApi',
				required: true,
			}]);
		});

		it('should have correct properties', () => {
			const bucketProp = node.description.properties.find(p => p.name === 'bucket');
			expect(bucketProp).toBeDefined();
			expect(bucketProp?.type).toBe('string');
			expect(bucketProp?.required).toBe(true);

			const optionsProp = node.description.properties.find(p => p.name === 'options');
			expect(optionsProp).toBeDefined();
			expect(optionsProp?.type).toBe('collection');
		});
	});
});