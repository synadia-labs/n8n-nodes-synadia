// This file wraps NATS.ws for bundling
// We'll use rollup to bundle this along with nats.ws into a single file

// Import everything we need from nats.ws
import * as natsws from 'nats.ws';

// Re-export everything we need
export const {
  connect,
  StringCodec,
  Empty,
  createInbox,
  headers,
  consumerOpts,
  jwtAuthenticator,
  nkeyAuthenticator,
} = natsws;

// Re-export types
export type {
  NatsConnection,
  Subscription,
  Msg,
  ConnectionOptions,
  JetStreamManager,
  JetStreamClient,
  KV,
  KvEntry,
  ObjectStore,
  ObjectInfo,
  ObjectResult,
  NatsError,
  ErrorCode,
} from 'nats.ws';