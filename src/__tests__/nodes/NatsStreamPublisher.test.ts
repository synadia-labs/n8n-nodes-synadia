import { NatsStreamPublisher } from '../../nodes/NatsStreamPublisher/NatsStreamPublisher.node';
import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import * as NatsConnection from '../../utils/NatsConnection';
import { StringCodec, headers, jetstream } from '../../bundled/nats-bundled';

// Mock dependencies
jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled', () => ({
	jetstream: jest.fn(),
	jetstreamManager: jest.fn(),
	StringCodec: jest.fn(() => ({
		encode: jest.fn((str) => new TextEncoder().encode(str)),
		decode: jest.fn((data) => new TextDecoder().decode(data)),
	})),
	headers: jest.fn(() => ({
		append: jest.fn(),
		set: jest.fn(),
		get: jest.fn(),
	})),
	MsgHdrsImpl: jest.fn(() => ({
		append: jest.fn(),
		set: jest.fn(),
		get: jest.fn(),
	})),
}));

describe('NatsStreamPublisher', () => {
	let node: NatsStreamPublisher;
	let mockExecuteFunctions: IExecuteFunctions;
	let mockNatsConnection: any;
	let mockGetNodeParameter: jest.Mock;
	let mockGetInputData: jest.Mock;
	let mockContinueOnFail: jest.Mock;

	beforeEach(() => {
		node = new NatsStreamPublisher();

		// Mock NATS connection
		mockNatsConnection = {
			flush: jest.fn().mockResolvedValue(undefined),
		} as any;

		// Mock execute functions
		mockGetNodeParameter = jest.fn();
		mockGetInputData = jest.fn().mockReturnValue([{ json: { test: 'data' } }]);
		mockContinueOnFail = jest.fn().mockReturnValue(false);

		mockExecuteFunctions = {
			getInputData: mockGetInputData,
			getCredentials: jest
				.fn()
				.mockResolvedValue({ connectionType: 'url', servers: 'nats://localhost:4222' }),
			getNodeParameter: mockGetNodeParameter,
			getNode: jest.fn().mockReturnValue({
				id: 'test-node-id',
				name: 'Test Node',
				type: 'n8n-nodes-synadia.natsStreamPublisher',
				position: [0, 0],
				typeVersion: 1,
			}),
			continueOnFail: mockContinueOnFail,
			logger: {
				error: jest.fn(),
				warn: jest.fn(),
				info: jest.fn(),
				debug: jest.fn(),
			},
		} as unknown as IExecuteFunctions;

		// Mock createNatsConnection
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNatsConnection);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('JetStream Publishing', () => {
		it('should publish message to JetStream', async () => {
			const mockJs = {
				publish: jest.fn().mockResolvedValue({
					stream: 'TESTSTREAM',
					seq: 123,
					duplicate: false,
				}),
			};
			(jetstream as jest.Mock).mockReturnValue(mockJs);

			mockGetNodeParameter
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('{"hello": "jetstream"}') // data
				.mockReturnValueOnce({ headerValues: [] }); // headers

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockJs.publish).toHaveBeenCalledWith(
				'test.subject',
				'{"hello": "jetstream"}',
				expect.objectContaining({ headers: expect.any(Object) }),
			);
			expect(result[0][0].json).toMatchObject({
				success: true,
				subject: 'test.subject',
				stream: 'TESTSTREAM',
				sequence: 123,
				duplicate: false,
			});
		});

		it('should include headers when provided', async () => {
			const mockHeaders = { append: jest.fn(), set: jest.fn(), get: jest.fn() };
			(headers as jest.Mock).mockReturnValue(mockHeaders);

			const mockJs = {
				publish: jest.fn().mockResolvedValue({
					stream: 'TESTSTREAM',
					seq: 123,
					duplicate: false,
				}),
			};
			(jetstream as jest.Mock).mockReturnValue(mockJs);

			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({
					headerValues: [{ key: 'X-Custom', value: 'value' }],
				});

			await node.execute.call(mockExecuteFunctions);

			expect(mockJs.publish).toHaveBeenCalledWith(
				'test.subject',
				'{}',
				expect.objectContaining({ headers: expect.any(Object) }),
			);
		});
	});

	describe('Error Handling', () => {
		it('should validate subject', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('invalid subject') // Invalid subject with space
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({ headerValues: [] });

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Subject cannot contain spaces',
			);
		});

		it('should handle invalid JSON headers gracefully', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({ headerValues: 'invalid json' });

			const result = await node.execute.call(mockExecuteFunctions);
			expect(result[0][0].json).toMatchObject({
				success: true,
				subject: 'test.subject',
			});
		});

		it('should continue on fail when enabled', async () => {
			mockContinueOnFail.mockReturnValue(true);
			mockGetNodeParameter
				.mockReturnValueOnce('invalid subject')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({ headerValues: [] })
				.mockReturnValueOnce('invalid subject'); // For error handling

			const result = await node.execute.call(mockExecuteFunctions);
			expect(result[0][0].json).toMatchObject({
				error: 'Subject cannot contain spaces',
				subject: 'invalid subject',
			});
		});

		it('should handle connection errors', async () => {
			(NatsConnection.createNatsConnection as jest.Mock).mockRejectedValue(
				new Error('Connection failed'),
			);

			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({ headerValues: [] });

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'NATS Stream Publisher failed: Connection failed',
			);
		});

		it('should close connection on error', async () => {
			const mockJs = {
				publish: jest.fn().mockRejectedValue(new Error('Publish failed')),
			};
			(jetstream as jest.Mock).mockReturnValue(mockJs);

			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({ headerValues: [] });

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow();
			expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(
				mockNatsConnection,
				expect.any(Object),
			);
		});
	});

	describe('Multiple Items Processing', () => {
		it('should process multiple input items', async () => {
			const mockJs = {
				publish: jest
					.fn()
					.mockResolvedValueOnce({ stream: 'TESTSTREAM', seq: 1, duplicate: false })
					.mockResolvedValueOnce({ stream: 'TESTSTREAM', seq: 2, duplicate: false })
					.mockResolvedValueOnce({ stream: 'TESTSTREAM', seq: 3, duplicate: false }),
			};
			(jetstream as jest.Mock).mockReturnValue(mockJs);

			mockGetInputData.mockReturnValue([
				{ json: { item: 1 } },
				{ json: { item: 2 } },
				{ json: { item: 3 } },
			]);

			// Clear previous mocks and set up for 3 items
			mockGetNodeParameter.mockReset();
			mockGetNodeParameter.mockImplementation((param, index) => {
				if (param === 'subject') return `test.${index + 1}`;
				if (param === 'data') return `{"item": ${index + 1}}`;
				if (param === 'headers') return { headerValues: [] };
				return undefined;
			});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockJs.publish).toHaveBeenCalledTimes(3);
			expect(result[0]).toHaveLength(3);
		});
	});
});
