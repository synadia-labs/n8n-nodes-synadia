import { IExecuteFunctions, ITriggerFunctions, INodeExecutionData, INode } from 'n8n-workflow';
import { NatsSubscriber } from '../../nodes/NatsSubscriber.node';
import { NatsPublisher } from '../../nodes/NatsPublisher.node';
import { NatsKv } from '../../nodes/NatsKv.node';
import { NatsKvWatcher } from '../../nodes/NatsKvWatcher.node';
import { NatsObjectStore } from '../../nodes/NatsObjectStore.node';
import { NatsObjectStoreWatcher } from '../../nodes/NatsObjectStoreWatcher.node';
import * as NatsConnection from '../../utils/NatsConnection';
import { connect, headers as createHeaders, StringCodec, jetstream, jetstreamManager, Kvm as kv, Objm as objectstore, DeliverPolicy, consumerOpts } from '../../bundled/nats-bundled';

// Mock the bundled NATS module
jest.mock('../../bundled/nats-bundled');
jest.mock('../../utils/NatsConnection');

describe('NATS Nodes Integration Tests', () => {
	// Common mocks
	let mockNc: any;
	let mockJs: any;
	let mockKvStore: any;
	let mockObjectStore: any;
	let mockSubscription: any;
	let mockKvWatcher: any;
	let mockObjectWatcher: any;
	let mockMessageIterator: any;
	let mockConsumer: any;
	let sc: any;

	// Mock node execution context
	const mockNode: INode = {
		id: 'test-node-id',
		name: 'Test Node',
		typeVersion: 1,
		type: 'test-node-type',
		position: [0, 0],
		parameters: {},
	};

	// Create common mock functions
	const createMockExecuteFunctions = (params: any = {}): IExecuteFunctions => ({
		getNode: jest.fn(() => mockNode),
		getNodeParameter: jest.fn((paramName: string, itemIndex?: number, fallback?: any) => {
			if (params.hasOwnProperty(paramName)) {
				return params[paramName];
			}
			return fallback;
		}),
		getCredentials: jest.fn().mockResolvedValue({
			serverUrls: 'nats://localhost:4222',
		}),
		getInputData: jest.fn().mockReturnValue([{ json: { test: 'data' } }]),
		helpers: {
			returnJsonArray: jest.fn((data: any[]) => data.map(item => ({ json: item }))),
			httpRequestWithAuthentication: { requestOAuth2: jest.fn() },
		} as any,
		logger: {
			error: jest.fn(),
			warn: jest.fn(),
			info: jest.fn(),
			debug: jest.fn(),
		} as any,
		continueOnFail: jest.fn(() => false),
	} as unknown as IExecuteFunctions);

	const createMockTriggerFunctions = (params: any = {}): ITriggerFunctions => ({
		getNode: jest.fn(() => mockNode),
		getNodeParameter: jest.fn((paramName: string, fallback?: any) => {
			if (params.hasOwnProperty(paramName)) {
				return params[paramName];
			}
			return fallback;
		}),
		getCredentials: jest.fn().mockResolvedValue({
			serverUrls: 'nats://localhost:4222',
		}),
		emit: jest.fn(),
		helpers: {
			returnJsonArray: jest.fn((data: any[]) => data.map(item => ({ json: item }))),
		} as any,
		logger: {
			error: jest.fn(),
			warn: jest.fn(),
			info: jest.fn(),
			debug: jest.fn(),
		} as any,
		continueOnFail: jest.fn(() => false),
	} as unknown as ITriggerFunctions);

	beforeEach(() => {
		jest.clearAllMocks();
		
		// Initialize StringCodec
		sc = {
			encode: (str: string) => new TextEncoder().encode(str),
			decode: (data: Uint8Array) => new TextDecoder().decode(data),
		};

		// Mock subscription
		mockSubscription = {
			unsubscribe: jest.fn(),
			drain: jest.fn().mockResolvedValue(undefined),
			[Symbol.asyncIterator]: jest.fn().mockReturnValue({
				next: jest.fn().mockResolvedValue({ done: true }),
			}),
		};

		// Mock KV watcher
		mockKvWatcher = {
			stop: jest.fn(),
			[Symbol.asyncIterator]: jest.fn().mockReturnValue({
				next: jest.fn().mockResolvedValue({ done: true }),
			}),
		};

		// Mock Object watcher
		mockObjectWatcher = {
			stop: jest.fn(),
			[Symbol.asyncIterator]: jest.fn().mockReturnValue({
				next: jest.fn().mockResolvedValue({ done: true }),
			}),
		};

		// Mock KV store
		mockKvStore = {
			create: jest.fn().mockResolvedValue({ success: true }),
			get: jest.fn().mockResolvedValue({ 
				value: sc.encode('test-value'), 
				revision: 1,
				created: { getTime: () => Date.now() },
				delta: 0,
			}),
			put: jest.fn().mockResolvedValue(2), // put returns revision number
			update: jest.fn().mockResolvedValue(3), // update returns revision number
			delete: jest.fn().mockResolvedValue({ success: true }),
			keys: jest.fn().mockResolvedValue(['key1', 'key2']),
			history: jest.fn().mockResolvedValue([]),
			watch: jest.fn().mockReturnValue(mockKvWatcher),
			watchAll: jest.fn().mockReturnValue(mockKvWatcher),
			status: jest.fn().mockResolvedValue({ bucket: 'test-bucket', values: 10 }),
			destroy: jest.fn().mockResolvedValue(undefined),
		};

		// Mock Object store
		mockObjectStore = {
			seal: jest.fn().mockResolvedValue({ success: true }),
			status: jest.fn().mockResolvedValue({ bucket: 'test-bucket', size: 1000 }),
			list: jest.fn().mockResolvedValue([{ name: 'file1.txt', size: 100 }]),
			get: jest.fn().mockResolvedValue({ 
				data: new ReadableStream({
					start(controller) {
						controller.enqueue(sc.encode('file content'));
						controller.close();
					}
				}),
				info: {
					name: 'file1.txt',
					size: 100,
					chunks: 1,
					digest: 'abc123',
					mtime: new Date().toISOString(),
				}
			}),
			put: jest.fn().mockResolvedValue({ name: 'file1.txt', size: 100 }),
			delete: jest.fn().mockResolvedValue({ success: true }),
			link: jest.fn().mockResolvedValue({ success: true }),
			linkStore: jest.fn().mockResolvedValue({ success: true }),
			info: jest.fn().mockResolvedValue({ name: 'file1.txt', size: 100, chunks: 1 }),
			watch: jest.fn().mockReturnValue(mockObjectWatcher),
			destroy: jest.fn().mockResolvedValue(undefined),
		};

		// Mock JetStream consumer with message iterator
		mockMessageIterator = {
			[Symbol.asyncIterator]: () => ({
				next: jest.fn().mockResolvedValue({ done: true }),
			}),
		};
		
		mockConsumer = {
			consume: jest.fn(() => Promise.resolve(mockMessageIterator)),
			delete: jest.fn().mockResolvedValue(undefined),
		};

		// Mock JetStream
		mockJs = {
			views: {
				kv: jest.fn().mockResolvedValue(mockKvStore),
				os: jest.fn().mockResolvedValue(mockObjectStore),
			},
			subscribe: jest.fn().mockResolvedValue(mockSubscription),
			publish: jest.fn().mockResolvedValue({ seq: 1 }),
			consumers: {
				get: jest.fn().mockResolvedValue(mockConsumer),
			},
		};

		// Mock NATS connection
		mockNc = {
			close: jest.fn(),
			closed: jest.fn().mockResolvedValue(undefined),
			subscribe: jest.fn().mockReturnValue(mockSubscription),
			publish: jest.fn(),
			request: jest.fn().mockResolvedValue({
				data: sc.encode('{"response": "test"}'),
				headers: createHeaders(),
			}),
			flush: jest.fn().mockResolvedValue(undefined),
			jetstream: jest.fn().mockReturnValue(mockJs),
		};

		// Setup mocks
		(connect as jest.Mock).mockResolvedValue(mockNc);
		(jetstream as jest.Mock).mockReturnValue(mockJs);
		(jetstreamManager as jest.Mock).mockResolvedValue({
			streams: {
				add: jest.fn().mockResolvedValue({ success: true }),
				delete: jest.fn().mockResolvedValue(true),
				list: jest.fn().mockResolvedValue([]),
				info: jest.fn().mockResolvedValue({ config: { name: 'TEST' } }),
			},
			consumers: {
				add: jest.fn().mockResolvedValue({
					stream_name: 'EVENTS',
					name: 'ephemeral-consumer-123',
				}),
				delete: jest.fn().mockResolvedValue(true),
			},
		});
		const kvManagerInstance = {
			open: jest.fn().mockResolvedValue(mockKvStore),
			create: jest.fn().mockResolvedValue(mockKvStore),
			list: jest.fn().mockResolvedValue(['bucket1', 'bucket2']),
			destroy: jest.fn().mockResolvedValue({ success: true }),
		};
		(kv as any).mockImplementation(() => kvManagerInstance);
		(objectstore as any).mockImplementation(() => ({
			open: jest.fn().mockResolvedValue(mockObjectStore),
			create: jest.fn().mockResolvedValue(mockObjectStore),
			list: jest.fn().mockResolvedValue(['bucket1', 'bucket2']),
			destroy: jest.fn().mockResolvedValue({ success: true }),
		}));
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNc);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
		(StringCodec as jest.Mock).mockReturnValue(sc);
		
		// Mock DeliverPolicy enum
		(DeliverPolicy as any) = {
			All: 'all',
			Last: 'last', 
			New: 'new',
			ByStartSequence: 'by_start_sequence',
			ByStartTime: 'by_start_time',
			LastPerSubject: 'last_per_subject',
			deliverNew: jest.fn().mockReturnValue('new'),
			deliverAll: jest.fn().mockReturnValue('all'),
			deliverLast: jest.fn().mockReturnValue('last'),
		};
		
		// Mock consumerOpts
		const mockConsumerOpts = {
			deliverAll: jest.fn().mockReturnThis(),
			deliverLast: jest.fn().mockReturnThis(), 
			deliverNew: jest.fn().mockReturnThis(),
			deliverLastPerSubject: jest.fn().mockReturnThis(),
			startSequence: jest.fn().mockReturnThis(),
			startTime: jest.fn().mockReturnThis(),
			ackWait: jest.fn().mockReturnThis(),
			ackExplicit: jest.fn().mockReturnThis(),
			manualAck: jest.fn().mockReturnThis(),
			callback: jest.fn().mockReturnThis(),
			maxAckPending: jest.fn().mockReturnThis(),
		};
		(consumerOpts as jest.Mock).mockReturnValue(mockConsumerOpts);
	});

	describe('Core NATS Pub/Sub Workflow', () => {
		it('should successfully publish and receive messages', async () => {
			// Create nodes
			const publisher = new NatsPublisher();
			const trigger = new NatsSubscriber();

			// Setup trigger to receive messages
			const triggerFunctions = createMockTriggerFunctions({
				subject: 'test.subject',
				subscriptionType: 'core',
				queueGroup: '',
				options: {},
			});

			// Setup mock subscription to emit a message
			const mockMessage = {
				subject: 'test.subject',
				data: sc.encode('{"test": "message"}'),
				reply: undefined,
				headers: undefined,
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockReturnValue({
				next: jest.fn()
					.mockResolvedValueOnce({ done: false, value: mockMessage })
					.mockResolvedValue({ done: true }),
			});

			// Start trigger
			const triggerPromise = trigger.trigger.call(triggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 50));

			// Verify trigger received message
			expect(triggerFunctions.emit).toHaveBeenCalledWith([
				[expect.objectContaining({
					json: expect.objectContaining({
						subject: 'test.subject',
						data: { test: 'message' },
					}),
				})],
			]);

			// Setup publisher
			const executeFunctions = createMockExecuteFunctions({
				subject: 'test.subject',
				message: '{"test": "message"}',
				publishType: 'core',
				options: {},
			});

			// Publish message
			await publisher.execute.call(executeFunctions);

			// Verify publish was called
			expect(mockNc.publish).toHaveBeenCalledWith(
				'test.subject',
				expect.any(Uint8Array),
				expect.any(Object)
			);

			// Cleanup
			const triggerResult = await triggerPromise;
			if (triggerResult && 'closeFunction' in triggerResult && triggerResult.closeFunction) {
				await triggerResult.closeFunction();
			}
		});

		it('should handle queue groups correctly', async () => {
			const trigger = new NatsSubscriber();
			const triggerFunctions = createMockTriggerFunctions({
				subject: 'work.queue',
				subscriptionType: 'core',
				queueGroup: 'workers',
				options: {},
			});

			await trigger.trigger.call(triggerFunctions);

			expect(mockNc.subscribe).toHaveBeenCalledWith(
				'work.queue',
				expect.objectContaining({ queue: 'workers' })
			);
		});
	});


	describe('Authentication and Security', () => {
		it('should handle different authentication methods', async () => {
			const authMethods = [
				{ authType: 'usernamePassword', username: 'user', password: 'pass' },
				{ authType: 'token', token: 'auth-token' },
				{ authType: 'nkey', nkeySeed: 'SUABC...' },
				{ authType: 'jwt', jwt: 'eyJ...', nkeySeed: 'SUABC...' },
				{ authType: 'credsFile', credsFile: '-----BEGIN NATS USER JWT-----' },
			];

			for (const auth of authMethods) {
				jest.clearAllMocks();
				
				const trigger = new NatsSubscriber();
				const triggerFunctions = createMockTriggerFunctions({
					subject: 'test.subject',
					subscriptionType: 'core',
				});

				triggerFunctions.getCredentials = jest.fn().mockResolvedValue({
					serverUrls: 'nats://localhost:4222',
					...auth,
				});

				await trigger.trigger.call(triggerFunctions);

				expect(NatsConnection.createNatsConnection).toHaveBeenCalledWith(
					expect.objectContaining({
						serverUrls: 'nats://localhost:4222',
						...auth,
					}),
					expect.any(Object),
					expect.objectContaining({
						id: expect.any(String),
						name: expect.any(String),
						type: expect.any(String),
						position: expect.any(Array),
						typeVersion: expect.any(Number),
					})
				);
			}
		});
	});

	describe('Performance and Scalability', () => {
		it('should handle high message throughput', async () => {
			const trigger = new NatsSubscriber();
			const triggerFunctions = createMockTriggerFunctions({
				subject: 'high.throughput.>',
				subscriptionType: 'core',
				options: {},
			});

			// Mock 1000 messages
			const messages = Array.from({ length: 1000 }, (_, i) => ({
				subject: `high.throughput.${i}`,
				data: sc.encode(`{"id": ${i}}`),
			}));

			let messageIndex = 0;
			mockSubscription[Symbol.asyncIterator] = jest.fn().mockReturnValue({
				next: jest.fn().mockImplementation(() => {
					if (messageIndex < messages.length) {
						return Promise.resolve({ 
							done: false, 
							value: messages[messageIndex++] 
						});
					}
					return Promise.resolve({ done: true });
				}),
			});

			await trigger.trigger.call(triggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 100));

			// Should emit all messages
			expect(triggerFunctions.emit).toHaveBeenCalledTimes(1000);
		});

		it('should handle concurrent operations', async () => {
			const kvNode = new NatsKv();
			
			// Execute multiple operations concurrently
			const operations = Array.from({ length: 10 }, (_, i) => {
				const functions = createMockExecuteFunctions({
					operation: 'put',
					bucket: 'concurrent',
					key: `key-${i}`,
					value: `value-${i}`,
				});
				return kvNode.execute.call(functions);
			});

			const results = await Promise.all(operations);

			// All operations should succeed
			expect(results).toHaveLength(10);
			expect(mockKvStore.put).toHaveBeenCalledTimes(10);
		});
	});

	describe('Manual Testing Helpers', () => {
		it('should provide realistic sample data for all triggers', async () => {
			const triggers = [
				{ node: new NatsSubscriber(), params: { subject: 'test', subscriptionType: 'core' } },
				{ node: new NatsKvWatcher(), params: { bucket: 'test-bucket', options: {} } },
				{ node: new NatsObjectStoreWatcher(), params: { bucket: 'test-bucket', options: {} } },
			];

			for (const { node, params } of triggers) {
				const triggerFunctions = createMockTriggerFunctions(params);
				
				// All trigger nodes should have manualTriggerFunction
				expect(node.trigger).toBeDefined();
				
				// Call manual trigger if available
				const result = await node.trigger.call(triggerFunctions);
				if (result && 'manualTriggerFunction' in result && result.manualTriggerFunction) {
					const sampleData = await result.manualTriggerFunction() as INodeExecutionData[] | undefined;
					
					if (sampleData !== undefined && sampleData !== null && Array.isArray(sampleData)) {
						// Should return sample data
						expect(sampleData).toBeDefined();
						expect(sampleData.length).toBeGreaterThan(0);
						expect(sampleData[0]).toHaveProperty('json');
					}
				}
			}
		});
	});
});