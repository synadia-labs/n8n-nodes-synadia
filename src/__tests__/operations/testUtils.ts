import { KV, ObjectStore, JetStreamClient, Kvm, Objm } from '../../bundled/nats-bundled';

// Mock NATS types with common methods
export const createMockKV = (): jest.Mocked<KV> =>
	({
		get: jest.fn(),
		put: jest.fn(),
		delete: jest.fn(),
		history: jest.fn(),
		keys: jest.fn(),
		watch: jest.fn(),
		close: jest.fn(),
		destroy: jest.fn(),
		status: jest.fn(),
		bucketName: jest.fn(),

		// Add any other KV methods that might be used
		create: jest.fn(),
		purge: jest.fn(),
	}) as any;

export const createMockObjectStore = (): jest.Mocked<ObjectStore> =>
	({
		get: jest.fn(),
		put: jest.fn(),
		delete: jest.fn(),
		info: jest.fn(),
		list: jest.fn(),
		watch: jest.fn(),
		destroy: jest.fn(),
		status: jest.fn(),
		bucketName: jest.fn(),

		// ObjectStore specific methods
		getBlob: jest.fn(),
		putBlob: jest.fn(),
		seal: jest.fn(),
	}) as any;

export const createMockJetStreamManager = () =>
	({
		streams: {
			add: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			info: jest.fn(),
			list: jest.fn(),
			purge: jest.fn(),
			get: jest.fn(),
			deleteMessage: jest.fn(),
			getMessage: jest.fn(),
			find: jest.fn(),
			names: jest.fn(),
		},

		consumers: {
			add: jest.fn(),
			delete: jest.fn(),
			info: jest.fn(),
			list: jest.fn(),
			get: jest.fn(),
			update: jest.fn(),
			pause: jest.fn(),
			resume: jest.fn(),
		},

		// KV and ObjectStore access
		views: {
			kv: jest.fn(),
			os: jest.fn(),
		},

		// Additional JetStreamManager properties
		direct: jest.fn(),
		getAccountInfo: jest.fn(),
		advisories: jest.fn(),
		getOptions: jest.fn(),
		jetstream: jest.fn(),
	}) as any;

export const createMockJetStreamClient = (): jest.Mocked<JetStreamClient> =>
	({
		consumers: {
			add: jest.fn(),
			delete: jest.fn(),
			info: jest.fn(),
			list: jest.fn(),
			get: jest.fn(),
			update: jest.fn(),
			pause: jest.fn(),
			resume: jest.fn(),
		} as any,

		views: {
			kv: jest.fn(),
			os: jest.fn(),
		},

		publish: jest.fn(),
		subscribe: jest.fn(),
		pullSubscribe: jest.fn(),
	}) as any;

export const createMockKvm = (): jest.Mocked<Kvm> =>
	({
		create: jest.fn(),
		open: jest.fn(),
	}) as any;

export const createMockObjm = (): jest.Mocked<Objm> =>
	({
		create: jest.fn(),
		open: jest.fn(),
	}) as any;

// Sample data generators for consistent test data
export const createSampleKvEntry = (overrides: Partial<any> = {}) => {
	const defaultValue = new TextEncoder().encode('test value');
	const finalValue = overrides.value !== undefined ? overrides.value : defaultValue;
	const stringValue = overrides.stringValue || 'test value';

	return {
		key: 'test.key',
		value: finalValue,
		revision: 1,
		created: new Date(),
		delta: 0,
		bucket: 'test-bucket',
		operation: 'PUT' as const,
		length: finalValue ? finalValue.length : 0,
		json: jest.fn().mockReturnValue({ message: stringValue }),
		string: jest.fn().mockReturnValue(stringValue),
		...overrides,
	};
};

export const createStreamConfig = (overrides: any = {}) =>
	({
		name: 'TEST-STREAM',
		subjects: ['test.>'],
		retention: 'limits' as const,
		max_consumers: -1,
		max_msgs: 1000,
		max_bytes: -1,
		max_age: 0,
		max_msgs_per_subject: -1,
		max_msg_size: -1,
		storage: 'file' as const,
		num_replicas: 1,
		no_ack: false,
		template_owner: '',
		discard: 'old' as const,
		duplicate_window: 0,
		placement: undefined,
		mirror: undefined,
		sources: [],
		sealed: false,
		deny_delete: false,
		deny_purge: false,
		allow_rollup_hdrs: false,
		discard_new_per_subject: false,
		...overrides,
	}) as any;

