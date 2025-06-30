// Wrapper for NATS.js with WebSocket support
// This module provides a unified interface for the modular @nats-io packages

// We'll dynamically import the modules to avoid bundling issues
let natsCore: any;
let natsJetstream: any;
let natsKv: any;
let natsObj: any;

// Initialize function to load modules
async function ensureModulesLoaded() {
	if (!natsCore) {
		natsCore = await import('@nats-io/nats-core');
		natsJetstream = await import('@nats-io/jetstream');
		natsKv = await import('@nats-io/kv');
		natsObj = await import('@nats-io/obj');
	}
}

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

// Create a consumerOpts function that returns consumer options builder
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
		build() {
			return opts;
		},
	};

	return builder;
}

// Export async functions that load modules on demand
export async function connect(opts?: any): Promise<any> {
	await ensureModulesLoaded();
	// Use wsconnect for WebSocket connections
	return natsCore.wsconnect(opts);
}

export async function Empty(): Promise<Uint8Array> {
	await ensureModulesLoaded();
	return natsCore.Empty;
}

export async function createInbox(): Promise<string> {
	await ensureModulesLoaded();
	return natsCore.createInbox();
}

export async function headers(): Promise<any> {
	await ensureModulesLoaded();
	return natsCore.headers();
}

export async function jwtAuthenticator(jwt: string, seed: string): Promise<any> {
	await ensureModulesLoaded();
	return natsCore.jwtAuthenticator(jwt, seed);
}

export async function nkeyAuthenticator(seed: string): Promise<any> {
	await ensureModulesLoaded();
	return natsCore.nkeyAuthenticator(seed);
}

export async function jetstream(nc: any): Promise<any> {
	await ensureModulesLoaded();
	return natsJetstream.jetstream(nc);
}

export async function jetstreamManager(nc: any): Promise<any> {
	await ensureModulesLoaded();
	return natsJetstream.jetstreamManager(nc);
}

export async function Kvm(js: any): Promise<any> {
	await ensureModulesLoaded();
	return natsKv.Kvm(js);
}

export async function Objm(js: any): Promise<any> {
	await ensureModulesLoaded();
	return natsObj.Objm(js);
}

// Re-export types
export type {
	NatsConnection,
	ConnectionOptions,
	JwtAuth,
	NKeyAuth,
	Msg,
	MsgHdrs,
	PublishOptions,
	SubscriptionOptions,
	Subscription,
} from '@nats-io/nats-core';

export type {
	JetStreamClient,
	JetStreamManager,
	JetStreamPublishOptions,
	PubAck,
} from '@nats-io/jetstream';

export type { KV } from '@nats-io/kv';

export type { ObjectStore, ObjectInfo } from '@nats-io/obj';

// Export types that were missing
export type { Subscription as Sub } from '@nats-io/nats-core';
export type ConsumerOpts = ReturnType<typeof consumerOpts>;
