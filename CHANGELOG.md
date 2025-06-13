# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-12-06

### Added
- NATS KV Store node for key-value operations
- NATS KV Trigger node for watching KV changes
- NATS Object Store node for file/object storage
- NATS Object Store Trigger node for watching object changes
- NATS Request/Reply node for service communication
- NATS Service Reply node for building service endpoints

### Features
- **NATS KV Store**
  - Full CRUD operations (get, put, update, delete)
  - Bucket management (create, delete)
  - Key listing and history tracking
  - Atomic updates with revision checks
  - TTL support for automatic expiration
  
- **NATS KV Trigger**
  - Watch all keys or specific patterns
  - Filter by operation type
  - Include historical values
  - Metadata-only mode

- **NATS Object Store**
  - Store and retrieve large objects
  - Streaming support for large files
  - Object linking between buckets
  - Metadata and listing operations
  
- **NATS Object Store Trigger**
  - Watch for object changes
  - Filter by name patterns
  - Include historical objects

- **NATS Request/Reply**
  - Synchronous request/reply pattern
  - Scatter-gather for multiple replies
  - Configurable timeouts
  - Fire-and-forget mode
  
- **NATS Service Reply**
  - Build NATS services with n8n
  - Queue group load balancing
  - Automatic reply handling
  - Custom reply field mapping

## [0.1.0] - 2024-12-06

### Added
- Initial release of n8n-nodes-synadia
- NATS Trigger node for subscribing to messages
- NATS Publisher node for sending messages
- Support for Core NATS pub/sub
- JetStream support (streams, consumers)
- Multiple authentication methods (URL, Username/Password, Token, NKey, JWT)
- TLS/SSL support
- Queue groups for load balancing
- Message encoding options (JSON, String, Binary)
- Comprehensive error handling
- Full test coverage (92%+)
- N8N linting compliance

### Features
- **NATS Trigger**
  - Subscribe to subjects with wildcards
  - Queue group support
  - JetStream consumer configuration
  - Manual and automatic acknowledgment
  
- **NATS Publisher**
  - Publish to Core NATS and JetStream
  - Custom headers support
  - Message deduplication (JetStream)
  - Optimistic concurrency control