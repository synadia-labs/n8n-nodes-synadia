import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { StringCodec, Empty, createInbox, headers, jetstream } from '../../bundled/nats-bundled';
import { NatsRequestReply } from '../NatsRequestReply.node';
import * as NatsConnection from '../../utils/NatsConnection';

jest.mock('../../utils/NatsConnection');
jest.mock('../../bundled/nats-bundled', () => ({
	jetstream: jest.fn(),
	jetstreamManager: jest.fn(),
	Kvm: jest.fn(),
	Objm: jest.fn(),
	consumerOpts: jest.fn(() => ({
		deliverAll: jest.fn().mockReturnThis(),
		deliverNew: jest.fn().mockReturnThis(),
		deliverLast: jest.fn().mockReturnThis(),
		deliverLastPerSubject: jest.fn().mockReturnThis(),
		ackExplicit: jest.fn().mockReturnThis(),
		manualAck: jest.fn().mockReturnThis(),
		bind: jest.fn().mockReturnThis(),
		build: jest.fn().mockReturnValue({}),
	})),
	StringCodec: jest.fn(() => ({
		encode: jest.fn((str) => new TextEncoder().encode(str)),
		decode: jest.fn((data) => new TextDecoder().decode(data)),
	})),
	Empty: new Uint8Array(0),
	createInbox: jest.fn(() => '_INBOX.test'),
	headers: jest.fn(() => ({
		append: jest.fn(),
		set: jest.fn(),
		get: jest.fn(),
	})),
}));

