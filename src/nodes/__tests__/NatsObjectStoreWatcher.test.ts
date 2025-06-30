import { NatsObjectStoreWatcher } from '../NatsObjectStoreWatcher.node';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { ITriggerFunctions } from 'n8n-workflow';
import { jetstream, Objm } from '../../bundled/nats-bundled';

jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled');

describe('NatsObjectStoreWatcher', () => {
	let node: NatsObjectStoreWatcher;
	let mockTriggerFunctions: ITriggerFunctions;
	let mockNc: any;
	let mockJs: any;
	let mockObjManager: any;
	let mockObjectStore: any;
	let mockWatcher: any;
	let mockEmit: jest.Mock;
	let mockGetNodeParameter: jest.Mock;

	beforeEach(() => {
		node = new NatsObjectStoreWatcher();
		
		// Setup mock watcher iterator
		mockWatcher = {
			[Symbol.asyncIterator]: () => ({
				next: jest.fn().mockResolvedValue({ done: true }),
			}),
			stop: jest.fn().mockResolvedValue(undefined),
		};
		
		// Setup mock ObjectStore
		mockObjectStore = {
			watch: jest.fn().mockResolvedValue(mockWatcher),
		};
		
		// Setup mock ObjectManager (Objm)
		mockObjManager = {
			open: jest.fn().mockResolvedValue(mockObjectStore),
		};
		
		// Setup mock JetStream
		mockJs = {};
		mockNc = {};
		
		mockEmit = jest.fn();
		mockGetNodeParameter = jest.fn();
		
		// Mock Objm constructor
		(Objm as jest.Mock).mockImplementation(() => mockObjManager);
		
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
			getNode: jest.fn().mockReturnValue({
				id: 'test-node-id',
				name: 'Test Node',
				type: 'n8n-nodes-synadia.natsObjectStoreWatcher',
				position: [0, 0],
				typeVersion: 1,
			}),
			logger: {
				error: jest.fn(),
			},
		} as any;
		
		(createNatsConnection as jest.Mock).mockResolvedValue(mockNc);
		(closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
		(jetstream as jest.Mock).mockReturnValue(mockJs);
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
			
			// Mock ObjectWatchInfo for object store changes
			const mockUpdate = {
				name: 'test.txt',
				size: 100,
				chunks: 1,
				digest: 'SHA-256=abc123',
				mtime: '2023-10-01T12:00:00.000Z',
				deleted: false,
			};
			
			// Setup watcher iterator to return our mock update
			mockWatcher = {
				[Symbol.asyncIterator]: () => ({
					next: jest.fn()
						.mockResolvedValueOnce({ done: false, value: mockUpdate })
						.mockResolvedValue({ done: true }),
				}),
				stop: jest.fn().mockResolvedValue(undefined),
			};
			
			mockObjectStore.watch.mockResolvedValue(mockWatcher);
			
			// Start the trigger
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			
			// Let the async operations run
			await new Promise(resolve => setTimeout(resolve, 200));
			
			// Verify connections and setup
			expect(createNatsConnection).toHaveBeenCalled();
			expect(jetstream).toHaveBeenCalledWith(mockNc);
			expect(Objm).toHaveBeenCalledWith(mockJs);
			expect(mockObjManager.open).toHaveBeenCalledWith('test-bucket');
			expect(mockObjectStore.watch).toHaveBeenCalledWith({
				ignoreDeletes: true,
			});
			
			// Verify emitted data
			expect(mockEmit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'test-bucket',
						name: 'test.txt',
						size: 100,
						chunks: 1,
						digest: 'SHA-256=abc123',
						mtime: '2023-10-01T12:00:00.000Z',
						deleted: false,
						timestamp: expect.any(String),
					}),
				}),
			])]);
			
			// Call close function
			const triggerResponse = await triggerPromise;
			if (triggerResponse && typeof triggerResponse === 'object' && 'closeFunction' in triggerResponse) {
				await (triggerResponse as any).closeFunction();
			}
			
			expect(mockWatcher.stop).toHaveBeenCalled();
			expect(closeNatsConnection).toHaveBeenCalledWith(mockNc, expect.any(Object));
		});

		it('should handle default options', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return {};
					default: return '';
				}
			});
			
			// Setup empty watcher (no updates)
			mockWatcher = {
				[Symbol.asyncIterator]: () => ({
					next: jest.fn().mockResolvedValue({ done: true }),
				}),
				stop: jest.fn().mockResolvedValue(undefined),
			};
			
			mockObjectStore.watch.mockResolvedValue(mockWatcher);
			
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));
			
			expect(mockObjectStore.watch).toHaveBeenCalledWith({
				ignoreDeletes: true,
			});
		});

		it('should handle include history option', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return { includeHistory: true };
					default: return '';
				}
			});
			
			await node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));
			
			expect(mockObjectStore.watch).toHaveBeenCalledWith({
				ignoreDeletes: true,
				includeHistory: true,
			});
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


		it('should handle delete operations', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return { includeDeletes: true };
					default: return '';
				}
			});
			
			// Mock delete update
			const deleteUpdate = {
				name: 'deleted.txt',
				size: 0,
				chunks: 0,
				digest: '',
				mtime: '2023-10-01T12:00:00.000Z',
				deleted: true,
			};
			
			// Setup watcher iterator to return delete update
			mockWatcher = {
				[Symbol.asyncIterator]: () => ({
					next: jest.fn()
						.mockResolvedValueOnce({ done: false, value: deleteUpdate })
						.mockResolvedValue({ done: true }),
				}),
				stop: jest.fn().mockResolvedValue(undefined),
			};
			
			mockObjectStore.watch.mockResolvedValue(mockWatcher);
			
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 200));
			
			expect(mockObjectStore.watch).toHaveBeenCalledWith({
				ignoreDeletes: false,
			});
			
			expect(mockEmit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'test-bucket',
						name: 'deleted.txt',
						size: 0,
						chunks: 0,
						digest: '',
						mtime: '2023-10-01T12:00:00.000Z',
						deleted: true,
						timestamp: expect.any(String),
					}),
				}),
			])]);
		});
	});

	describe('manualTriggerFunction', () => {
		it('should return sample data in manual mode', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return {};
					default: return '';
				}
			});
			
			const triggerResponse = await node.trigger.call(mockTriggerFunctions);
			
			// Call manual trigger function
			if (triggerResponse && typeof triggerResponse === 'object' && 'manualTriggerFunction' in triggerResponse) {
				await (triggerResponse as any).manualTriggerFunction();
			}
			
			// Verify sample data was emitted
			expect(mockEmit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'test-bucket',
						name: expect.any(String),
						size: expect.any(Number),
						chunks: expect.any(Number),
						digest: expect.any(String),
						mtime: expect.any(String),
						deleted: false,
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
			const bucketProperty = node.description.properties.find(p => p.name === 'bucket');
			expect(bucketProperty).toBeDefined();
			expect(bucketProperty?.required).toBe(true);
			
			const optionsProperty = node.description.properties.find(p => p.name === 'options');
			expect(optionsProperty).toBeDefined();
			expect(optionsProperty?.type).toBe('collection');
		});
	});
});