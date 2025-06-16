# NATS WebSocket Setup Guide

This guide helps you set up NATS servers with WebSocket support for use with n8n-nodes-synadia.

## Quick Start

### 1. Using Docker (Recommended for Testing)

```bash
# Run NATS with WebSocket enabled on port 8080
docker run -d --name nats-ws \
  -p 4222:4222 \
  -p 8080:8080 \
  nats:latest \
  -js \
  --websocket \
  --websocket_port 8080 \
  --websocket_no_tls
```

Then use `ws://localhost:8080` in your n8n NATS credentials.

### 2. Using NATS Server Configuration File

Create a `nats-server.conf` file:

```conf
# Basic WebSocket configuration
websocket {
  port: 8080
  no_tls: true
}

# Enable JetStream
jetstream {
  store_dir: "./jetstream"
}

# Optional: Standard NATS port (not used by n8n-nodes-synadia)
port: 4222
```

Run with:
```bash
nats-server -c nats-server.conf
```

### 3. Secure WebSocket (WSS) Configuration

For production use with TLS:

```conf
websocket {
  port: 443
  tls {
    cert_file: "./certs/server-cert.pem"
    key_file: "./certs/server-key.pem"
  }
}
```

## Testing WebSocket Connection

### Using wscat (WebSocket CLI tool)

```bash
# Install wscat
npm install -g wscat

# Test connection
wscat -c ws://localhost:8080
```

### Using curl

```bash
# Test if WebSocket endpoint is responding
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:8080/
```

Expected response should include:
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
```

## Common Issues and Solutions

### Error: "Failed to connect to NATS: Received network error or non-101 status code"

**Causes and Solutions:**

1. **WebSocket not enabled on NATS server**
   - Add `--websocket` flag when starting NATS
   - Or add websocket configuration to config file

2. **Wrong port**
   - Default WebSocket port is 8080 (not 4222)
   - Check your NATS server logs for actual WebSocket port

3. **Firewall blocking WebSocket port**
   - Ensure port 8080 (or your configured port) is open
   - Check with: `telnet localhost 8080`

4. **Using standard NATS URL instead of WebSocket**
   - Use `ws://` not `nats://`
   - Use `wss://` not `tls://`

### Error: "Invalid credentials file format"

**Solutions:**

1. **Ensure complete file content is pasted**
   - Must include `-----BEGIN NATS USER JWT-----` line
   - Must include `-----END NATS USER JWT------` line
   - Must include `-----BEGIN USER NKEY SEED-----` line
   - Must include `-----END USER NKEY SEED------` line

2. **Check for hidden characters**
   - Copy file content from a plain text editor
   - Avoid copying from terminals that might add formatting

3. **Validate file structure**
   ```
   -----BEGIN NATS USER JWT-----
   eyJ0eXAiOiJKV1QiL...
   ------END NATS USER JWT------

   ************************* IMPORTANT *************************
   NKEY Seed printed below can be used to sign and prove identity.
   NKEYs are sensitive and should be treated as secrets.

   -----BEGIN USER NKEY SEED-----
   SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
   ------END USER NKEY SEED------
   ```

## Synadia Cloud Connection

For Synadia Cloud (NGS):

1. **Server URL**: Use one of these:
   - `wss://connect.ngs.global:443`
   - `tls://connect.ngs.global` (auto-converted to wss)
   - `connect.ngs.global` (auto-converted to wss)

2. **Authentication**: Use your `.creds` file content

3. **No server setup needed** - Synadia Cloud handles WebSocket automatically

## NATS Server Verification

Check if your NATS server has WebSocket enabled:

```bash
# Check NATS server info
nats server info

# Look for websocket section in output
# Should show something like:
# "websocket": {
#   "port": 8080,
#   "no_tls": true
# }
```

## Docker Compose Example

```yaml
version: '3.8'
services:
  nats:
    image: nats:latest
    command: 
      - "-js"
      - "--websocket"
      - "--websocket_port=8080"
      - "--websocket_no_tls"
    ports:
      - "4222:4222"  # Standard NATS (not used by n8n)
      - "8080:8080"  # WebSocket port for n8n
      - "8222:8222"  # HTTP monitoring
    volumes:
      - ./jetstream:/data
```

## Production Setup

For production environments:

1. **Use WSS (Secure WebSocket)**
   - Configure TLS certificates
   - Use port 443 for standard HTTPS/WSS

2. **Enable authentication**
   - Use NKey, JWT, or credentials file
   - Never expose unsecured WebSocket endpoints

3. **Configure proper CORS headers** (if needed)
   ```conf
   websocket {
     port: 443
     no_tls: false
     tls {
       cert_file: "./certs/cert.pem"
       key_file: "./certs/key.pem"
     }
     # CORS configuration
     allowed_origins: ["https://your-n8n-domain.com"]
   }
   ```

## JetStream and Account Restrictions

### Error: "account requires a stream config to have max bytes set"

This error occurs when your NATS account has restrictions on stream creation. Common on:
- Synadia Cloud accounts with limits
- NATS servers with account resource limits

**Solutions:**

1. **Create buckets with explicit configuration**:
   ```bash
   # Create KV bucket with max bytes set
   nats kv add my-bucket --max-bytes=1MB
   
   # Create Object Store with limits
   nats object add my-objects --max-bytes=100MB
   ```

2. **Check account limits**:
   ```bash
   nats account info
   ```

3. **For Synadia Cloud**:
   - Use the Synadia Cloud UI to create buckets with proper limits
   - Ensure your account plan supports the required resources

## Need Help?

1. Check NATS server logs: `docker logs nats-ws`
2. Verify WebSocket endpoint: `wscat -c ws://your-server:8080`
3. Test with demo server: `wss://demo.nats.io:443`
4. Check account limits: `nats account info`
5. Report issues: https://github.com/synadia-labs/n8n-nodes-synadia/issues