describe('NatsRequestReply Node', () => {
	let node: NatsRequestReply;
	let mockExecuteFunctions: IExecuteFunctions;
	let mockNc: any;
	
	beforeEach(() => {
		jest.clearAllMocks();
		
		node = new NatsRequestReply();
		
		// Mock NATS connection
		mockNc = {
			request: jest.fn(),
			requestMany: jest.fn(),
			publish: jest.fn(),
			flush: jest.fn().mockResolvedValue(undefined),
		};
		
		// Mock execute functions
		mockExecuteFunctions = {
			getInputData: jest.fn().mockReturnValue([{ json: { test: 'data' } }]),
			getNodeParameter: jest.fn() as jest.MockedFunction<IExecuteFunctions['getNodeParameter']>,
			getCredentials: jest.fn().mockResolvedValue({}),
			getNode: jest.fn().mockReturnValue({}),
			helpers: {
				returnJsonArray: jest.fn((data) => data),
			},
			continueOnFail: jest.fn().mockReturnValue(false),
			logger: {
				error: jest.fn(),
			},
		} as any;
		
		(NatsConnection.createNatsConnection as jest.Mock).mockResolvedValue(mockNc);
		(NatsConnection.closeNatsConnection as jest.Mock).mockResolvedValue(undefined);
	});
	
	describe('execute', () => {
		it('should send request and receive single reply', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('{"test": "request"}') // requestData
				.mockReturnValueOnce({ // options
					timeout: 5000,
					requestEncoding: 'json',
					responseEncoding: 'auto',
				});
			
			const mockResponse = {
				data: new TextEncoder().encode('{"result": "success"}'),
				subject: '_INBOX.123',
				headers: undefined,
			};
			mockNc.request.mockResolvedValue(mockResponse);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockNc.request).toHaveBeenCalledWith(
				'test.subject',
				expect.any(Uint8Array),
				expect.objectContaining({
					timeout: 5000,
				})
			);
			
			expect(result[0][0].json).toMatchObject({
				success: true,
				subject: 'test.subject',
				request: { test: 'request' },
				response: { result: 'success' },
			});
		});
		
		it('should send request without waiting for reply', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('test message') // requestData
				.mockReturnValueOnce({ // options
					noReply: true,
					requestEncoding: 'string',
				});
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockNc.publish).toHaveBeenCalledWith(
				'test.subject',
				expect.any(Uint8Array),
				expect.any(Object)
			);
			
			expect(mockNc.request).not.toHaveBeenCalled();
			
			expect(result[0][0].json).toMatchObject({
				success: true,
				subject: 'test.subject',
				request: 'test message',
				replyExpected: false,
			});
		});
		
		it('should handle multiple replies (scatter-gather)', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('{"query": "all"}') // requestData
				.mockReturnValueOnce({ // options
					timeout: 3000,
					maxReplies: 3,
					requestEncoding: 'json',
					responseEncoding: 'json',
				});
			
			const mockReplies = [
				{
					data: new TextEncoder().encode('{"server": 1}'),
					subject: '_INBOX.123',
					headers: undefined,
				},
				{
					data: new TextEncoder().encode('{"server": 2}'),
					subject: '_INBOX.124',
					headers: undefined,
				},
			];
			
			// Mock async iterator
			const mockIterator = {
				[Symbol.asyncIterator]: async function* () {
					for (const reply of mockReplies) {
						yield reply;
					}
				},
			};
			mockNc.requestMany.mockResolvedValue(mockIterator);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockNc.requestMany).toHaveBeenCalledWith(
				'test.subject',
				expect.any(Uint8Array),
				expect.objectContaining({
					maxMessages: 3,
					maxWait: 3000,
				})
			);
			
			expect(result[0][0].json).toMatchObject({
				success: true,
				subject: 'test.subject',
				request: { query: 'all' },
				repliesReceived: 2,
				maxReplies: 3,
			});
			expect(result[0][0].json.replies).toHaveLength(2);
		});
		
		it('should handle custom headers', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('test') // requestData
				.mockReturnValueOnce({ // options
					headers: '{"X-Request-ID": "12345"}',
					requestEncoding: 'string',
				});
			
			const mockResponse = {
				data: new TextEncoder().encode('response'),
				subject: '_INBOX.123',
				headers: new Map([['X-Response-ID', '54321']]),
			};
			mockNc.request.mockResolvedValue(mockResponse);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(mockNc.request).toHaveBeenCalledWith(
				'test.subject',
				expect.any(Uint8Array),
				expect.objectContaining({
					headers: expect.any(Object),
				})
			);
			
			expect(result[0][0].json.responseHeaders).toEqual({
				'X-Response-ID': '54321',
			});
		});
		
		it('should handle timeout error', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('test') // requestData
				.mockReturnValueOnce({ timeout: 1000 }); // options
			
			const timeoutError = new Error('Request timeout');
			(timeoutError as any).code = 'TIMEOUT';
			mockNc.request.mockRejectedValue(timeoutError);
			
			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Request timeout after 1000ms for subject: test.subject'
			);
		});
		
		it('should handle no responders error', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce('test') // requestData
				.mockReturnValueOnce({}); // options
			
			const noRespondersError = new Error('No responders');
			(noRespondersError as any).code = 'NO_RESPONDERS';
			mockNc.request.mockRejectedValue(noRespondersError);
			
			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'No responders available for subject: test.subject'
			);
		});
		
		it('should handle binary data', async () => {
			const binaryData = Buffer.from('binary content').toString('base64');
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test.subject') // subject
				.mockReturnValueOnce(binaryData) // requestData
				.mockReturnValueOnce({ // options
					requestEncoding: 'binary',
					responseEncoding: 'binary',
				});
			
			const mockResponse = {
				data: Buffer.from('binary response'),
				subject: '_INBOX.123',
				headers: undefined,
			};
			mockNc.request.mockResolvedValue(mockResponse);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(result[0][0].json.response).toBe(
				Buffer.from('binary response').toString('base64')
			);
		});
		
		it('should validate subject format', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('invalid subject') // subject with space
				.mockReturnValueOnce('test') // requestData
				.mockReturnValueOnce({}); // options
			
			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Subject cannot contain spaces'
			);
		});
		
		it('should close connection on completion', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('test')
				.mockReturnValueOnce({ noReply: true });
			
			await node.execute.call(mockExecuteFunctions);
			
			expect(mockNc.flush).toHaveBeenCalled();
			expect(NatsConnection.closeNatsConnection).toHaveBeenCalledWith(mockNc);
		});
		
		it('should handle continueOnFail option', async () => {
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);
			(mockExecuteFunctions.getInputData as jest.Mock).mockReturnValue([
				{ json: { test: 'data1' } },
				{ json: { test: 'data2' } },
			]);
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('test.subject')
				.mockReturnValueOnce('test1')
				.mockReturnValueOnce({})
				.mockReturnValueOnce('invalid subject') // will fail
				.mockReturnValueOnce('test2')
				.mockReturnValueOnce({});
			
			const mockResponse = {
				data: new TextEncoder().encode('ok'),
				subject: '_INBOX.123',
				headers: undefined,
			};
			mockNc.request.mockResolvedValue(mockResponse);
			
			const result = await node.execute.call(mockExecuteFunctions);
			
			expect(result[0]).toHaveLength(2);
			expect(result[0][0].json.success).toBe(true);
			expect(result[0][1].json.error).toContain('Subject cannot contain spaces');
		});
	});
});