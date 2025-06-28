import { INodeExecutionData, ApplicationError } from 'n8n-workflow';
import { Msg, headers } from '../bundled/nats-bundled';

export interface NatsMessage {
	subject: string;
	data: any;
	headers?: Record<string, string>;
	replyTo?: string;
}

export function parseNatsMessage(msg: Msg): INodeExecutionData {
	// Store raw data as-is without any automatic parsing or decoding
	const rawData = msg.data;

	const result: INodeExecutionData = {
		json: {
			subject: msg.subject,
			data: rawData,
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

export function encodeMessage(data: any): Uint8Array {
	// Always encode as JSON for outbound messages - keep it simple
	return new TextEncoder().encode(JSON.stringify(data));
}

export function createNatsHeaders(headersObj?: Record<string, string>): any {
	if (!headersObj || Object.keys(headersObj).length === 0) {
		return undefined;
	}
	
	const h = headers();
	for (const [key, value] of Object.entries(headersObj)) {
		h.append(key, value);
	}
	return h;
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

// Removed parseMessage function - data should be handled raw without forced parsing

export function encodeKvValue(value: any): Uint8Array {
	// Always encode KV values as JSON - keep it simple
	return new TextEncoder().encode(JSON.stringify(value));
}

// Removed decodeKvValue function - KV data should be handled raw without automatic parsing