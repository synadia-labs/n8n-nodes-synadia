import { Msg } from '../../bundled/nats-bundled';
import { IDataObject } from 'n8n-workflow';

export interface ReplyHandlerContext {
	msg: Msg;
	parsedMessage: any; // Using any to avoid type issues with IDataObject
	automaticReply?: IDataObject;
	replyOptions?: IDataObject;
	pendingMessages?: Map<string, Msg>;
}

export abstract class ReplyHandler {
	abstract readonly mode: string;
	
	abstract processMessage(context: ReplyHandlerContext): Promise<void>;
	
	cleanup?(): void; // Make cleanup optional
}