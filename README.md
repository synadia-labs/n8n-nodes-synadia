# n8n-nodes-synadia

This is an n8n community node. It lets you use NATS messaging system in your n8n workflows.

NATS is a simple, secure and performant communications system for digital systems, services and devices. It provides Core NATS for simple pub/sub messaging and JetStream for persistence, exactly-once delivery, and advanced stream processing.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Manual Installation

```bash
# Navigate to your n8n custom nodes folder
cd ~/.n8n/custom

# Clone or download this repository
git clone https://github.com/synadia-labs/n8n-nodes-synadia.git

# Install dependencies
cd n8n-nodes-synadia
npm install

# Build the nodes
npm run build
```

## Operations

### NATS Trigger
- **Subscribe to NATS subjects** - Listen for messages on Core NATS subjects with wildcard support
- **Queue groups** - Load balance messages across multiple subscribers
- **Sample data** - Built-in realistic sample data for workflow development

### NATS Publisher  
- **Publish messages** - Send messages to Core NATS subjects
- **Headers support** - Include custom headers with messages
- **Multiple formats** - JSON, string, and binary message encoding
- **Request-reply** - Send requests and wait for responses

### NATS JetStream Trigger
- **Stream consumption** - Consume messages from JetStream streams via consumers
- **Delivery policies** - Configure message delivery and acknowledgment
- **Pull options** - Control batch size and timing
- **Sample data** - Realistic JetStream message samples

### NATS JetStream Publisher
- **Stream publishing** - Publish messages to JetStream streams with persistence
- **Message deduplication** - Prevent duplicate messages with message IDs
- **Delivery confirmations** - Ensure messages are stored successfully

### NATS Key-Value Store
- **Key operations** - Get, put, update, delete, and list keys
- **Bucket management** - Create, delete, and configure KV buckets
- **Atomic updates** - Revision-based optimistic concurrency control
- **History tracking** - Access historical values for keys

### NATS Key-Value Trigger
- **Change detection** - Watch for key changes in KV buckets
- **Pattern filtering** - Monitor specific key patterns
- **Operation filtering** - Watch for specific operation types (PUT/DELETE)
- **Sample data** - Realistic KV change notifications

### NATS Object Store
- **Object operations** - Put, get, delete, and list objects
- **Bucket management** - Create, delete, and configure object buckets
- **Metadata** - Access object information and properties
- **Large file support** - Handle binary data and large objects

### NATS Object Store Trigger
- **Object monitoring** - Watch for object changes in buckets
- **Metadata tracking** - Monitor object additions, deletions, and updates
- **Pattern filtering** - Watch specific object name patterns
- **Sample data** - Realistic object change notifications

## Credentials

The NATS connection supports multiple authentication methods:

### Authentication Methods
1. **URL Only** - Simple connection without authentication
2. **Username/Password** - Basic authentication credentials  
3. **Token** - Token-based authentication
4. **NKey** - Ed25519 cryptographic key authentication
5. **JWT with NKey** - JSON Web Token with NKey signing
6. **Credentials File** - Synadia Cloud .creds file support

### Connection Setup
- **Server URLs** - Single server or comma-separated cluster URLs
- **TLS/SSL** - Certificate-based encryption and authentication
- **Connection options** - Timeouts, reconnection, and ping intervals

### Synadia Cloud
To connect to Synadia Cloud:
1. Select **Credentials File** as the connection type
2. Set Server URLs to: `tls://connect.ngs.global`
3. Paste your entire `.creds` file content into the Credentials File field
4. The authentication credentials will be automatically extracted

## Compatibility

**Minimum n8n version:** 1.82.0

**Node.js compatibility:** 18.x, 20.x

**Tested versions:**
- n8n 1.82.0+
- Node.js 18.19+, 20.10+
- NATS Server 2.10.x (for JetStream features)

**Known limitations:**
- Some TypeScript types require explicit casting due to n8n API constraints
- Icons may appear as boxes until n8n restart after installation

## Usage

### Basic Message Flow

Most NATS workflows follow this pattern:
1. **Trigger Node** - NATS Trigger, JetStream Trigger, or KV/Object Store Trigger
2. **Processing Nodes** - Transform, filter, or enrich the data
3. **Output Node** - NATS Publisher, JetStream Publisher, or other actions

### Sample Data for Development

