// Type declarations for bundled NATS.js module
export * from '@nats-io/nats-core';
export * from '@nats-io/jetstream';
export * from '@nats-io/kv'; 
export * from '@nats-io/obj';

// Re-declare types that might be missing
export type { Consumer, Consumers } from '@nats-io/jetstream';

// Additional exports from our wrapper
export function StringCodec(): Codec<string>;
export function JSONCodec<T = unknown>(): Codec<T>;
export function consumerOpts(): any;

// Re-export renamed functions
export { wsconnect as connect } from '@nats-io/nats-core';
export { jetstream, jetstreamManager } from '@nats-io/jetstream';
export { Kvm } from '@nats-io/kv';
export { Objm } from '@nats-io/obj';

// Codec interface
export interface Codec<T> {
  encode(d: T): Uint8Array;
  decode(a: Uint8Array): T;
}

// Export type aliases
export type Sub = import('@nats-io/nats-core').Subscription;
export type ConsumerOpts = ReturnType<typeof consumerOpts>;