export const sampleStreamInfo = {
	config: {
		name: 'TEST-STREAM',
		subjects: ['test.>'],
		retention: 'limits' as const,
		max_consumers: -1,
		max_msgs: 1000,
		max_bytes: -1,
		max_age: 0,
		max_msgs_per_subject: -1,
		max_msg_size: -1,
		storage: 'file' as const,
		num_replicas: 1,
		no_ack: false,
		template_owner: '',
		discard: 'old' as const,
		duplicate_window: 0,
		placement: undefined,
		mirror: undefined,
		sources: [],
		sealed: false,
		deny_delete: false,
		deny_purge: false,
		allow_rollup_hdrs: false,
	},
	state: {
		messages: 0,
		bytes: 0,
		first_seq: 0,
		first_ts: new Date(),
		last_seq: 0,
		last_ts: new Date(),
		consumer_count: 0,
	},
	created: new Date(),
	ts: new Date(),
};

export const sampleConsumerInfo = {
	stream_name: 'TEST-STREAM',
	name: 'test-consumer',
	config: {
		durable_name: 'test-consumer',
		deliver_policy: 'all' as const,
		ack_policy: 'explicit' as const,
		ack_wait: 30000000000,
		max_deliver: -1,
		filter_subject: '',
		replay_policy: 'instant' as const,
		rate_limit: 0,
		sample_freq: '',
		max_waiting: 256,
		max_ack_pending: 1000,
		flow_control: false,
		idle_heartbeat: 0,
		headers_only: false,
		max_request_batch: 0,
		max_request_expires: 0,
		inactive_threshold: 0,
	},
	created: new Date(),
	delivered: {
		consumer_seq: 0,
		stream_seq: 0,
		last_active: new Date(),
	},
	ack_floor: {
		consumer_seq: 0,
		stream_seq: 0,
		last_active: new Date(),
	},
	num_ack_pending: 0,
	num_redelivered: 0,
	num_waiting: 0,
	num_pending: 0,
	cluster: undefined,
	push_bound: false,
	ts: new Date(),
};

export const sampleObjectInfo = {
	name: 'test-object.txt',
	description: 'Test object',
	bucket: 'test-bucket',
	nuid: 'test-nuid-123',
	size: 1024,
	chunks: 1,
	digest: 'SHA-256=abc123',
	deleted: false,
	mtime: new Date().toISOString(),
	revision: 1,
};

export const sampleKvStatus = {
	bucket: 'test-kv-bucket',
	values: 100,
	history: 10,
	ttl: 3600,
	bucket_location: 'memory',
	backingStore: 'JetStream',
	streamInfo: {
		config: {
			name: 'KV_test-kv-bucket',
			subjects: ['$KV.test-kv-bucket.>'],
			retention: 'workqueue' as const,
			max_consumers: -1,
			max_msgs: 1000,
			max_bytes: -1,
			max_age: 3600000000000,
			storage: 'memory' as const,
		},
		state: {
			messages: 100,
			bytes: 10240,
			first_seq: 1,
			last_seq: 100,
		},
	},
};

export const sampleObjectStoreStatus = {
	bucket: 'test-os-bucket',
	description: 'Test object store bucket',
	ttl: 7200,
	storage: 'file' as const,
	replicas: 1,
	sealed: false,
	size: 2048000,
	streamInfo: {
		config: {
			name: 'OBJ_test-os-bucket',
			subjects: ['$O.test-os-bucket.C.>', '$O.test-os-bucket.M.>'],
			retention: 'limits' as const,
			max_consumers: -1,
			max_msgs: 10000,
			max_bytes: 1073741824,
			storage: 'file' as const,
		},
		state: {
			messages: 50,
			bytes: 2048000,
			first_seq: 1,
			last_seq: 50,
		},
	},
};

// Error scenarios for testing
export const createNotFoundError = (message: string) => {
	const error = new Error(message);
	(error as any).code = '404';
	return error;
};

export const createTimeoutError = (message: string) => {
	const error = new Error(message);
	(error as any).code = 'TIMEOUT';
	return error;
};

export const createPermissionError = (message: string) => {
	const error = new Error(message);
	(error as any).code = '403';
	return error;
};

// This file contains test utilities, not actual tests
describe('testUtils', () => {
	it('should export utility functions', () => {
		expect(createMockKV).toBeDefined();
		expect(createMockObjectStore).toBeDefined();
		expect(createMockJetStreamManager).toBeDefined();
	});
});
