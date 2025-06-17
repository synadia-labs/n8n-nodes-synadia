import { NatsObjectStoreTrigger } from '../NatsObjectStoreTrigger.node';
import { createNatsConnection, closeNatsConnection } from '../../utils/NatsConnection';
import { ITriggerFunctions } from 'n8n-workflow';
import { jetstream, consumerOpts } from '../../bundled/nats-bundled';

jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled');

describe('NatsObjectStoreTrigger', () => {
	let node: NatsObjectStoreTrigger;
	let mockTriggerFunctions: ITriggerFunctions;
	let mockNc: any;
	let mockJs: any;
	let mockSubscription: any;
	let mockConsumerOpts: any;
	let mockEmit: jest.Mock;
	let mockGetNodeParameter: jest.Mock;

	beforeEach(() => {
		node = new NatsObjectStoreTrigger();
		
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
		
		mockJs = {
			subscribe: jest.fn().mockResolvedValue(mockSubscription),
		};
		
		mockNc = {};
		
		mockEmit = jest.fn();
		mockGetNodeParameter = jest.fn();
		
		mockTriggerFunctions = {
			getNodeParameter: mockGetNodeParameter,
			getCredentials: jest.fn().mockResolvedValue({
				servers: 'nats://localhost:4222',
			}),
			emit: mockEmit,
			helpers: {
				returnJsonArray: jest.fn((data) => data),
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
				data: new TextEncoder().encode('{"name":"test.txt","headers":{"Nats-Object":"test.txt","Nats-Object-Size":"100"}}'),
				headers: {
					get: jest.fn((key) => {
						if (key === 'Nats-Object') return 'test.txt';
						if (key === 'Nats-Object-Size') return '100';
						return undefined;
					}),
				},
			};
			
			// Setup async iterator
			const mockAsyncIterator = {
				[Symbol.asyncIterator]: jest.fn().mockReturnValue({
					next: jest.fn()
						.mockResolvedValueOnce({ done: false, value: mockMsg })
						.mockResolvedValueOnce({ done: true }),
				}),
			};
			mockSubscription[Symbol.asyncIterator] = mockAsyncIterator[Symbol.asyncIterator];
			
			// Start the trigger
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			
			// Let the async operations run
			await new Promise(resolve => setTimeout(resolve, 10));
			
			// Verify connections and setup
			expect(createNatsConnection).toHaveBeenCalled();
			expect(jetstream).toHaveBeenCalledWith(mockNc);
			expect(consumerOpts).toHaveBeenCalled();
			expect(mockConsumerOpts.deliverLastPerSubject).toHaveBeenCalled();
			expect(mockJs.subscribe).toHaveBeenCalledWith('$O.test-bucket.M.>', mockConsumerOpts);
			
			// Verify emitted data
			expect(mockEmit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'test-bucket',
						object: 'test.txt',
						size: 100,
						operation: 'put',
					}),
				}),
			])]);
			
			// Call close function
			const triggerResponse = await triggerPromise;
			if (triggerResponse && typeof triggerResponse === 'object' && 'closeFunction' in triggerResponse) {
				await (triggerResponse as any).closeFunction();
			}
			
			expect(mockSubscription.unsubscribe).toHaveBeenCalled();
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
			const mockAsyncIterator = {
				[Symbol.asyncIterator]: jest.fn().mockReturnValue({
					next: jest.fn().mockResolvedValue({ done: true }),
				}),
			};
			mockSubscription[Symbol.asyncIterator] = mockAsyncIterator[Symbol.asyncIterator];
			
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 10));
			
			expect(consumerOpts).toHaveBeenCalled();
			expect(mockConsumerOpts.deliverNew).toHaveBeenCalled();
			expect(mockConsumerOpts.deliverLastPerSubject).not.toHaveBeenCalled();
			
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
			
			// Make subscription throw an error
			const errorAsyncIterator = {
				[Symbol.asyncIterator]: jest.fn().mockReturnValue({
					next: jest.fn().mockRejectedValue(new Error('Subscription error')),
				}),
			};
			mockSubscription[Symbol.asyncIterator] = errorAsyncIterator[Symbol.asyncIterator];
			
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 10));
			
			expect(mockTriggerFunctions.logger.error).toHaveBeenCalledWith('Error processing object store events:', expect.any(Error));
			
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
			
			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow('Connection failed');
		});

		it('should handle delete operations', async () => {
			mockGetNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'bucket': return 'test-bucket';
					case 'options': return {};
					default: return '';
				}
			});
			
			// Mock delete message (has subject ending with DEL)
			const mockDeleteMsg = {
				subject: '$O.test-bucket.M.deleted.txt',
				data: new TextEncoder().encode('{"name":"deleted.txt","headers":{"Nats-Object":"deleted.txt","Nats-Deleted":"true"}}'),
				headers: {
					get: jest.fn((key) => {
						if (key === 'Nats-Object') return 'deleted.txt';
						if (key === 'Nats-Deleted') return 'true';
						return undefined;
					}),
				},
			};
			
			// Setup async iterator with delete message
			const deleteAsyncIterator = {
				[Symbol.asyncIterator]: jest.fn().mockReturnValue({
					next: jest.fn()
						.mockResolvedValueOnce({ done: false, value: mockDeleteMsg })
						.mockResolvedValueOnce({ done: true }),
				}),
			};
			mockSubscription[Symbol.asyncIterator] = deleteAsyncIterator[Symbol.asyncIterator];
			
			const triggerPromise = node.trigger.call(mockTriggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 10));
			
			expect(mockEmit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'test-bucket',
						object: 'deleted.txt',
						operation: 'delete',
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
			};

			await node.trigger.call(manualMockTriggerFunctions);

			expect(manualMockTriggerFunctions.emit).toHaveBeenCalledWith([expect.arrayContaining([
				expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'my-bucket',
						object: 'documents/report.pdf',
						size: 102400,
						operation: 'put',
						timestamp: expect.any(String),
						etag: expect.any(String),
					}),
				}),
			])]);
		});
	});

	describe('node description', () => {
		it('should have correct metadata', () => {
			expect(node.description.displayName).toBe('NATS Object Store Trigger');
			expect(node.description.name).toBe('natsObjectStoreTrigger');
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