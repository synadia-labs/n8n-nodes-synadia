import { ApplicationError } from 'n8n-workflow';

/**
 * Validates a bucket name according to NATS JetStream requirements
 * @param bucketName The bucket name to validate
 * @throws ApplicationError if the bucket name is invalid
 */
export function validateBucketName(bucketName: string): void {
	if (!bucketName || bucketName.trim() === '') {
		throw new ApplicationError('Bucket name cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.natsKv' },
		});
	}

	// NATS bucket names must not contain spaces or dots
	if (bucketName.includes(' ')) {
		throw new ApplicationError('Bucket name cannot contain spaces', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.natsKv' },
		});
	}

	if (bucketName.includes('.')) {
		throw new ApplicationError('Bucket name cannot contain dots', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.natsKv' },
		});
	}

	// NATS bucket names should follow specific patterns
	const validPattern = /^[a-zA-Z0-9_-]+$/;
	if (!validPattern.test(bucketName)) {
		throw new ApplicationError('Bucket name contains invalid characters. Valid characters are: a-z, A-Z, 0-9, _, -', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.natsKv' },
		});
	}
}

/**
 * Validates a key name for KV operations
 * @param keyName The key name to validate
 * @throws ApplicationError if the key name is invalid
 */
export function validateKeyName(keyName: string): void {
	if (!keyName || keyName.trim() === '') {
		throw new ApplicationError('Key name cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.natsKv' },
		});
	}

	// Keys can contain dots (used for hierarchical organization)
	// but should not contain spaces or special characters
	if (keyName.includes(' ')) {
		throw new ApplicationError('Key name cannot contain spaces', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.natsKv' },
		});
	}

	// Allow dots for hierarchical keys, but validate other characters
	const validPattern = /^[a-zA-Z0-9._/-]+$/;
	if (!validPattern.test(keyName)) {
		throw new ApplicationError('Key name contains invalid characters. Valid characters are: a-z, A-Z, 0-9, ., _, /, -', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.natsKv' },
		});
	}
}

/**
 * Validates a numeric value is within acceptable range
 * @param value The value to validate
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @param fieldName The name of the field being validated
 * @throws ApplicationError if the value is out of range
 */
export function validateNumberRange(value: number, min: number, max: number, fieldName: string): void {
	if (value < min || value > max) {
		throw new ApplicationError(`${fieldName} must be between ${min} and ${max}`, {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}
}

/**
 * Validates a timeout value
 * @param timeout The timeout value in milliseconds
 * @param fieldName The name of the field being validated
 * @throws ApplicationError if the timeout is invalid
 */
export function validateTimeout(timeout: number, fieldName: string = 'Timeout'): void {
	if (timeout < 0) {
		throw new ApplicationError(`${fieldName} cannot be negative`, {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}
	
	// Maximum timeout of 5 minutes
	if (timeout > 300000) {
		throw new ApplicationError(`${fieldName} cannot exceed 5 minutes (300000ms)`, {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}
}

/**
 * Validates an object name for Object Store operations
 * @param objectName The object name to validate
 * @throws ApplicationError if the object name is invalid
 */
export function validateObjectName(objectName: string): void {
	if (!objectName || objectName.trim() === '') {
		throw new ApplicationError('Object name cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
		});
	}

	// Object names can contain paths with forward slashes
	// but should not contain backslashes or other special characters
	const validPattern = /^[a-zA-Z0-9._/-]+$/;
	if (!validPattern.test(objectName)) {
		throw new ApplicationError('Object name contains invalid characters. Valid characters are: a-z, A-Z, 0-9, ., _, /, -', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.natsObjectStore' },
		});
	}
}

/**
 * Validates a stream name according to NATS JetStream requirements
 * @param streamName The stream name to validate
 * @throws ApplicationError if the stream name is invalid
 */
export function validateStreamName(streamName: string): void {
	if (!streamName || streamName.trim() === '') {
		throw new ApplicationError('Stream name cannot be empty', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Stream names must not contain spaces or dots
	if (streamName.includes(' ')) {
		throw new ApplicationError('Stream name cannot contain spaces', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	if (streamName.includes('.')) {
		throw new ApplicationError('Stream name cannot contain dots', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	// Stream names should follow specific patterns
	const validPattern = /^[a-zA-Z0-9_-]+$/;
	if (!validPattern.test(streamName)) {
		throw new ApplicationError('Stream name contains invalid characters. Valid characters are: a-z, A-Z, 0-9, _, -', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}
}

/**
 * Validates a consumer name according to NATS JetStream requirements
 * @param consumerName The consumer name to validate
 * @throws ApplicationError if the consumer name is invalid
 */
export function validateConsumerName(consumerName: string): void {
	if (!consumerName || consumerName.trim() === '') {
		// Empty consumer names are allowed (server will generate one)
		return;
	}

	// Consumer names must not contain spaces or dots
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

	// Consumer names should follow specific patterns
	const validPattern = /^[a-zA-Z0-9_-]+$/;
	if (!validPattern.test(consumerName)) {
		throw new ApplicationError('Consumer name contains invalid characters. Valid characters are: a-z, A-Z, 0-9, _, -', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}
}

/**
 * Validates a queue group name
 * @param queueGroup The queue group name to validate
 * @throws ApplicationError if the queue group name is invalid
 */
export function validateQueueGroup(queueGroup: string): void {
	if (!queueGroup || queueGroup.trim() === '') {
		// Empty queue groups are allowed
		return;
	}

	// Queue group names should not contain spaces or special characters
	if (queueGroup.includes(' ')) {
		throw new ApplicationError('Queue group name cannot contain spaces', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}

	const validPattern = /^[a-zA-Z0-9._-]+$/;
	if (!validPattern.test(queueGroup)) {
		throw new ApplicationError('Queue group name contains invalid characters. Valid characters are: a-z, A-Z, 0-9, ., _, -', {
			level: 'warning',
			tags: { nodeType: 'n8n-nodes-synadia.nats' },
		});
	}
}