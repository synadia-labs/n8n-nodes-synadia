import {INodeExecutionData, ApplicationError, IDataObject} from 'n8n-workflow';
import { Msg, MsgHdrs, MsgHdrsImpl } from '../bundled/nats-bundled';

export interface NatsMessage {
	subject: string;
	data: any;
	headers?: Record<string, string>;
	replyTo?: string;
}

export function parseNatsMessage(msg: Msg): INodeExecutionData {
	const result: INodeExecutionData = {
		json: {
			subject: msg.subject,
			data: msg.data,
			replyTo: msg.reply,
			timestamp: new Date().toISOString(),
		},
	};
	
	// Add seq if it exists (JetStream messages)
	if ('seq' in msg && msg.seq !== undefined) {
		result.json.seq = msg.seq;
	}

	// Add headers if present
	if (msg.headers) {
		const headersObj: Record<string, string> = {};
		for (const [key, value] of msg.headers) {
			headersObj[key] = Array.isArray(value) ? value.join(',') : value;
		}
		result.json.headers = headersObj;
	}

	return result;
}

export function encodeData(data: any): Uint8Array {
	// Always encode as JSON - keep it simple
	return new TextEncoder().encode(JSON.stringify(data));
}

export function createNatsHeaders(headers: IDataObject): MsgHdrs {
	const values = headers.headerValues as IDataObject[];
	const result = new MsgHdrsImpl();
	if (values !== undefined) {
		for (const value of values) {
			//@ts-ignore
			result.append(value.key, value.value);
		}
	}
	return new MsgHdrsImpl()
}

export function validateSubject(subject: string): void {
	if (!subject || subject.trim() === '') {
		throw new ApplicationError('Subject cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}
	
	// Check for invalid characters
	if (subject.includes(' ')) {
		throw new ApplicationError('Subject cannot contain spaces', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}
	
	// NATS subjects can contain alphanumeric characters and . * > _
	const validPattern = /^[a-zA-Z0-9.*>_-]+$/;
	if (!validPattern.test(subject)) {
		throw new ApplicationError('Subject contains invalid characters. Valid characters are: a-z, A-Z, 0-9, ., *, >, _, -', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}
}

