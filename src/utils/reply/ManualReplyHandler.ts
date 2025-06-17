import { ReplyHandler, ReplyHandlerContext } from './ReplyHandler';
import { Msg, StringCodec } from '../../bundled/nats-bundled';
import { INodeExecutionData } from 'n8n-workflow';
import { encodeMessage, createNatsHeaders } from '../NatsHelpers';

export class ManualReplyHandler extends ReplyHandler {
	readonly mode = 'manual';
	private pendingMessages: Map<string, Msg>;
	
	constructor() {
		super();
		this.pendingMessages = new Map();
	}
	
	async processMessage(context: ReplyHandlerContext): Promise<void> {
		const { msg, parsedMessage } = context;
		
		if (!msg.reply) {
			return;
		}
		
		// Generate unique ID for this request
		const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		parsedMessage.json.requestId = requestId;
		this.pendingMessages.set(requestId, msg);
	}
	
	async sendReply(items: INodeExecutionData[], replyOptions: any, logger?: any): Promise<void> {
		// Process each item
		for (const item of items) {
			const requestId = item.json.requestId as string;
			const msg = this.pendingMessages.get(requestId);
			
			if (msg && msg.reply) {
				try {
					// Determine reply data
					let replyData: any;
					const replyField = (replyOptions.replyField as string) || 'reply';
					
					// Check if reply field exists
					if ((item.json as any)[replyField] !== undefined) {
						replyData = (item.json as any)[replyField];
					} else {
						// Use entire output minus internal fields
						const { requestId: _, ...cleanReply } = item.json;
						// Remove internal fields
						delete cleanReply.subject;
						delete cleanReply.data;
						delete cleanReply.headers;
						delete cleanReply.replyTo;
						delete cleanReply.timestamp;
						delete cleanReply.seq;
						
						// Use clean reply or default reply
						if (Object.keys(cleanReply).length === 0) {
							replyData = replyOptions.defaultReply || '{"success": true}';
							if (typeof replyData === 'string') {
								try {
									replyData = JSON.parse(replyData);
								} catch {
									// Keep as string
								}
							}
						} else {
							replyData = cleanReply;
						}
					}
					
					// Include request if option is set
					if (replyOptions.includeRequest && item.json.data) {
						replyData = {
							request: item.json.data,
							response: replyData,
						};
					}
					
					// Extract custom headers if provided
					let replyHeaders;
					if (item.json.replyHeaders && typeof item.json.replyHeaders === 'object') {
						replyHeaders = createNatsHeaders(item.json.replyHeaders as Record<string, string>);
					}
					
					// Encode and send reply
					const encodedReply = encodeMessage(replyData, replyOptions.replyEncoding as any || 'json');
					msg.respond(encodedReply, { headers: replyHeaders });
					
					// Remove from pending
					this.pendingMessages.delete(requestId);
					
				} catch (error: any) {
					if (logger) {
						logger.error('Error sending reply:', error);
					}
					// Try to send error reply
					if (msg.reply) {
						try {
							const errorReply = JSON.stringify({ error: error.message });
							const sc = StringCodec();
							msg.respond(sc.encode(errorReply));
						} catch {
							// Ignore reply errors
						}
					}
				}
			}
		}
	}
	
	cleanup(): void {
		this.pendingMessages.clear();
	}
	
	getPendingMessages(): Map<string, Msg> {
		return this.pendingMessages;
	}
}