import { Logger, INode, LogMetadata } from 'n8n-workflow';

/**
 * A logger wrapper that automatically includes node context in all log messages.
 * This allows utility functions to have node-aware logging without needing to pass the node separately.
 */
export class NodeLogger implements Logger {
	constructor(
		private readonly logger: Logger,
		private readonly node: INode,
	) {}

	/**
	 * Get the node associated with this logger.
	 * Useful for error handling that needs node context.
	 */
	getNode(): INode {
		return this.node;
	}

	error(message: string, metadata?: LogMetadata): void {
		this.logger.error(message, {
			...metadata,
			nodeId: this.node.id,
			nodeName: this.node.name,
			nodeType: this.node.type,
		});
	}

	warn(message: string, metadata?: LogMetadata): void {
		this.logger.warn(message, {
			...metadata,
			nodeId: this.node.id,
			nodeName: this.node.name,
			nodeType: this.node.type,
		});
	}

	info(message: string, metadata?: LogMetadata): void {
		this.logger.info(message, {
			...metadata,
			nodeId: this.node.id,
			nodeName: this.node.name,
			nodeType: this.node.type,
		});
	}

	debug(message: string, metadata?: LogMetadata): void {
		this.logger.debug(message, {
			...metadata,
			nodeId: this.node.id,
			nodeName: this.node.name,
			nodeType: this.node.type,
		});
	}
}