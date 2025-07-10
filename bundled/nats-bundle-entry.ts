// Entry point for bundling NATS.js with Node.js TCP transport
import { connect } from '@nats-io/transport-node';
import {
	Empty,
	createInbox,
	headers,
	jwtAuthenticator,
	nkeyAuthenticator,
	credsAuthenticator,
	usernamePasswordAuthenticator,
	tokenAuthenticator,
} from '@nats-io/nats-core';
import { jetstream as jsFunc, jetstreamManager as jsmFunc } from '@nats-io/jetstream';
import { Kvm } from '@nats-io/kv';
import { Objm } from '@nats-io/obj';

// Create text encoder/decoder instances
const te = new TextEncoder();
const td = new TextDecoder();

// Define Codec interface
interface Codec<T> {
	encode(d: T): Uint8Array;
	decode(a: Uint8Array): T;
}

// Implement StringCodec
export function StringCodec(): Codec<string> {
	return {
		encode(input: string): Uint8Array {
			return te.encode(input);
		},
		decode(input: Uint8Array): string {
			return td.decode(input);
		},
	};
}

// Implement JSONCodec
export function JSONCodec<T = unknown>(): Codec<T> {
	return {
		encode(input: T): Uint8Array {
			const json = JSON.stringify(input);
			return te.encode(json);
		},
		decode(input: Uint8Array): T {
			const str = td.decode(input);
			return JSON.parse(str);
		},
	};
}

// Create a consumerOpts function that matches the old API
export function consumerOpts() {
	const opts: any = {};

	const builder = {
		deliverAll() {
			opts.deliver_policy = 'all';
			return this;
		},
		deliverNew() {
			opts.deliver_policy = 'new';
			return this;
		},
		deliverLast() {
			opts.deliver_policy = 'last';
			return this;
		},
		deliverLastPerSubject() {
			opts.deliver_policy = 'last_per_subject';
			return this;
		},
		ackExplicit() {
			opts.ack_policy = 'explicit';
			return this;
		},
		manualAck() {
			opts.ack_policy = 'explicit';
			return this;
		},
		bind(stream: string, durable: string) {
			opts.stream = stream;
			opts.durable = durable;
			return this;
		},
		build() {
			return opts;
		},
	};

	return builder;
}

// Re-export everything with proper names
export {
	connect,
	Empty,
	createInbox,
	headers,
	jwtAuthenticator,
	nkeyAuthenticator,
	credsAuthenticator,
	usernamePasswordAuthenticator,
	tokenAuthenticator,
};

// Export jetstream functions
export const jetstream = jsFunc;
export const jetstreamManager = jsmFunc;

// Re-export KV and Object store
export { Kvm, Objm };

// Re-export all types
export * from '@nats-io/transport-node';
export * from '@nats-io/nats-core';
export * from '@nats-io/jetstream';
export * from '@nats-io/kv';
export * from '@nats-io/obj';
