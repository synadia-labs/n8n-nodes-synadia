import { INodeExecutionData, ApplicationError, IDataObject } from 'n8n-workflow';
import { Msg, MsgHdrs, MsgHdrsImpl } from '../bundled/nats-bundled';

export interface NatsMessage {
	subject: string;
	data: any;
	headers?: Record<string, string>;
	replyTo?: string;
}

export function parseNatsMessage(msg: Msg): INodeExecutionData {
	// Try to decode and parse the data
	let parsedData = msg.data;
	try {
		// First decode from Uint8Array to string
		const dataString = new TextDecoder().decode(msg.data);
		// Then try to parse as JSON
		parsedData = JSON.parse(dataString);
	} catch {
		// If parsing fails, keep the raw data
		parsedData = msg.data;
	}

	const result: INodeExecutionData = {
		json: {
			subject: msg.subject,
			data: parsedData,
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
	return result;
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
		throw new ApplicationError(
			'Subject contains invalid characters. Valid characters are: a-z, A-Z, 0-9, ., *, >, _, -',
			{
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.nats' },
			},
		);
	}
}

export function validateBucketName(bucketName: string): void {
	if (!bucketName || bucketName.trim() === '') {
		throw new ApplicationError('Bucket name cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Check for invalid characters
	if (bucketName.includes(' ')) {
		throw new ApplicationError('Bucket name cannot contain spaces', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	if (bucketName.includes('.')) {
		throw new ApplicationError('Bucket name cannot contain dots', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// KV bucket names should contain only letters, numbers, underscores, and hyphens
	const validPattern = /^[a-zA-Z0-9_-]+$/;
	if (!validPattern.test(bucketName)) {
		throw new ApplicationError(
			'Bucket name contains invalid characters. Valid characters are: a-z, A-Z, 0-9, _, -',
			{
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.nats' },
			},
		);
	}
}

export function validateStreamName(streamName: string): void {
	if (!streamName || streamName.trim() === '') {
		throw new ApplicationError('Stream name cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Check for invalid characters
	if (streamName.includes(' ')) {
		throw new ApplicationError('Stream name cannot contain spaces', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Stream names should be uppercase and contain only letters, numbers, underscores, and hyphens
	const validPattern = /^[A-Z0-9_-]+$/;
	if (!validPattern.test(streamName)) {
		throw new ApplicationError(
			'Stream name should be uppercase and contain only letters, numbers, underscores, and hyphens',
			{
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.nats' },
			},
		);
	}
}

export function validateConsumerName(consumerName: string): void {
	if (!consumerName || consumerName.trim() === '') {
		throw new ApplicationError('Consumer name cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Check for invalid characters
	if (consumerName.includes(' ')) {
		throw new ApplicationError('Consumer name cannot contain spaces', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	if (consumerName.includes('.')) {
		throw new ApplicationError('Consumer name cannot contain dots', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Consumer names should contain only letters, numbers, underscores, and hyphens
	const validPattern = /^[a-zA-Z0-9_-]+$/;
	if (!validPattern.test(consumerName)) {
		throw new ApplicationError(
			'Consumer name contains invalid characters. Valid characters are: a-z, A-Z, 0-9, _, -',
			{
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.nats' },
			},
		);
	}
}

export function validateQueueGroup(queueGroup: string): void {
	// Queue group is optional, so empty string is allowed
	if (!queueGroup || queueGroup.trim() === '') {
		return;
	}

	// Check for invalid characters
	if (queueGroup.includes(' ')) {
		throw new ApplicationError('Queue group cannot contain spaces', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Queue groups should contain only letters, numbers, underscores, and hyphens
	const validPattern = /^[a-zA-Z0-9_-]+$/;
	if (!validPattern.test(queueGroup)) {
		throw new ApplicationError(
			'Queue group contains invalid characters. Valid characters are: a-z, A-Z, 0-9, _, -',
			{
				level: 'warning',
				tags: { nodeType: 'n8n-nodes-synadia.nats' },
			},
		);
	}
}
