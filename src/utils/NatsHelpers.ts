import { INodeExecutionData, ApplicationError } from 'n8n-workflow';
import { Msg, headers } from '../bundled/nats-bundled';

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
				throw new ApplicationError('Binary encoding requires Uint8Array or base64 string', {
					level: 'warning',
					tags: { nodeType: 'n8n-nodes-synadia.nats' },
				});
			}
		default:
			throw new ApplicationError(`Unsupported encoding: ${encoding}`, {
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.nats' },
			});
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
				throw new ApplicationError('Failed to parse JSON', {
					level: 'warning',
					tags: { nodeType: 'n8n-nodes-synadia.nats' },
				});
			}
			// Auto mode: fallback to string
			return stringData;
		}
	}
	
	return stringData;
}

export function encodeKvValue(value: any, valueType: string): Uint8Array {
	switch (valueType) {
		case 'binary':
			return new TextEncoder().encode(Buffer.from(value, 'base64').toString());
		case 'json': {
			const jsonValue = typeof value === 'string' ? JSON.parse(value) : value;
			return new TextEncoder().encode(JSON.stringify(jsonValue));
		}
		default:
			return new TextEncoder().encode(value);
	}
}

export function decodeKvValue(data: Uint8Array): any {
	const stringValue = new TextDecoder().decode(data);
	try {
		return JSON.parse(stringValue);
	} catch {
		return stringValue;
	}
}