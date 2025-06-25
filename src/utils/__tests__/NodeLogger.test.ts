import { NodeLogger } from '../NodeLogger';
import { Logger, INode, LogMetadata } from 'n8n-workflow';

describe('NodeLogger', () => {
	let mockLogger: jest.Mocked<Logger>;
	let mockNode: INode;
	let nodeLogger: NodeLogger;

	beforeEach(() => {
		mockLogger = {
			error: jest.fn(),
			warn: jest.fn(),
			info: jest.fn(),
			debug: jest.fn(),
		};

		mockNode = {
			id: 'test-node-id',
			name: 'Test Node',
			type: 'test.node',
			position: [100, 200],
			typeVersion: 1,
			parameters: {},
		};

		nodeLogger = new NodeLogger(mockLogger, mockNode);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getNode', () => {
		it('should return the node instance', () => {
			expect(nodeLogger.getNode()).toBe(mockNode);
		});
	});

	describe('error', () => {
		it('should call logger.error with node metadata', () => {
			const message = 'Test error message';
			const metadata: LogMetadata = { customField: 'value' };

			nodeLogger.error(message, metadata);

			expect(mockLogger.error).toHaveBeenCalledWith(message, {
				customField: 'value',
				nodeId: 'test-node-id',
				nodeName: 'Test Node',
				nodeType: 'test.node',
			});
		});

		it('should call logger.error without custom metadata', () => {
			const message = 'Test error message';

			nodeLogger.error(message);

			expect(mockLogger.error).toHaveBeenCalledWith(message, {
				nodeId: 'test-node-id',
				nodeName: 'Test Node',
				nodeType: 'test.node',
			});
		});
	});

	describe('warn', () => {
		it('should call logger.warn with node metadata', () => {
			const message = 'Test warning message';
			const metadata: LogMetadata = { level: 'medium' };

			nodeLogger.warn(message, metadata);

			expect(mockLogger.warn).toHaveBeenCalledWith(message, {
				level: 'medium',
				nodeId: 'test-node-id',
				nodeName: 'Test Node',
				nodeType: 'test.node',
			});
		});
	});

	describe('info', () => {
		it('should call logger.info with node metadata', () => {
			const message = 'Test info message';
			const metadata: LogMetadata = { operation: 'create' };

			nodeLogger.info(message, metadata);

			expect(mockLogger.info).toHaveBeenCalledWith(message, {
				operation: 'create',
				nodeId: 'test-node-id',
				nodeName: 'Test Node',
				nodeType: 'test.node',
			});
		});
	});

	describe('debug', () => {
		it('should call logger.debug with node metadata', () => {
			const message = 'Test debug message';
			const metadata: LogMetadata = { details: 'verbose' };

			nodeLogger.debug(message, metadata);

			expect(mockLogger.debug).toHaveBeenCalledWith(message, {
				details: 'verbose',
				nodeId: 'test-node-id',
				nodeName: 'Test Node',
				nodeType: 'test.node',
			});
		});
	});

	describe('instanceof checks', () => {
		it('should be instanceof NodeLogger', () => {
			expect(nodeLogger).toBeInstanceOf(NodeLogger);
		});

		it('should work with instanceof in conditional statements', () => {
			const logger: Logger = nodeLogger;
			
			if (logger instanceof NodeLogger) {
				// This should execute
				expect(logger.getNode()).toBe(mockNode);
			} else {
				fail('NodeLogger instance check failed');
			}
		});
	});
});