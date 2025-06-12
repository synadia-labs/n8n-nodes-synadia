# Changelog

All notable changes to this project will be documented in this file.

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