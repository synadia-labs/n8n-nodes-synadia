import { IExecuteFunctions, ITriggerFunctions, INodeExecutionData, INode } from 'n8n-workflow';
import { NatsTrigger } from '../../nodes/NatsTrigger.node';
import { NatsPublisher } from '../../nodes/NatsPublisher.node';
import { NatsRequestReply } from '../../nodes/NatsRequestReply.node';
import { NatsServiceReply } from '../../nodes/NatsServiceReply.node';
import { NatsService } from '../../nodes/NatsService.node';
import { NatsKv } from '../../nodes/NatsKv.node';
import { NatsKvTrigger } from '../../nodes/NatsKvTrigger.node';
import { NatsObjectStore } from '../../nodes/NatsObjectStore.node';
import { NatsObjectStoreTrigger } from '../../nodes/NatsObjectStoreTrigger.node';
import * as NatsConnection from '../../utils/NatsConnection';
import { connect, headers as createHeaders, StringCodec, jetstream, Kvm as kv, Objm as objectstore } from '../../bundled/nats-bundled';

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
		getNodeParameter: jest.fn((paramName: string) => params[paramName]),
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
	} as unknown as IExecuteFunctions);

	const createMockTriggerFunctions = (params: any = {}): ITriggerFunctions => ({
		getNode: jest.fn(() => mockNode),
		getNodeParameter: jest.fn((paramName: string) => params[paramName]),
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
			get: jest.fn().mockResolvedValue({ value: sc.encode('test-value'), revision: 1 }),
			put: jest.fn().mockResolvedValue({ revision: 2 }),
			update: jest.fn().mockResolvedValue({ revision: 3 }),
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
			get: jest.fn().mockResolvedValue({ data: jest.fn().mockResolvedValue(sc.encode('file content')) }),
			put: jest.fn().mockResolvedValue({ name: 'file1.txt', size: 100 }),
			delete: jest.fn().mockResolvedValue({ success: true }),
			link: jest.fn().mockResolvedValue({ success: true }),
			linkStore: jest.fn().mockResolvedValue({ success: true }),
			info: jest.fn().mockResolvedValue({ name: 'file1.txt', size: 100, chunks: 1 }),
			watch: jest.fn().mockReturnValue(mockObjectWatcher),
			destroy: jest.fn().mockResolvedValue(undefined),
		};

		// Mock JetStream
		mockJs = {
			views: {
				kv: jest.fn().mockResolvedValue(mockKvStore),
				os: jest.fn().mockResolvedValue(mockObjectStore),
			},
			subscribe: jest.fn().mockResolvedValue(mockSubscription),
			publish: jest.fn().mockResolvedValue({ seq: 1 }),
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
		};

		// Setup mocks
		(connect as jest.Mock).mockResolvedValue(mockNc);
		(jetstream as jest.Mock).mockReturnValue(mockJs);
		(kv as jest.Mock).mockReturnValue(mockKvStore);
		(objectstore as jest.Mock).mockReturnValue(mockObjectStore);
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNc);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
		(StringCodec as jest.Mock).mockReturnValue(sc);
	});

	describe('Core NATS Pub/Sub Workflow', () => {
		it('should successfully publish and receive messages', async () => {
			// Create nodes
			const publisher = new NatsPublisher();
			const trigger = new NatsTrigger();

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
				undefined
			);

			// Cleanup
			const triggerResult = await triggerPromise;
			if (triggerResult && 'closeFunction' in triggerResult && triggerResult.closeFunction) {
				await triggerResult.closeFunction();
			}
		});

		it('should handle queue groups correctly', async () => {
			const trigger = new NatsTrigger();
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

	describe('Request/Reply Workflow', () => {
		it('should handle request/reply pattern end-to-end', async () => {
			// Create nodes
			const requestReply = new NatsRequestReply();
			const serviceReply = new NatsServiceReply();

			// Setup service to handle requests
			const serviceFunctions = createMockTriggerFunctions({
				subject: 'api.service',
				queueGroup: '',
				options: { replyField: 'response' },
			});

			// Mock message with reply subject
			const serviceMessage = {
				subject: 'api.service',
				data: sc.encode('{"request": "data"}'),
				reply: '_INBOX.123',
				respond: jest.fn(),
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockReturnValue({
				next: jest.fn()
					.mockResolvedValueOnce({ done: false, value: serviceMessage })
					.mockResolvedValue({ done: true }),
			});

			// Start service
			const servicePromise = serviceReply.trigger.call(serviceFunctions);
			await new Promise(resolve => setTimeout(resolve, 50));

			// Verify service received request
			expect(serviceFunctions.emit).toHaveBeenCalled();

			// Setup request/reply
			const requestFunctions = createMockExecuteFunctions({
				subject: 'api.service',
				requestData: '{"request": "data"}',
				options: {
					timeout: 5000,
					responseType: 'single',
					requestEncoding: 'json',
				},
			});

			// Execute request
			const result = await requestReply.execute.call(requestFunctions);

			// Verify request was made
			expect(mockNc.request).toHaveBeenCalledWith(
				'api.service',
				expect.any(Uint8Array),
				expect.objectContaining({ timeout: 5000 })
			);

			// Verify result
			expect(result).toEqual([[{ json: { response: 'test' } }]]);

			// Cleanup
			const serviceResult = await servicePromise;
			if (serviceResult && 'closeFunction' in serviceResult && serviceResult.closeFunction) {
				await serviceResult.closeFunction();
			}
		});

		it('should handle NATS Service node correctly', async () => {
			const service = new NatsService();
			const serviceFunctions = createMockTriggerFunctions({
				subject: 'api.echo',
				queueGroup: '',
				responseData: '{"echo": "{{$json.data.message}}", "timestamp": "{{new Date().toISOString()}}"}',
				options: {},
			});

			// Mock incoming request
			const requestMessage = {
				subject: 'api.echo',
				data: sc.encode('{"message": "hello"}'),
				reply: '_INBOX.456',
				respond: jest.fn(),
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockReturnValue({
				next: jest.fn()
					.mockResolvedValueOnce({ done: false, value: requestMessage })
					.mockResolvedValue({ done: true }),
			});

			// Start service
			await service.trigger.call(serviceFunctions);
			await new Promise(resolve => setTimeout(resolve, 50));

			// Verify response was sent
			expect(requestMessage.respond).toHaveBeenCalled();
			const responseData = requestMessage.respond.mock.calls[0][0];
			const responseText = new TextDecoder().decode(responseData);
			const response = JSON.parse(responseText);
			
			expect(response).toMatchObject({
				echo: 'hello',
				timestamp: expect.any(String),
			});
		});
	});

	describe('JetStream Workflow', () => {
		it('should publish and consume from JetStream', async () => {
			const publisher = new NatsPublisher();
			const trigger = new NatsTrigger();

			// Setup JetStream trigger
			const triggerFunctions = createMockTriggerFunctions({
				subject: 'events.>',
				subscriptionType: 'jetstream',
				streamName: 'EVENTS',
				consumerType: 'ephemeral',
				options: {
					deliverPolicy: 'new',
					ackPolicy: 'explicit',
					manualAck: false,
				},
			});

			// Mock JetStream message
			const jsMessage = {
				subject: 'events.user.created',
				data: sc.encode('{"userId": "123"}'),
				seq: 42,
				headers: createHeaders(),
				ack: jest.fn(),
			};

			const mockConsumerOpts = {
				deliverPolicy: jest.fn().mockReturnThis(),
				ackExplicit: jest.fn().mockReturnThis(),
				manualAck: jest.fn().mockReturnThis(),
				callback: jest.fn().mockReturnThis(),
			};

			(jetstream as jest.Mock).mockReturnValue({
				...mockJs,
				consumerOpts: jest.fn(() => mockConsumerOpts),
			});

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockReturnValue({
				next: jest.fn()
					.mockResolvedValueOnce({ done: false, value: jsMessage })
					.mockResolvedValue({ done: true }),
			});

			// Start trigger
			await trigger.trigger.call(triggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 50));

			// Verify message was processed
			expect(triggerFunctions.emit).toHaveBeenCalledWith([
				[expect.objectContaining({
					json: expect.objectContaining({
						subject: 'events.user.created',
						data: { userId: '123' },
						seq: 42,
					}),
				})],
			]);

			// Verify ack was called
			expect(jsMessage.ack).toHaveBeenCalled();

			// Setup JetStream publisher
			const publishFunctions = createMockExecuteFunctions({
				subject: 'events.user.created',
				message: '{"userId": "123"}',
				publishType: 'jetstream',
				jetstreamOptions: {
					messageId: 'msg-123',
					streamName: 'EVENTS',
				},
			});

			// Publish to JetStream
			await publisher.execute.call(publishFunctions);

			// Verify JetStream publish
			expect(mockJs.publish).toHaveBeenCalledWith(
				'events.user.created',
				expect.any(Uint8Array),
				expect.objectContaining({
					msgID: 'msg-123',
					headers: expect.any(Object),
				})
			);
		});
	});

	describe('Key-Value Store Workflow', () => {
		it('should perform KV operations and watch for changes', async () => {
			const kvNode = new NatsKv();
			const kvTrigger = new NatsKvTrigger();

			// Test KV put operation
			const putFunctions = createMockExecuteFunctions({
				operation: 'put',
				bucket: 'config',
				key: 'app.settings',
				value: '{"theme": "dark"}',
				options: {},
			});

			await kvNode.execute.call(putFunctions);

			expect(mockKvStore.put).toHaveBeenCalledWith(
				'app.settings',
				expect.any(Uint8Array)
			);

			// Test KV get operation
			const getFunctions = createMockExecuteFunctions({
				operation: 'get',
				bucket: 'config',
				key: 'app.settings',
				options: {},
			});

			const getResult = await kvNode.execute.call(getFunctions);
			expect(getResult).toEqual([[{
				json: {
					bucket: 'config',
					key: 'app.settings',
					value: 'test-value',
					revision: 1,
				},
			}]]);

			// Setup KV watcher
			const watcherFunctions = createMockTriggerFunctions({
				bucket: 'config',
				watchType: 'all',
				options: {},
			});

			// Mock KV change event
			const kvChange = {
				key: 'app.settings',
				value: sc.encode('{"theme": "light"}'),
				revision: 2,
				created: new Date(),
				operation: 'PUT',
				delta: 1,
			};

			mockKvWatcher[Symbol.asyncIterator] = jest.fn().mockReturnValue({
				next: jest.fn()
					.mockResolvedValueOnce({ done: false, value: kvChange })
					.mockResolvedValue({ done: true }),
			});

			// Start watcher
			await kvTrigger.trigger.call(watcherFunctions);
			await new Promise(resolve => setTimeout(resolve, 50));

			// Verify change was emitted
			expect(watcherFunctions.emit).toHaveBeenCalledWith([
				[expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'config',
						key: 'app.settings',
						value: { theme: 'light' },
						revision: 2,
						operation: 'PUT',
					}),
				})],
			]);
		});

		it('should handle KV bucket operations', async () => {
			const kvNode = new NatsKv();

			// Test create bucket
			const createFunctions = createMockExecuteFunctions({
				operation: 'createBucket',
				bucket: 'new-bucket',
				bucketOptions: {
					history: 10,
					maxValueSize: 1024,
					ttl: 3600,
				},
			});

			// Mock the kv function to create bucket
			(kv as jest.Mock).mockResolvedValueOnce(mockKvStore);

			await kvNode.execute.call(createFunctions);

			expect(kv).toHaveBeenCalledWith(
				mockNc,
				'new-bucket',
				expect.objectContaining({
					history: 10,
					max_value_size: 1024,
					ttl: 3600000000000, // converted to nanos
				})
			);

			// Test delete bucket
			const deleteFunctions = createMockExecuteFunctions({
				operation: 'deleteBucket',
				bucket: 'old-bucket',
			});

			await kvNode.execute.call(deleteFunctions);

			expect(mockKvStore.destroy).toHaveBeenCalled();
		});
	});

	describe('Object Store Workflow', () => {
		it('should handle object storage operations', async () => {
			const objStore = new NatsObjectStore();
			const objTrigger = new NatsObjectStoreTrigger();

			// Test put object
			const putFunctions = createMockExecuteFunctions({
				operation: 'put',
				bucket: 'documents',
				name: 'report.pdf',
				data: 'base64encodeddata',
				options: { dataType: 'binary' },
			});

			await objStore.execute.call(putFunctions);

			expect(mockObjectStore.put).toHaveBeenCalledWith(
				expect.objectContaining({ name: 'report.pdf' }),
				expect.any(Uint8Array)
			);

			// Test get object
			const getFunctions = createMockExecuteFunctions({
				operation: 'get',
				bucket: 'documents',
				name: 'report.pdf',
				options: {},
			});

			const getResult = await objStore.execute.call(getFunctions);
			expect(getResult).toEqual([[{
				json: {
					bucket: 'documents',
					name: 'report.pdf',
					data: 'file content',
				},
			}]]);

			// Setup object watcher
			const watcherFunctions = createMockTriggerFunctions({
				bucket: 'documents',
				options: {},
			});

			// Mock object change event
			const objChange = {
				subject: '$O.documents.M.report.pdf',
				data: new Uint8Array(),
				headers: {
					get: jest.fn((key) => {
						const headers: Record<string, string> = {
							'X-Nats-Object-Size': '1024',
							'X-Nats-Object-Chunks': '1',
							'X-Nats-Object-Digest': 'sha256-abc123',
						};
						return headers[key];
					}),
				},
				ack: jest.fn(),
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockReturnValue({
				next: jest.fn()
					.mockResolvedValueOnce({ done: false, value: objChange })
					.mockResolvedValue({ done: true }),
			});

			// Start watcher
			await objTrigger.trigger.call(watcherFunctions);
			await new Promise(resolve => setTimeout(resolve, 50));

			// Verify change was emitted
			expect(watcherFunctions.emit).toHaveBeenCalledWith([
				[expect.objectContaining({
					json: expect.objectContaining({
						bucket: 'documents',
						operation: 'put',
						object: expect.objectContaining({
							name: 'report.pdf',
							size: 1024,
						}),
					}),
				})],
			]);
		});

		it('should handle object linking', async () => {
			const objStore = new NatsObjectStore();

			// Test link object
			const linkFunctions = createMockExecuteFunctions({
				operation: 'link',
				bucket: 'archives',
				name: 'report-2024.pdf',
				linkTarget: {
					bucket: 'documents',
					name: 'report.pdf',
				},
			});

			await objStore.execute.call(linkFunctions);

			expect(mockObjectStore.link).toHaveBeenCalledWith(
				'report-2024.pdf',
				{ name: 'report.pdf', bucket: 'documents' }
			);
		});
	});

	describe('Error Handling and Edge Cases', () => {
		it('should handle connection failures gracefully', async () => {
			(NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
				new Error('Connection refused')
			);

			const trigger = new NatsTrigger();
			const triggerFunctions = createMockTriggerFunctions({
				subject: 'test.subject',
				subscriptionType: 'core',
			});

			await expect(trigger.trigger.call(triggerFunctions))
				.rejects.toThrow('Connection refused');
		});

		it('should handle malformed messages', async () => {
			const trigger = new NatsTrigger();
			const triggerFunctions = createMockTriggerFunctions({
				subject: 'test.subject',
				subscriptionType: 'core',
				options: {},
			});

			// Mock subscription with malformed message
			const malformedMessage = {
				subject: 'test.subject',
				data: new Uint8Array([0xFF, 0xFE]), // Invalid UTF-8
				headers: undefined,
			};

			mockSubscription[Symbol.asyncIterator] = jest.fn().mockReturnValue({
				next: jest.fn()
					.mockResolvedValueOnce({ done: false, value: malformedMessage })
					.mockResolvedValue({ done: true }),
			});

			await trigger.trigger.call(triggerFunctions);
			await new Promise(resolve => setTimeout(resolve, 50));

			// Should still emit, but with string data
			expect(triggerFunctions.emit).toHaveBeenCalled();
		});

		it('should handle timeout scenarios', async () => {
			const requestReply = new NatsRequestReply();
			const requestFunctions = createMockExecuteFunctions({
				subject: 'slow.service',
				requestData: '{"test": "data"}',
				options: {
					timeout: 100, // 100ms timeout
					responseType: 'single',
				},
			});

			// Mock timeout
			(mockNc.request as jest.Mock).mockRejectedValue(
				new Error('Request timed out')
			);

			await expect(requestReply.execute.call(requestFunctions))
				.rejects.toThrow('Request timed out');
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
				
				const trigger = new NatsTrigger();
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
					})
				);
			}
		});
	});

	describe('Performance and Scalability', () => {
		it('should handle high message throughput', async () => {
			const trigger = new NatsTrigger();
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
				{ node: new NatsTrigger(), params: { subject: 'test' } },
				{ node: new NatsServiceReply(), params: { subject: 'api.test' } },
				{ node: new NatsService(), params: { subject: 'api.service', responseData: '{}' } },
				{ node: new NatsKvTrigger(), params: { bucket: 'test-bucket' } },
				{ node: new NatsObjectStoreTrigger(), params: { bucket: 'test-bucket' } },
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