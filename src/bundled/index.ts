// This file re-exports from the bundled NATS
// TypeScript will use the types from nats-wrapper.ts
// But at runtime it will use the bundled version

// During development, use nats.ws directly for types
export * from './nats-wrapper';

// Note: The actual bundled code is in nats-bundled.js
// We'll need to update our build process to use that file