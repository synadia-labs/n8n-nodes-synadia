import { NatsPublisher } from '../../nodes/NatsPublisher/NatsPublisher.node';
import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import * as NatsConnection from '../../utils/NatsConnection';
import { StringCodec, headers } from '../../bundled/nats-bundled';

// Mock dependencies
jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled', () => ({
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

describe('NatsPublisher', () => {
	let node: NatsPublisher;
	let mockExecuteFunctions: IExecuteFunctions;
	let mockNatsConnection: any;
	let mockGetNodeParameter: jest.Mock;
	let mockGetInputData: jest.Mock;
	let mockContinueOnFail: jest.Mock;

	beforeEach(() => {
		node = new NatsPublisher();

		// Mock NATS connection
		mockNatsConnection = {
			publish: jest.fn(),
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
				type: 'n8n-nodes-synadia.natsPublisher',
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

	describe('Core NATS Publishing', () => {
		it('should publish message to Core NATS', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('{"hello": "world"}') // data
				.mockReturnValueOnce({}) // options
				.mockReturnValueOnce({ headerValues: [] }); // headers

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockNatsConnection.publish).toHaveBeenCalledWith(
				'test.subject',
				'{"hello": "world"}',
				expect.objectContaining({ headers: expect.any(Object) }),
			);
			expect(mockNatsConnection.flush).toHaveBeenCalled();
			expect(result[0][0].json).toMatchObject({
				success: true,
				subject: 'test.subject',
				timestamp: expect.any(String),
			});
		});

		it('should handle plain string messages', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('plain text message')
				.mockReturnValueOnce({})
				.mockReturnValueOnce({ headerValues: [] });

			await node.execute.call(mockExecuteFunctions);

			const publishCall = (mockNatsConnection.publish as jest.Mock).mock.calls[0];
			expect(publishCall[1]).toBe('plain text message');
		});

		it('should include headers when provided', async () => {
			const mockHeaders = { append: jest.fn(), set: jest.fn(), get: jest.fn() };
			(headers as jest.Mock).mockReturnValue(mockHeaders);

			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({})
				.mockReturnValueOnce({
					headerValues: [{ key: 'X-Custom', value: 'value' }],
				});

			await node.execute.call(mockExecuteFunctions);

			expect(mockNatsConnection.publish).toHaveBeenCalledWith(
				'test.subject',
				'{}',
				expect.objectContaining({ headers: expect.any(Object) }),
			);
		});

		it('should handle reply-to option', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({ replyTo: 'reply.subject' })
				.mockReturnValueOnce({ headerValues: [] });

			await node.execute.call(mockExecuteFunctions);

			expect(mockNatsConnection.publish).toHaveBeenCalledWith(
				'test.subject',
				'{}',
				expect.objectContaining({ reply: 'reply.subject' }),
			);
		});
	});

	describe('Error Handling', () => {
		it('should validate subject', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('invalid subject') // Invalid subject with space
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({})
				.mockReturnValueOnce({ headerValues: [] });

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Subject cannot contain spaces',
			);
		});

		it('should handle invalid JSON headers gracefully', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({})
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
				.mockReturnValueOnce({})
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
				.mockReturnValueOnce({})
				.mockReturnValueOnce({ headerValues: [] });

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'NATS publish failed: Connection failed',
			);
		});

		it('should close connection on error', async () => {
			mockNatsConnection.publish = jest.fn().mockImplementation(() => {
				throw new Error('Publish failed');
			});

			mockGetNodeParameter
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('{}')
				.mockReturnValueOnce({})
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
				if (param === 'options') return {};
				if (param === 'headers') return { headerValues: [] };
				return undefined;
			});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(mockNatsConnection.publish).toHaveBeenCalledTimes(3);
			expect(result[0]).toHaveLength(3);
		});
	});
});
