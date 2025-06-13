import { ITriggerFunctions } from 'n8n-workflow';
import { NatsKvTrigger } from '../NatsKvTrigger.node';
import * as NatsConnection from '../../utils/NatsConnection';

jest.mock('../../utils/NatsConnection');

describe('NatsKvTrigger Node', () => {
	let node: NatsKvTrigger;
	let mockTriggerFunctions: ITriggerFunctions;
	let mockNc: any;
	let mockJs: any;
	let mockKv: any;
	let mockWatcher: any;
	let mockEmit: jest.Mock;
	
	beforeEach(() => {
		jest.clearAllMocks();
		
		node = new NatsKvTrigger();
		mockEmit = jest.fn();
		
		// Mock watcher as async iterator
		mockWatcher = {
			[Symbol.asyncIterator]: jest.fn(),
		};
		
		// Mock KV store
		mockKv = {
			watch: jest.fn().mockResolvedValue(mockWatcher),
		};
		
		// Mock JetStream
		mockJs = {
			views: {
				kv: jest.fn().mockResolvedValue(mockKv),
			},
		};
		
		// Mock NATS connection
		mockNc = {
			jetstream: jest.fn().mockReturnValue(mockJs),
		};
		
		// Mock trigger functions
		mockTriggerFunctions = {
			getNodeParameter: jest.fn() as jest.MockedFunction<ITriggerFunctions['getNodeParameter']>,
			getCredentials: jest.fn().mockResolvedValue({}),
			getNode: jest.fn().mockReturnValue({}),
			emit: mockEmit,
			helpers: {
				returnJsonArray: jest.fn((data) => data),
			},
			logger: {
				error: jest.fn(),
			},
		} as any;
		
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNc);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
	});
	
	describe('trigger', () => {
		it('should watch all changes in a bucket', async () => {
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('all') // watchType
				.mockReturnValueOnce({ // options
					includeDeletes: true,
					includeHistory: false,
					updatesOnly: false,
				});
			
			const mockEntries = [
				{
					key: 'key1',
					value: new TextEncoder().encode(JSON.stringify({ foo: 'bar' })),
					revision: 1,
					created: new Date('2023-01-01'),
					operation: 'PUT',
					delta: 0,
				},
			];
			
			// Mock async iterator
			mockWatcher[Symbol.asyncIterator] = async function* () {
				for (const entry of mockEntries) {
					yield entry;
				}
			};
			
			const { closeFunction } = await node.trigger.call(mockTriggerFunctions);
			
			// Wait for async processing
			await new Promise(resolve => setTimeout(resolve, 100));
			
			expect(mockKv.watch).toHaveBeenCalledWith({
				include: 'last',
				ignoreDeletes: false,
				headers_only: false,
			});
			
			expect(mockEmit).toHaveBeenCalledWith([
				expect.arrayContaining([
					expect.objectContaining({
						bucket: 'test-bucket',
						key: 'key1',
						value: { foo: 'bar' },
						revision: 1,
						operation: 'PUT',
					}),
				]),
			]);
			
			if (closeFunction) await closeFunction();
		});
		
		it('should watch specific key', async () => {
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('key') // watchType
				.mockReturnValueOnce({}) // options
				.mockReturnValueOnce('my-key'); // key
			
			mockWatcher[Symbol.asyncIterator] = async function* () {
				// No entries for this test
			};
			
			await node.trigger.call(mockTriggerFunctions);
			
			expect(mockKv.watch).toHaveBeenCalledWith({
				key: 'my-key',
				include: 'last',
				ignoreDeletes: true,
				headers_only: false,
			});
		});
		
		it('should watch pattern', async () => {
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('pattern') // watchType
				.mockReturnValueOnce({}) // options
				.mockReturnValueOnce('user.*'); // pattern
			
			mockWatcher[Symbol.asyncIterator] = async function* () {
				// No entries for this test
			};
			
			await node.trigger.call(mockTriggerFunctions);
			
			expect(mockKv.watch).toHaveBeenCalledWith({
				key: 'user.*',
				include: 'last',
				ignoreDeletes: true,
				headers_only: false,
			});
		});
		
		it('should respect includeHistory option', async () => {
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('all') // watchType
				.mockReturnValueOnce({ // options
					includeHistory: true,
				});
			
			mockWatcher[Symbol.asyncIterator] = async function* () {
				// No entries for this test
			};
			
			await node.trigger.call(mockTriggerFunctions);
			
			expect(mockKv.watch).toHaveBeenCalledWith({
				include: 'all',
				ignoreDeletes: true,
				headers_only: false,
			});
		});
		
		it('should respect updatesOnly option', async () => {
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('all') // watchType
				.mockReturnValueOnce({ // options
					updatesOnly: true,
				});
			
			mockWatcher[Symbol.asyncIterator] = async function* () {
				// No entries for this test
			};
			
			await node.trigger.call(mockTriggerFunctions);
			
			expect(mockKv.watch).toHaveBeenCalledWith({
				include: 'updates',
				ignoreDeletes: true,
				headers_only: false,
			});
		});
		
		it('should filter delete operations when includeDeletes is false', async () => {
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('all') // watchType
				.mockReturnValueOnce({ // options
					includeDeletes: false,
				});
			
			const mockEntries = [
				{
					key: 'key1',
					value: new TextEncoder().encode('value1'),
					revision: 1,
					operation: 'PUT',
					created: new Date(),
					delta: 0,
				},
				{
					key: 'key2',
					value: new Uint8Array(0),
					revision: 2,
					operation: 'DEL',
					created: new Date(),
					delta: 0,
				},
			];
			
			mockWatcher[Symbol.asyncIterator] = async function* () {
				for (const entry of mockEntries) {
					yield entry;
				}
			};
			
			await node.trigger.call(mockTriggerFunctions);
			
			// Wait for async processing
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Should only emit PUT operation, not DEL
			expect(mockEmit).toHaveBeenCalledTimes(1);
			expect(mockEmit).toHaveBeenCalledWith([
				expect.arrayContaining([
					expect.objectContaining({
						key: 'key1',
						operation: 'PUT',
					}),
				]),
			]);
		});
		
		it('should handle metadata only option', async () => {
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket') // bucket
				.mockReturnValueOnce('all') // watchType
				.mockReturnValueOnce({ // options
					metadataOnly: true,
				});
			
			const mockEntries = [
				{
					key: 'key1',
					value: new TextEncoder().encode('large value'),
					revision: 1,
					operation: 'PUT',
					created: new Date(),
					delta: 0,
				},
			];
			
			mockWatcher[Symbol.asyncIterator] = async function* () {
				for (const entry of mockEntries) {
					yield entry;
				}
			};
			
			await node.trigger.call(mockTriggerFunctions);
			
			// Wait for async processing
			await new Promise(resolve => setTimeout(resolve, 100));
			
			expect(mockKv.watch).toHaveBeenCalledWith({
				include: 'last',
				ignoreDeletes: true,
				headers_only: true,
			});
			
			// Value should be null when metadata only
			expect(mockEmit).toHaveBeenCalledWith([
				expect.arrayContaining([
					expect.objectContaining({
						key: 'key1',
						value: null,
					}),
				]),
			]);
		});
		
		it('should handle connection errors', async () => {
			(NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
				new Error('Connection failed')
			);
			
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket')
				.mockReturnValueOnce('all')
				.mockReturnValueOnce({});
			
			await expect(node.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				'Failed to start KV watcher: Connection failed'
			);
		});
		
		it('should handle watcher errors gracefully', async () => {
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket')
				.mockReturnValueOnce('all')
				.mockReturnValueOnce({});
			
			// Mock async iterator that throws
			mockWatcher[Symbol.asyncIterator] = async function* () {
				throw new Error('Watcher error');
			};
			
			const { closeFunction } = await node.trigger.call(mockTriggerFunctions);
			
			// Wait for async processing
			await new Promise(resolve => setTimeout(resolve, 100));
			
			expect(mockTriggerFunctions.logger.error).toHaveBeenCalledWith(
				'KV watcher error:',
				expect.any(Error)
			);
			
			if (closeFunction) await closeFunction();
		});
		
		it('should close connection properly', async () => {
			(mockTriggerFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test-bucket')
				.mockReturnValueOnce('all')
				.mockReturnValueOnce({});
			
			mockWatcher[Symbol.asyncIterator] = async function* () {
				// No entries
			};
			
			const { closeFunction } = await node.trigger.call(mockTriggerFunctions);
			
			if (closeFunction) await closeFunction();
			
			expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(mockNc);
		});
	});
});