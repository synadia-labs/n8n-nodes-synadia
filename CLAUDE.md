# n8n-nodes-Synadia Project Guide

## Project Overview
This is the official Synadia nodes package for n8n, providing NATS messaging system integration. The package includes nodes for Core NATS, JetStream, Key-Value store, Object Store, and Request/Reply patterns.

## Documentation Notes
- The only place to find documentation we can rely on about nats.js is https://nats-io.github.io/nats.js/

## Project Structure
```
n8n-nodes-synadia/
├── src/
│   ├── credentials/
│   │   └── NatsApi.credentials.ts    # NATS connection credentials
│   ├── nodes/
│   │   ├── NatsTrigger.node.ts       # Trigger for NATS messages
│   │   ├── NatsPublisher.node.ts     # Publish messages to NATS
│   │   ├── NatsKv.node.ts            # Key-Value operations
│   │   ├── NatsKvTrigger.node.ts     # Watch KV changes
│   │   ├── NatsObjectStore.node.ts   # Object storage operations
│   │   ├── NatsObjectStoreTrigger.node.ts  # Watch object changes
│   │   ├── NatsRequestReply.node.ts  # Send requests and wait for replies
│   │   ├── NatsServiceReply.node.ts  # Respond to requests as a service
│   │   └── NatsService.node.ts       # All-in-one request/response service
│   ├── utils/
│   │   ├── NatsConnection.ts         # Connection management
│   │   └── NatsHelpers.ts            # Message parsing and validation
│   └── icons/
│       └── nats.svg                  # Official NATS logo from CNCF
├── dist/                             # Compiled JavaScript output
├── package.json                      # Package configuration
└── README.md                         # User documentation
```

## Key Commands

### Development
```bash
npm run dev          # Watch mode for development
npm run build        # Build TypeScript and copy icons
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint         # Run ESLint
npm run lint:n8n     # Run n8n-specific linting (excludes test files)
```

### Testing
Always run tests before committing:
```bash
npm test
```

### Building
The build process compiles TypeScript and copies icons:
```bash
npm run build
npm link
```

## Important Conventions

### 1. Node Development
- All nodes must extend `INodeType`
- Use `NodeConnectionType.Main` for inputs/outputs (not string literals)
- Include `manualTriggerFunction` in trigger nodes for sample data
- Always validate inputs (e.g., subject names cannot contain spaces)

### 2. Error Handling
- Use `ApplicationError` from n8n-workflow for user-facing errors
- Always close NATS connections in cleanup functions
- Provide clear error messages with context

### 3. Authentication
The package supports multiple authentication methods:
- URL only (no auth)
- Username/Password
- Token
- NKey
- JWT with NKey
- Credentials File (.creds from Synadia Cloud)

### 4. Icon Requirements
- Use the official NATS logo from CNCF artwork
- SVG must be 60x60 with proper viewBox
- Located at `src/icons/nats.svg`
- No modifications to the official logo

### 5. Testing Requirements
- Maintain >90% test coverage
- Mock all external dependencies (NATS connections)
- Test error cases and edge conditions
- Use Jest with n8n testing patterns

### 6. Linting
The project uses n8n-specific ESLint rules:
- Some rules are disabled in `.eslintrc.js` for n8n compatibility
- Always run `npm run lint` before committing
- Fix any linting errors that aren't explicitly disabled

### 7. Sample Data
All trigger nodes must provide sample data via `manualTriggerFunction`:
- Realistic data structure matching actual NATS messages
- Include all fields that would be present in real messages
- Use current timestamps
- Follow the exact format users will receive

### 8. Git Commits
- Sign commits with: `Signed-off-by: Name <email>`
- Use conventional commit format (feat:, fix:, docs:, etc.)
- Include clear descriptions of changes
- Reference issues if applicable

## Common Tasks

### Adding a New Node
1. Create the node file in `src/nodes/`
2. Add to `package.json` under `n8n.nodes`
3. Implement required interface methods
4. Add comprehensive tests
5. Update README with documentation

### Updating Credentials
1. Edit `src/credentials/NatsApi.credentials.ts`
2. Add new authentication options or fields
3. Update `NatsConnection.ts` to handle new auth
4. Add tests for new authentication method

### Fixing Icon Issues
1. Icon must be at `src/icons/nats.svg`
2. Use official NATS logo without modifications
3. Run `npm run build` to copy to dist
4. Restart n8n to see changes

## Project-Specific Notes

### NATS Features Implemented
- Core NATS pub/sub with wildcards
- JetStream streams and consumers
- Key-Value buckets (CRUD operations)
- Object Store (file storage)
- Request/Reply patterns
- Queue groups for load balancing

### Known Issues
- Icons may show as boxes until n8n is restarted
- JetStream requires NATS server 2.2.0+
- Some TypeScript types require casting due to n8n API

### Version History
- 0.1.0: Initial release with basic NATS functionality
- 0.2.0: Added KV, Object Store, and Request/Reply nodes
- 0.2.1: Added sample data to all trigger nodes
- 0.2.2: Added Synadia Cloud .creds file support
- 0.2.3: Added NATS Service node for single-node request/response