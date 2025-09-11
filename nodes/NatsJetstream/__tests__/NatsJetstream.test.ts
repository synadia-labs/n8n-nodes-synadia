// Mock dependencies first
jest.mock('../../../utils/NatsConnection');
jest.mock('../../../utils/NatsHelpers', () => ({
	createNatsHeaders: jest.fn().mockReturnValue({}),
	validateSubject: jest.fn().mockImplementation((subject) => {
		if (subject.includes(' ')) {
			throw new Error('Subject cannot contain spaces');
		}
	}),
}));

import { NatsJetstream } from '../NatsJetstream.node';
import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import * as NatsConnection from '../../../utils/NatsConnection';
jest.mock('../../../bundled/nats-bundled', () => ({
	jetstream: jest.fn(),
	jetstreamManager: jest.fn(),
	headers: jest.fn(() => ({
		append: jest.fn(),
		set: jest.fn(),
		get: jest.fn(),
	})),
	MsgHdrsImpl: jest.fn().mockImplementation(() => ({
		append: jest.fn(),
		set: jest.fn(),
		get: jest.fn(),
	})),
}));

describe('NatsJetstream', () => {
	let node: NatsJetstream;
	let mockExecuteFunctions: IExecuteFunctions;
	let mockNatsConnection: any;
	let mockJetStream: any;
	let mockJetStreamManager: any;
	let mockGetNodeParameter: jest.Mock;
	let mockGetInputData: jest.Mock;
	let mockGetCredentials: jest.Mock;

	beforeEach(() => {
		node = new NatsJetstream();

		// Mock JetStream Manager
		mockJetStreamManager = {
			streams: {
				add: jest.fn().mockResolvedValue({ config: { name: 'TEST_STREAM' } }),
				delete: jest.fn().mockResolvedValue(true),
				info: jest.fn().mockResolvedValue({ config: { name: 'TEST_STREAM' } }),
				list: jest.fn().mockResolvedValue([{ config: { name: 'TEST_STREAM' } }]),
				purge: jest.fn().mockResolvedValue({ purged: 100 }),
				update: jest.fn().mockResolvedValue({ config: { name: 'TEST_STREAM' } }),
			},
			consumers: {
				add: jest.fn().mockResolvedValue({ stream_name: 'TEST_STREAM', name: 'test-consumer' }),
				delete: jest.fn().mockResolvedValue(true),
				info: jest.fn().mockResolvedValue({ stream_name: 'TEST_STREAM', name: 'test-consumer' }),
				list: jest.fn().mockResolvedValue([{ stream_name: 'TEST_STREAM', name: 'test-consumer' }]),
			},
		};

		// Mock JetStream
		mockJetStream = {
			publish: jest.fn().mockResolvedValue({
				stream: 'TEST_STREAM',
				seq: 1,
				duplicate: false,
				domain: 'test',
			}),
		};

		// Mock NATS Connection
		mockNatsConnection = {
			close: jest.fn(),
			closed: jest.fn().mockResolvedValue(undefined),
			flush: jest.fn().mockResolvedValue(undefined),
		};

		// Setup parameter mocking
		mockGetNodeParameter = jest.fn();
		mockGetInputData = jest.fn().mockReturnValue([{ json: { test: 'data' } }]);
		mockGetCredentials = jest.fn().mockResolvedValue({
			serverUrls: 'nats://localhost:4222',
		});

		mockExecuteFunctions = {
			getNode: jest.fn(() => ({ id: 'test-node-id', name: 'Test Node' })),
			getNodeParameter: mockGetNodeParameter,
			getCredentials: mockGetCredentials,
			getInputData: mockGetInputData,
			continueOnFail: jest.fn(() => false),
			logger: {
				error: jest.fn(),
				warn: jest.fn(),
				info: jest.fn(),
				debug: jest.fn(),
			} as any,
		} as unknown as IExecuteFunctions;

		// Setup mocks
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNatsConnection);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);

		const { jetstream, jetstreamManager } = require('../../../bundled/nats-bundled');
		jetstream.mockReturnValue(mockJetStream);
		jetstreamManager.mockResolvedValue(mockJetStreamManager);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Stream Operations', () => {
		beforeEach(() => {
			mockGetNodeParameter
				.mockReturnValueOnce('stream') // resource
				.mockReturnValueOnce('create') // operation
				.mockReturnValueOnce('TEST_STREAM') // streamName
				.mockReturnValueOnce('') // subject (not used for create)
				.mockReturnValueOnce({
					// streamConfig
					subjects: ['test.>'],
					storage: 'file',
					retention: 'limits',
				});
		});

		it('should create a stream successfully', async () => {
			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				config: { name: 'TEST_STREAM' },
			});
			expect(mockJetStreamManager.streams.add).toHaveBeenCalledWith({
				name: 'TEST_STREAM',
				subjects: ['test.>'],
				storage: 'file',
				retention: 'limits',
			});
		});

		it('should handle stream operation errors', async () => {
			mockJetStreamManager.streams.add.mockRejectedValue(new Error('Stream already exists'));

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(NodeOperationError);
		});
	});

	describe('Message Operations', () => {
		beforeEach(() => {
			mockGetNodeParameter
				.mockReturnValueOnce('messages') // resource
				.mockReturnValueOnce('publish') // operation
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('{"message": "test"}') // data
				.mockReturnValueOnce({ headerValues: [] }) // headers
				.mockReturnValueOnce({}); // options
		});

		it('should publish a message successfully', async () => {
			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				success: true,
				stream: 'TEST_STREAM',
				seq: 1,
				duplicate: false,
				domain: 'test',
				timestamp: expect.any(String),
			});
			expect(mockJetStream.publish).toHaveBeenCalled();
		});

		// Subject validation is tested in NatsHelpers.test.ts
	});

	describe('Consumer Operations', () => {
		beforeEach(() => {
			mockGetNodeParameter
				.mockReturnValueOnce('consumers') // resource
				.mockReturnValueOnce('create') // operation
				.mockReturnValueOnce('TEST_STREAM') // streamName
				.mockReturnValueOnce('') // consumerName (not used for create)
				.mockReturnValueOnce({
					// consumerConfig
					name: 'test-consumer',
					durable_name: 'test-consumer',
					ack_policy: 'explicit',
				});
		});

		it('should create a consumer successfully', async () => {
			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				stream_name: 'TEST_STREAM',
				name: 'test-consumer',
			});
			expect(mockJetStreamManager.consumers.add).toHaveBeenCalledWith('TEST_STREAM', {
				name: 'test-consumer',
				durable_name: 'test-consumer',
				ack_policy: 'explicit',
			});
		});
	});

	describe('Error Handling', () => {
		it('should handle unknown resource types', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('unknown') // resource
				.mockReturnValueOnce('operation');

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(NodeOperationError);
		});

		it('should handle unknown operations', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('stream') // resource
				.mockReturnValueOnce('unknown') // operation
				.mockReturnValueOnce('TEST_STREAM');

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow();
		});

		it('should handle continue on fail', async () => {
			mockExecuteFunctions.continueOnFail = jest.fn(() => true);

			// Mock parameters that will be called multiple times
			mockGetNodeParameter.mockImplementation((paramName, index) => {
				if (paramName === 'resource') return 'stream';
				if (paramName === 'operation') return 'unknown';
				if (paramName === 'streamName') return 'TEST_STREAM';
				if (paramName === 'subject') return '';
				if (paramName === 'streamConfig') return {};
				return undefined;
			});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				error: 'Unknown stream operation: unknown',
				resource: 'stream',
				operation: 'unknown',
			});
		});
	});

	describe('Connection Management', () => {
		it('should create and close NATS connection', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('messages') // resource
				.mockReturnValueOnce('publish') // operation
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('test data') // data
				.mockReturnValueOnce({ headerValues: [] }) // headers
				.mockReturnValueOnce({}); // options

			await node.execute.call(mockExecuteFunctions);

			expect(NatsConnection.createNatsConnection).toHaveBeenCalledWith(
				{ serverUrls: 'nats://localhost:4222' },
				expect.any(Object),
			);
			expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(
				mockNatsConnection,
				expect.any(Object),
			);
		});

		it('should flush messages before closing connection', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('messages') // resource
				.mockReturnValueOnce('publish') // operation
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('test data') // data
				.mockReturnValueOnce({ headerValues: [] }) // headers
				.mockReturnValueOnce({}); // options

			await node.execute.call(mockExecuteFunctions);

			expect(mockNatsConnection.flush).toHaveBeenCalled();
		});
	});
});