All trigger nodes include comprehensive sample data. Click "Execute Node" on any trigger to see realistic data structures without connecting to NATS. This helps you:
- Understand available fields and data types
- Build transformations and mappings
- Test workflows offline during development

### Message Patterns

**Core NATS**: Best for simple pub/sub, request-reply, and load balancing
```
Subject: events.orders.created
Queue Group: order-processors (optional)
```

**JetStream**: Best for persistence, guaranteed delivery, and stream processing
```
Stream: ORDERS
Consumer: order-processor
Subject Filter: orders.created.*
```

**Key-Value**: Best for configuration, session storage, and distributed state
```
Bucket: user-sessions
Key Pattern: user.*.preferences
```

**Object Store**: Best for file storage, binary data, and document management
```
Bucket: documents
Object Name: reports/2024/sales-Q1.pdf
```

### Common Workflows

1. **Event Processing**: NATS Trigger → Transform → Database/API
2. **Microservice Communication**: API Trigger → NATS Publisher → NATS Trigger → Response
3. **File Processing**: Object Store Trigger → Download → Process → Upload
4. **Configuration Management**: KV Trigger → Validate → Deploy → Notify
5. **Stream Processing**: JetStream Trigger → Aggregate → JetStream Publisher

### Request-Reply Pattern

Use NATS Publisher with request-reply for synchronous communication:
```
Publisher settings:
- Subject: api.users.get
- Data: {"userId": "123"}
- Request-Reply: true (wait for response)

Service responds via NATS Trigger workflow
```

### Error Handling

- **Connection failures**: Nodes automatically retry with exponential backoff
- **Message parsing**: Invalid JSON falls back to string encoding
- **Missing resources**: Clear error messages for missing streams, buckets, etc.
- **Authentication**: Detailed error reporting for credential issues

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [NATS Documentation](https://docs.nats.io)
* [NATS JetStream Guide](https://docs.nats.io/nats-concepts/jetstream)
* [Synadia Cloud Documentation](https://docs.synadia.com)
* [NATS Community Slack](https://natsio.slack.com)

## Version history

### 0.3.0-rc.4 (Current)
- **FIXED**: Username/password authentication for local NATS servers
- **FIXED**: Removed overly restrictive stream name validation (no longer requires uppercase)
- **IMPROVED**: Uses proper TCP transport instead of WebSocket for local connections
- **IMPROVED**: Simplified stream name validation to allow any non-empty name

### 0.3.0-rc.3
- **IMPROVED**: Enhanced n8n Cloud compatibility
- **IMPROVED**: Better package dependency management

### 0.3.0-rc.2
- **IMPROVED**: Release compatibility updates

### 0.3.0-rc.1
- **BREAKING**: Consolidated nodes into unified resource-based architecture
- **NEW**: Enhanced sample data for all trigger nodes with realistic examples
- **NEW**: Comprehensive GitHub Actions CI/CD workflows
- **IMPROVED**: Fixed n8n expression format in all examples (={{}} instead of {{}})
- **IMPROVED**: Better error handling and validation across all nodes
- **IMPROVED**: Updated documentation and examples for new node structure

### 0.2.3
- **NEW**: Added Synadia Cloud .creds file support for seamless cloud connection
- **NEW**: Enhanced NATS Service node for single-node request/response patterns
- **IMPROVED**: Better authentication handling and error messages

### 0.2.2
- **NEW**: Added comprehensive sample data to all trigger nodes
- **NEW**: Enhanced error handling and validation
- **IMPROVED**: Better TypeScript types and code organization

### 0.2.1
- **NEW**: Added NATS Service node for simplified request-reply patterns
- **IMPROVED**: Enhanced message handling and encoding options
- **FIXED**: Icon path issues and display problems

### 0.2.0
- **NEW**: JetStream Key-Value Store support (CRUD operations, bucket management)
- **NEW**: JetStream Object Store support (file storage, bucket management)  
- **NEW**: Request-Reply pattern support with timeout handling
- **NEW**: Trigger nodes for KV and Object Store change detection
- **IMPROVED**: Enhanced authentication with multiple methods
- **IMPROVED**: Better error handling and validation

### 0.1.0
- **Initial Release**: Core NATS pub/sub functionality
- **Features**: Basic publishing, subscribing, queue groups
- **Auth**: Username/password and token authentication
- **Platform**: Support for n8n community node installation