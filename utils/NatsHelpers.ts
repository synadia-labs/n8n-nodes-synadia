import { INodeExecutionData, ApplicationError, IDataObject, GenericValue } from 'n8n-workflow';
import { Msg, MsgHdrs, MsgHdrsImpl } from '../bundled/nats-bundled';

export interface NatsMessage {
	subject: string;
	data: any;
	headers?: Record<string, string>;
	replyTo?: string;
}

export function parseNatsMessage(msg: Msg): INodeExecutionData {
	// Try to decode and parse the data
	let parsedData;
	try {
		// Then try to parse as JSON
		parsedData = msg.json() as IDataObject;
	} catch {
		// If parsing fails, keep the raw data
		parsedData = msg.string() as GenericValue;
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
		result.json.headers = (msg.headers as MsgHdrsImpl).toRecord();
	}

	return result;
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

	// Let NATS handle bucket name validation - any non-empty name is valid for our purposes
}

export function validateStreamName(streamName: string): void {
	if (!streamName || streamName.trim() === '') {
		throw new ApplicationError('Stream name cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Let NATS handle stream name validation - any non-empty name is valid for our purposes
}

export function validateConsumerName(consumerName: string): void {
	if (!consumerName || consumerName.trim() === '') {
		throw new ApplicationError('Consumer name cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Let NATS handle consumer name validation - any non-empty name is valid for our purposes
}

export function validateQueueGroup(queueGroup: string): void {
	// Queue group is optional, so empty string is allowed
	if (!queueGroup || queueGroup.trim() === '') {
		return;
	}

	// Let NATS handle queue group validation - any non-empty name is valid for our purposes
}
