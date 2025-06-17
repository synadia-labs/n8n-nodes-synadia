import { ReplyHandler, ReplyHandlerContext } from './ReplyHandler';
import { IDataObject } from 'n8n-workflow';

export class AutomaticReplyHandler extends ReplyHandler {
	readonly mode = 'automatic';
	
	async processMessage(context: ReplyHandlerContext): Promise<void> {
		const { msg, parsedMessage, automaticReply } = context;
		
		if (!msg.reply || !automaticReply) {
			return;
		}
		
		try {
			// Process the response template
			let responseTemplate = automaticReply.responseTemplate as string || '{"success": true}';
			const requestData = parsedMessage.json.data;
			
			// Simple template replacement
			responseTemplate = this.processTemplate(responseTemplate, requestData);
			
			// Send the response
			const responseEncoding = automaticReply.responseEncoding || 'json';
			let responseData: Uint8Array;
			
			if (responseEncoding === 'json') {
				const response = JSON.parse(responseTemplate);
				responseData = new TextEncoder().encode(JSON.stringify(response));
				// Add sent response to output if requested
				if (automaticReply.includeRequestInOutput !== false) {
					parsedMessage.json.sentResponse = response;
				}
			} else {
				responseData = new TextEncoder().encode(responseTemplate);
				if (automaticReply.includeRequestInOutput !== false) {
					parsedMessage.json.sentResponse = responseTemplate;
				}
			}
			
			msg.respond(responseData);
		} catch (error: any) {
			// Send error response
			this.sendErrorResponse(msg, parsedMessage, automaticReply, error);
		}
	}
	
	private processTemplate(template: string, data: any): string {
		// Simple template replacement
		template = template
			.replace(/\{\{new Date\(\)\.toISOString\(\)\}\}/g, new Date().toISOString())
			.replace(/\{\{\$json\.data\}\}/g, JSON.stringify(data))
			.replace(/\{\{\$json\}\}/g, JSON.stringify(data));
		
		// Handle nested property access
		const propertyMatches = template.match(/\{\{\$json\.data\.([^}]+)\}\}/g);
		if (propertyMatches) {
			propertyMatches.forEach(match => {
				const propertyPath = match.match(/\{\{\$json\.data\.([^}]+)\}\}/)?.[1];
				if (propertyPath && data && typeof data === 'object') {
					const value = propertyPath.split('.').reduce((obj: any, key) => obj?.[key], data as any);
					template = template.replace(match, JSON.stringify(value ?? null));
				}
			});
		}
		
		return template;
	}
	
	private sendErrorResponse(msg: any, parsedMessage: any, automaticReply: IDataObject, error: Error): void {
		if (automaticReply.errorResponse) {
			try {
				const errorResp = JSON.parse(automaticReply.errorResponse as string);
				const errorData = new TextEncoder().encode(JSON.stringify(errorResp));
				msg.respond(errorData);
				if (parsedMessage.json) {
					(parsedMessage.json as any).sentResponse = errorResp;
					(parsedMessage.json as any).error = error.message;
				}
			} catch {
				// Send generic error
				const genericError = { error: 'Internal service error' };
				msg.respond(new TextEncoder().encode(JSON.stringify(genericError)));
				if (parsedMessage.json) {
					(parsedMessage.json as any).sentResponse = genericError;
					(parsedMessage.json as any).error = error.message;
				}
			}
		}
	}
}