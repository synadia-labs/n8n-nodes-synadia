import { ApplicationError } from 'n8n-workflow';
import {
	validateBucketName,
	validateKeyName,
	validateNumberRange,
	validateTimeout,
	validateObjectName,
	validateStreamName,
	validateConsumerName,
	validateQueueGroup,
} from '../../utils/ValidationHelpers';

describe('ValidationHelpers', () => {
	describe('validateBucketName', () => {
		it('should accept valid bucket names', () => {
			expect(() => validateBucketName('my-bucket')).not.toThrow();
			expect(() => validateBucketName('my_bucket')).not.toThrow();
			expect(() => validateBucketName('bucket123')).not.toThrow();
			expect(() => validateBucketName('BUCKET')).not.toThrow();
			expect(() => validateBucketName('a')).not.toThrow();
		});

		it('should reject empty bucket names', () => {
			expect(() => validateBucketName('')).toThrow('Bucket name cannot be empty');
			expect(() => validateBucketName('   ')).toThrow('Bucket name cannot be empty');
		});

		it('should reject bucket names with spaces', () => {
			expect(() => validateBucketName('my bucket')).toThrow('Bucket name cannot contain spaces');
			expect(() => validateBucketName('bucket ')).toThrow('Bucket name cannot contain spaces');
		});

		it('should reject bucket names with dots', () => {
			expect(() => validateBucketName('my.bucket')).toThrow('Bucket name cannot contain dots');
			expect(() => validateBucketName('bucket.')).toThrow('Bucket name cannot contain dots');
		});

		it('should reject bucket names with invalid characters', () => {
			expect(() => validateBucketName('bucket@')).toThrow('Bucket name contains invalid characters');
			expect(() => validateBucketName('bucket!')).toThrow('Bucket name contains invalid characters');
			expect(() => validateBucketName('bucket#')).toThrow('Bucket name contains invalid characters');
		});
	});

	describe('validateKeyName', () => {
		it('should accept valid key names', () => {
			expect(() => validateKeyName('my-key')).not.toThrow();
			expect(() => validateKeyName('my_key')).not.toThrow();
			expect(() => validateKeyName('key.with.dots')).not.toThrow();
			expect(() => validateKeyName('path/to/key')).not.toThrow();
			expect(() => validateKeyName('KEY123')).not.toThrow();
		});

		it('should reject empty key names', () => {
			expect(() => validateKeyName('')).toThrow('Key name cannot be empty');
			expect(() => validateKeyName('   ')).toThrow('Key name cannot be empty');
		});

		it('should reject key names with spaces', () => {
			expect(() => validateKeyName('my key')).toThrow('Key name cannot contain spaces');
			expect(() => validateKeyName('key ')).toThrow('Key name cannot contain spaces');
		});

		it('should reject key names with invalid characters', () => {
			expect(() => validateKeyName('key@')).toThrow('Key name contains invalid characters');
			expect(() => validateKeyName('key!')).toThrow('Key name contains invalid characters');
			expect(() => validateKeyName('key#')).toThrow('Key name contains invalid characters');
		});
	});

	describe('validateNumberRange', () => {
		it('should accept numbers within range', () => {
			expect(() => validateNumberRange(5, 0, 10, 'TestValue')).not.toThrow();
			expect(() => validateNumberRange(0, 0, 10, 'TestValue')).not.toThrow();
			expect(() => validateNumberRange(10, 0, 10, 'TestValue')).not.toThrow();
		});

		it('should reject numbers below minimum', () => {
			expect(() => validateNumberRange(-1, 0, 10, 'TestValue')).toThrow('TestValue must be between 0 and 10');
		});

		it('should reject numbers above maximum', () => {
			expect(() => validateNumberRange(11, 0, 10, 'TestValue')).toThrow('TestValue must be between 0 and 10');
		});
	});

	describe('validateTimeout', () => {
		it('should accept valid timeouts', () => {
			expect(() => validateTimeout(0)).not.toThrow();
			expect(() => validateTimeout(1000)).not.toThrow();
			expect(() => validateTimeout(300000)).not.toThrow();
		});

		it('should reject negative timeouts', () => {
			expect(() => validateTimeout(-1)).toThrow('Timeout cannot be negative');
			expect(() => validateTimeout(-1000, 'Custom Timeout')).toThrow('Custom Timeout cannot be negative');
		});

		it('should reject timeouts over 5 minutes', () => {
			expect(() => validateTimeout(300001)).toThrow('Timeout cannot exceed 5 minutes');
			expect(() => validateTimeout(600000, 'Custom Timeout')).toThrow('Custom Timeout cannot exceed 5 minutes');
		});
	});

	describe('validateObjectName', () => {
		it('should accept valid object names', () => {
			expect(() => validateObjectName('file.txt')).not.toThrow();
			expect(() => validateObjectName('path/to/file.txt')).not.toThrow();
			expect(() => validateObjectName('file_name')).not.toThrow();
			expect(() => validateObjectName('file-name')).not.toThrow();
			expect(() => validateObjectName('2024/reports/sales.pdf')).not.toThrow();
		});

		it('should reject empty object names', () => {
			expect(() => validateObjectName('')).toThrow('Object name cannot be empty');
			expect(() => validateObjectName('   ')).toThrow('Object name cannot be empty');
		});

		it('should reject object names with invalid characters', () => {
			expect(() => validateObjectName('file@')).toThrow('Object name contains invalid characters');
			expect(() => validateObjectName('file name.txt')).toThrow('Object name contains invalid characters');
			expect(() => validateObjectName('file\\path')).toThrow('Object name contains invalid characters');
		});
	});

	describe('validateStreamName', () => {
		it('should accept valid stream names', () => {
			expect(() => validateStreamName('my-stream')).not.toThrow();
			expect(() => validateStreamName('my_stream')).not.toThrow();
			expect(() => validateStreamName('STREAM123')).not.toThrow();
			expect(() => validateStreamName('stream')).not.toThrow();
		});

		it('should reject empty stream names', () => {
			expect(() => validateStreamName('')).toThrow('Stream name cannot be empty');
			expect(() => validateStreamName('   ')).toThrow('Stream name cannot be empty');
		});

		it('should reject stream names with spaces', () => {
			expect(() => validateStreamName('my stream')).toThrow('Stream name cannot contain spaces');
		});

		it('should reject stream names with dots', () => {
			expect(() => validateStreamName('my.stream')).toThrow('Stream name cannot contain dots');
		});

		it('should reject stream names with invalid characters', () => {
			expect(() => validateStreamName('stream@')).toThrow('Stream name contains invalid characters');
			expect(() => validateStreamName('stream!')).toThrow('Stream name contains invalid characters');
		});
	});

	describe('validateConsumerName', () => {
		it('should accept valid consumer names', () => {
			expect(() => validateConsumerName('my-consumer')).not.toThrow();
			expect(() => validateConsumerName('my_consumer')).not.toThrow();
			expect(() => validateConsumerName('CONSUMER123')).not.toThrow();
			expect(() => validateConsumerName('')).not.toThrow(); // Empty is allowed
		});

		it('should accept empty consumer names', () => {
			expect(() => validateConsumerName('')).not.toThrow();
			expect(() => validateConsumerName('   ')).not.toThrow();
		});

		it('should reject consumer names with spaces', () => {
			expect(() => validateConsumerName('my consumer')).toThrow('Consumer name cannot contain spaces');
		});

		it('should reject consumer names with dots', () => {
			expect(() => validateConsumerName('my.consumer')).toThrow('Consumer name cannot contain dots');
		});

		it('should reject consumer names with invalid characters', () => {
			expect(() => validateConsumerName('consumer@')).toThrow('Consumer name contains invalid characters');
		});
	});

	describe('validateQueueGroup', () => {
		it('should accept valid queue group names', () => {
			expect(() => validateQueueGroup('my-queue')).not.toThrow();
			expect(() => validateQueueGroup('my_queue')).not.toThrow();
			expect(() => validateQueueGroup('queue.group')).not.toThrow();
			expect(() => validateQueueGroup('QUEUE123')).not.toThrow();
			expect(() => validateQueueGroup('')).not.toThrow(); // Empty is allowed
		});

		it('should accept empty queue group names', () => {
			expect(() => validateQueueGroup('')).not.toThrow();
			expect(() => validateQueueGroup('   ')).not.toThrow();
		});

		it('should reject queue group names with spaces', () => {
			expect(() => validateQueueGroup('my queue')).toThrow('Queue group name cannot contain spaces');
		});

		it('should reject queue group names with invalid characters', () => {
			expect(() => validateQueueGroup('queue@')).toThrow('Queue group name contains invalid characters');
			expect(() => validateQueueGroup('queue!')).toThrow('Queue group name contains invalid characters');
		});
	});

	describe('error types', () => {
		it('should throw ApplicationError with correct properties', () => {
			try {
				validateBucketName('');
			} catch (error) {
				expect(error).toBeInstanceOf(ApplicationError);
				expect((error as ApplicationError).level).toBe('warning');
				expect((error as ApplicationError).tags).toEqual({ nodeType: 'n8n-nodes-synadia.natsKv' });
			}
		});
	});
});