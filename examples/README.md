# NATS n8n Workflow Examples

This directory contains example workflows demonstrating various NATS features in n8n.

## Available Examples

### 1. Basic Pub/Sub (`basic-pubsub.json`)
Demonstrates simple publish/subscribe messaging with Core NATS.
- Publishing messages to a subject
- Subscribing to messages
- Processing received messages

### 2. KV Store Operations (`kv-store-operations.json`)
Shows how to use NATS JetStream Key-Value store.
- Creating a KV bucket
- Storing and retrieving values
- Listing all keys
- Watching for changes in real-time

### 3. Request/Reply Pattern (`request-reply-service.json`)
Implements request/reply patterns using NATS Subscriber with reply modes.
- Setting up a service endpoint with NatsSubscriber in manual reply mode
- Making requests with NatsPublisher
- Simple echo service with NatsSubscriber in automatic reply mode
- Processing requests and sending responses

### 4. JetStream Workflow (`jetstream-workflow.json`)
Demonstrates persistent streaming with JetStream.
- Publishing to JetStream with message IDs
- Consuming from streams with durable consumers
- Message routing and processing
- Publishing processed results back to JetStream

### 5. Object Store File Handling (`object-store-file-handling.json`)
Shows file/object storage capabilities.
- Creating object store buckets
- Storing files/documents
- Listing and retrieving file information
- Watching for file changes
- Creating links to objects

## How to Use

1. **Import the workflow**:
   - Open n8n
   - Go to Workflows
   - Click "Import from File" 
   - Select the desired example JSON file

2. **Configure credentials**:
   - Create a NATS credential in n8n
   - Update the imported workflow to use your credential

3. **Customize for your needs**:
   - Modify subjects, bucket names, and other parameters
   - Add error handling as needed
   - Extend with additional processing steps

## Prerequisites

- n8n instance with n8n-nodes-synadia installed
- NATS server (with JetStream enabled for KV/Object Store examples)
- Proper authentication configured

## Tips

- Start with basic-pubsub.json to test your connection
- Use queue groups for load balancing multiple consumers
- Enable JetStream for persistence and exactly-once delivery
- Monitor NATS server logs when troubleshooting

## Additional Resources

- [NATS Documentation](https://docs.nats.io)
- [n8n Documentation](https://docs.n8n.io)
- [n8n-nodes-synadia README](../README.md)