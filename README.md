# n8n-nodes-synadia

Official [Synadia](https://synadia.com) nodes for [n8n](https://n8n.io), providing seamless integration with [NATS](https://nats.io) messaging system. Built and maintained by the creators of NATS, these nodes support both Core NATS and JetStream functionality for reliable workflow automation.

## Features

- 🚀 **Core NATS** - Publish/Subscribe messaging
- 🌊 **JetStream** - Persistent streaming with exactly-once semantics
- 🔐 **Multiple Authentication Methods** - Token, User/Pass, NKey, JWT
- 🔒 **TLS Support** - Secure connections with certificate authentication
- 📦 **Message Encoding** - JSON, String, and Binary formats
- 🎯 **Queue Groups** - Load balancing for subscribers
- 💾 **JetStream Features** - Streams, Key-Value store, Object Store support

## Installation

### In n8n

1. Go to **Settings** > **Community Nodes**
2. Search for `n8n-nodes-synadia`
3. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes folder
cd ~/.n8n/custom

# Clone or download this repository
git clone https://github.com/synadia/n8n-nodes-synadia.git

# Install dependencies
cd n8n-nodes-synadia
npm install

# Build the nodes
npm run build
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/synadia/n8n-nodes-synadia.git
cd n8n-nodes-synadia

# Install dependencies
npm install

# Build and link for development
npm run build
npm link

# In your n8n installation
npm link n8n-nodes-synadia
```

## Nodes

### NATS Trigger

Triggers workflows when messages are received on NATS subjects.

**Features:**
- Subscribe to subjects with wildcards (`*`, `>`)
- Queue groups for load balancing
- JetStream consumer support (durable & ephemeral)
- Configurable delivery policies
- Manual or automatic message acknowledgment

**Use Cases:**
- Event-driven workflows
- Microservice communication
- Real-time data processing
- IoT message handling

### NATS Publisher

Publishes messages to NATS subjects.

**Features:**
- Core NATS and JetStream publishing
- Custom headers support
- Request-Reply pattern support
- Message deduplication (JetStream)
- Optimistic concurrency control (JetStream)

**Use Cases:**
- Send notifications
- Trigger microservices
- Store events in JetStream
- Distribute work items

### NATS KV Store

Interact with NATS JetStream Key-Value Store for persistent key-value operations.

**Features:**
- Create and delete KV buckets
- Get, put, update, and delete operations
- Atomic updates with revision checks
- Key listing and history tracking
- TTL support for automatic expiration
- Configurable replication and storage

**Use Cases:**
- Configuration management
- Session storage
- Distributed caching
- State management

### NATS KV Trigger

Triggers workflows when changes occur in a NATS KV bucket.

**Features:**
- Watch all keys or specific patterns
- Filter by operation type (put/delete)
- Include historical values on startup
- Metadata-only mode for efficiency
- Real-time change notifications

**Use Cases:**
- Configuration change detection
- Cache invalidation workflows
- Audit logging
- State synchronization

### NATS Object Store

Interact with NATS JetStream Object Store for storing large objects and files.

**Features:**
- Create and delete object store buckets
- Put and get objects with streaming
- Object metadata and info retrieval
- Link objects between buckets
- List objects with filtering
- Configurable chunk size and storage

**Use Cases:**
- File storage and retrieval
- Binary data management
- Document storage
- Media file handling

### NATS Object Store Trigger

Triggers workflows when changes occur in a NATS Object Store bucket.

**Features:**
- Watch for object additions/deletions
- Filter by object name patterns
- Include historical objects on startup
- Metadata change detection

**Use Cases:**
- File processing pipelines
- Media transcoding workflows
- Backup and archival processes
- Content management systems

### NATS Request/Reply

Send requests and wait for replies from NATS services.

**Features:**
- Synchronous request/reply pattern
- Scatter-gather (multiple replies)
- Configurable timeouts
- Custom headers support
- Fire-and-forget mode
- Support for all message encodings

**Use Cases:**
- Microservice communication
- API gateway integration
- Service discovery
- Load balanced requests

### NATS Service Reply

Respond to NATS request/reply messages as a service endpoint.

**Features:**
- Act as a NATS service
- Queue group support for load balancing
- Automatic reply handling
- Custom reply field mapping
- Include request in reply option
- Process workflow results as replies

**Use Cases:**
- Build microservices with n8n
- API endpoint implementation
- Service worker pools
- Request processing pipelines

## Authentication

The NATS credential supports multiple authentication methods:

1. **URL Only** - Simple connection without authentication
2. **Username/Password** - Basic authentication
3. **Token** - Token-based authentication
4. **NKey** - Ed25519 based authentication
5. **JWT** - JWT with NKey signing

### Connection Options

- **Multiple Servers** - Comma-separated list for clustering
- **TLS/SSL** - Certificate-based encryption
- **Reconnection** - Configurable retry behavior
- **Timeouts** - Connection and ping intervals

## Examples

### Basic Publisher

```json
{
  "nodes": [
    {
      "name": "NATS Publisher",
      "type": "n8n-nodes-synadia.natsPublisher",
      "parameters": {
        "subject": "orders.new",
        "message": "={{ JSON.stringify($json) }}"
      }
    }
  ]
}
```

### JetStream Trigger with Acknowledgment

```json
{
  "nodes": [
    {
      "name": "NATS Trigger",
      "type": "n8n-nodes-synadia.natsTrigger",
      "parameters": {
        "subscriptionType": "jetstream",
        "subject": "events.>",
        "streamName": "EVENTS",
        "consumerType": "ephemeral",
        "options": {
          "deliverPolicy": "new",
          "manualAck": false
        }
      }
    }
  ]
}
```

### Queue Group Subscriber

```json
{
  "nodes": [
    {
      "name": "NATS Worker",
      "type": "n8n-nodes-synadia.natsTrigger",
      "parameters": {
        "subject": "work.items",
        "queueGroup": "workers"
      }
    }
  ]
}
```

### KV Store Operations

```json
{
  "nodes": [
    {
      "name": "Store Config",
      "type": "n8n-nodes-synadia.natsKv",
      "parameters": {
        "operation": "put",
        "bucket": "config",
        "key": "app.settings",
        "value": "={{ JSON.stringify($json) }}"
      }
    }
  ]
}
```

### KV Change Detection

```json
{
  "nodes": [
    {
      "name": "Config Watcher",
      "type": "n8n-nodes-synadia.natsKvTrigger",
      "parameters": {
        "bucket": "config",
        "watchType": "pattern",
        "pattern": "app.*",
        "options": {
          "includeDeletes": true
        }
      }
    }
  ]
}
```

### Object Store File Upload

```json
{
  "nodes": [
    {
      "name": "Store Document",
      "type": "n8n-nodes-synadia.natsObjectStore",
      "parameters": {
        "operation": "put",
        "bucket": "documents",
        "name": "report-{{ $now.toISOString() }}.pdf",
        "data": "={{ $binary.data }}",
        "options": {
          "dataType": "binary"
        }
      }
    }
  ]
}
```

### Request/Reply Pattern

```json
{
  "nodes": [
    {
      "name": "Call Service",
      "type": "n8n-nodes-synadia.natsRequestReply",
      "parameters": {
        "subject": "api.users.get",
        "requestData": "={{ JSON.stringify({ userId: $json.id }) }}",
        "options": {
          "timeout": 3000,
          "requestEncoding": "json"
        }
      }
    }
  ]
}
```

### Service Implementation

```json
{
  "nodes": [
    {
      "name": "User Service",
      "type": "n8n-nodes-synadia.natsServiceReply",
      "parameters": {
        "subject": "api.users.get",
        "queueGroup": "user-service",
        "options": {
          "replyField": "userData",
          "includeRequest": true
        }
      }
    },
    {
      "name": "Get User Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "code": "return { userData: { id: $json.request.userId, name: 'John Doe' } };"
      }
    }
  ]
}
```

## Message Formats

### Incoming Message Structure (Trigger)

```javascript
{
  "subject": "test.subject",
  "data": { /* parsed message content */ },
  "headers": { /* message headers if present */ },
  "replyTo": "reply.subject", // if present
  "seq": 123, // JetStream sequence number
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Publishing Options

- **JSON** - Automatically serializes objects
- **String** - Plain text messages
- **Binary** - Base64 encoded binary data

## Development

### Prerequisites

- Node.js 18+
- TypeScript 5+
- n8n 1.0+

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

### Testing

The package includes comprehensive unit tests:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Project Structure

```
src/
├── credentials/
│   └── NatsApi.credentials.ts    # NATS connection credentials
├── nodes/
│   ├── NatsTrigger.node.ts       # Trigger node implementation
│   └── NatsPublisher.node.ts     # Publisher node implementation
└── utils/
    ├── NatsConnection.ts         # Connection management
    └── NatsHelpers.ts           # Message parsing and encoding
```

## Testing Workflows

All trigger nodes include sample data output for easy testing:

1. **Manual Execution**: Click "Execute Node" on any trigger to see sample data
2. **Sample Data Format**: Each trigger provides realistic sample data matching actual message structure
3. **No Connection Required**: Test your workflows without setting up NATS connections

This helps you:
- Understand the data structure before implementing
- Build and test transformations without live data
- Debug workflows more efficiently

## Troubleshooting

### Connection Issues

1. **Verify NATS server is running**
   ```bash
   nats server info
   ```

2. **Check credentials**
   - Ensure authentication method matches server configuration
   - Verify certificates for TLS connections

3. **Network connectivity**
   - Check firewall rules
   - Verify server URLs are accessible

### Message Handling

1. **JSON parsing errors**
   - Publisher will fall back to string encoding
   - Check message format in NATS

2. **Missing messages**
   - Verify subject patterns
   - Check queue group configuration
   - Review JetStream consumer settings

### Common Errors

- `Subject cannot contain spaces` - Remove spaces from subject names
- `Failed to connect to NATS` - Check server URL and credentials
- `Stream not found` - Ensure JetStream stream exists

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure linting passes
5. Submit a pull request

## Resources

- [NATS Documentation](https://docs.nats.io)
- [n8n Documentation](https://docs.n8n.io)
- [n8n Community Forum](https://community.n8n.io)
- [NATS Slack](https://natsio.slack.com)

## Support

- **Issues**: [GitHub Issues](https://github.com/synadia/n8n-nodes-synadia/issues)
- **Discussions**: [GitHub Discussions](https://github.com/synadia/n8n-nodes-synadia/discussions)
- **NATS Support**: [Synadia Support](https://synadia.com/support)