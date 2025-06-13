import { INodeExecutionData } from 'n8n-workflow';
import { Msg, headers } from 'nats';

export interface NatsMessage {
	subject: string;
	data: any;
	headers?: Record<string, string>;
	replyTo?: string;
}

export function parseNatsMessage(msg: Msg): INodeExecutionData {
	let data: any;
	const rawData = msg.data;
	
	// Try to parse as JSON first
	try {
		if (rawData.length > 0) {
			data = JSON.parse(new TextDecoder().decode(rawData));
		} else {
			data = '';
		}
	} catch {
		// If not JSON, return as string
		data = new TextDecoder().decode(rawData);
	}

	const result: INodeExecutionData = {
		json: {
			subject: msg.subject,
			data,
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

export function encodeMessage(data: any, encoding: 'json' | 'string' | 'binary' = 'json'): Uint8Array {
	switch (encoding) {
		case 'json':
			return new TextEncoder().encode(JSON.stringify(data));
		case 'string':
			return new TextEncoder().encode(String(data));
		case 'binary':
			if (data instanceof Uint8Array) {
				return data;
			} else if (typeof data === 'string') {
				// Assume base64 encoded string
				return Uint8Array.from(atob(data), c => c.charCodeAt(0));
			} else {
				throw new Error('Binary encoding requires Uint8Array or base64 string');
			}
		default:
			throw new Error(`Unsupported encoding: ${encoding}`);
	}
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
		throw new Error('Subject cannot be empty');
	}
	
	// Check for invalid characters
	if (subject.includes(' ')) {
		throw new Error('Subject cannot contain spaces');
	}
	
	// NATS subjects can contain alphanumeric characters and . * > _
	const validPattern = /^[a-zA-Z0-9.*>_-]+$/;
	if (!validPattern.test(subject)) {
		throw new Error('Subject contains invalid characters. Valid characters are: a-z, A-Z, 0-9, ., *, >, _, -');
	}
}

export function parseMessage(data: Uint8Array, encoding: 'auto' | 'json' | 'string' | 'binary' = 'auto'): any {
	const stringData = new TextDecoder().decode(data);
	
	if (encoding === 'binary') {
		return Buffer.from(data).toString('base64');
	}
	
	if (encoding === 'string') {
		return stringData;
	}
	
	if (encoding === 'json' || encoding === 'auto') {
		try {
			return JSON.parse(stringData);
		} catch {
			if (encoding === 'json') {
				throw new Error('Failed to parse JSON');
			}
			// Auto mode: fallback to string
			return stringData;
		}
	}
	
	return stringData;
}