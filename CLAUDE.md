# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is the official Synadia nodes package for n8n, providing NATS messaging system integration. The package includes nodes for Core NATS, JetStream, Key-Value store, Object Store, and Request/Reply patterns.

## Project Structure
```
n8n-nodes-synadia/
├── src/
│   ├── __tests__/                    # Test files
│   │   ├── setup.ts                  # Jest setup (mocks NATS connections)
│   │   └── nodes/                    # Node test files
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
│   ├── icons/
│   │   └── nats.svg                  # Official NATS logo from CNCF
│   └── index.ts                      # Package exports
├── dist/                             # Compiled JavaScript output
├── coverage/                         # Test coverage reports
├── package.json                      # Package configuration
├── tsconfig.json                     # TypeScript configuration
├── jest.config.js                    # Jest test configuration
├── .eslintrc.js                      # ESLint configuration
├── .gitignore                        # Git ignore rules
├── n8n.json                          # Legacy n8n configuration (deprecated)
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
npm run lint         # Run ESLint on all TypeScript files
npm run lint:n8n     # Run n8n-specific linting (excludes test files)
```

### Testing
```bash
# Run specific test file
npm test -- src/__tests__/nodes/NatsTrigger.node.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should parse JSON"

# Debug tests
npm test -- --detectOpenHandles

# Update snapshots
npm test -- -u
```

### Building and Linking
```bash
npm run build        # Compile TypeScript and copy assets
npm link             # Link package globally
cd ~/.n8n/custom     # Navigate to n8n custom nodes
npm link n8n-nodes-synadia  # Link in n8n
```

## Architecture and Patterns

### Node Structure
All nodes follow the n8n INodeType interface pattern:
```typescript
import { INodeType, INodeTypeDescription, IExecuteFunctions } from 'n8n-workflow';

export class NatsNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'NATS',
    name: 'nats',
    group: ['transform'],
    version: 1,
    description: 'Node description',
    defaults: { name: 'NATS' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'natsApi', required: true }],
    properties: [...]
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Implementation
  }
}
```

### Connection Management
The `NatsConnection.ts` utility handles all NATS connections with automatic cleanup:
- Connections are created per node execution
- Automatic reconnection with exponential backoff
- Proper cleanup in try/finally blocks
- Support for all authentication methods

### Message Parsing
The `NatsHelpers.ts` provides consistent message parsing:
- Automatic JSON parsing with fallback to string
- Binary data handling
- Header extraction
- Error context preservation

### Testing Patterns
Tests use Jest with mocked NATS connections:
```typescript
// Mock is set up in setup.ts
const mockConnect = connect as jest.MockedFunction<typeof connect>;

// In tests
mockConnect.mockResolvedValue({
  subscribe: jest.fn().mockReturnValue({
    [Symbol.asyncIterator]: async function* () {
      yield mockMsg;
    }
  }),
  close: jest.fn()
});
```

## Configuration Details

### TypeScript (tsconfig.json)
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Decorators enabled for n8n
- Source maps included

### Jest (jest.config.js)
- Preset: ts-jest
- Setup file: src/__tests__/setup.ts (mocks NATS)
- Coverage goal: >90%
- Test timeout: 30 seconds

### ESLint (.eslintrc.js)
n8n-specific configuration with some rules disabled:
- `n8n-nodes-base/node-filename-against-convention`: Tests use .test.ts
- `@typescript-eslint/no-unsafe-assignment`: n8n API requires
- `@typescript-eslint/no-unsafe-member-access`: n8n types
- `@typescript-eslint/no-unsafe-return`: n8n patterns
- `@typescript-eslint/no-unused-vars`: Destructuring patterns

### Package.json n8n Configuration
```json
"n8n": {
  "n8nNodesApiVersion": 1,
  "credentials": ["dist/credentials/NatsApi.credentials.js"],
  "nodes": [
    "dist/nodes/NatsTrigger.node.js",
    // ... all node files
  ]
}
```

## Authentication and Credentials

The package supports multiple authentication methods defined in `NatsApi.credentials.ts`:

### NatsCredentials Type
```typescript
type NatsCredentials = {
  serverUrls: string;
  connectionType: 'urlOnly' | 'usernamePassword' | 'token' | 'nkey' | 'jwt' | 'credsFile';
  username?: string;
  password?: string;
  token?: string;
  nkey?: string;
  nkeySeed?: string;
  jwt?: string;
  credsFile?: string;
  tlsCertificate?: string;
  tlsKey?: string;
  tlsCa?: string;
  rejectUnauthorized?: boolean;
  connectionName?: string;
  maxReconnectAttempts?: number;
  reconnectTimeWait?: number;
  pingInterval?: number;
  timeout?: number;
}
```

### Credentials File Support
Synadia Cloud .creds files are automatically parsed to extract JWT and NKey.

## Important Conventions

### 1. Node Development
- All nodes must extend `INodeType`
- Use `NodeConnectionType.Main` for inputs/outputs (not string literals)
- Include `manualTriggerFunction` in trigger nodes for sample data
- Always validate inputs (e.g., subject names cannot contain spaces)

### 2. Error Handling
```typescript
import { ApplicationError, NodeOperationError } from 'n8n-workflow';

// User input errors
throw new ApplicationError('Subject cannot contain spaces', { level: 'warning' });

// Operation errors
throw new NodeOperationError(this.getNode(), 'Failed to connect to NATS', { 
  description: error.message 
});
```

### 3. Sample Data Requirements
All trigger nodes must provide realistic sample data:
```typescript
async manualTriggerFunction(this: IManualTriggerFunctions): Promise<boolean> {
  const items = [{
    json: {
      subject: 'test.subject',
      data: { message: 'Sample message' },
      timestamp: new Date().toISOString()
    }
  }];
  this.emit([items]);
  return Promise.resolve(true);
}
```

### 4. Connection Cleanup
Always close connections in finally blocks:
```typescript
let nc: NatsConnection | undefined;
try {
  nc = await connect(/* options */);
  // Use connection
} finally {
  if (nc) {
    await nc.close();
  }
}
```

### 5. Icon Requirements
- Use official NATS logo from CNCF
- SVG must be 60x60 with proper viewBox
- Located at `src/icons/nats.svg`
- Copied to dist during build

## Development Workflow

### Adding a New Node
1. Create node file in `src/nodes/NodeName.node.ts`
2. Add to `package.json` under `n8n.nodes`
3. Implement required interface methods
4. Add comprehensive tests in `src/__tests__/nodes/`
5. Update README with documentation
6. Run `npm run build` and test in n8n

### Running Tests Locally
```bash
# Full test suite with coverage
npm run test:coverage

# Watch mode during development
npm run test:watch

# Single file
npm test -- src/__tests__/nodes/NatsTrigger.node.test.ts
```

### Debugging in n8n
1. Build the package: `npm run build`
2. Link globally: `npm link`
3. In n8n custom folder: `npm link n8n-nodes-synadia`
4. Start n8n with debug: `N8N_LOG_LEVEL=debug n8n start`

## Common Issues and Solutions

### Icons Not Displaying
- Ensure `npm run build` was run (copies icons to dist)
- Restart n8n after building
- Check browser console for 404 errors

### TypeScript Compilation Errors
- n8n types often require type assertions
- Use `as unknown as Type` for complex conversions
- Check `tsconfig.json` includes all source files

### Test Failures
- NATS mock may need updating in `setup.ts`
- Check async operations are properly awaited
- Verify mock data matches expected format

### ESLint Errors
- Run `npm run lint:n8n` for production (excludes tests)
- Some rules are disabled for n8n compatibility
- Check `.eslintrc.js` for rule exceptions

## Key Dependencies

### Runtime
- `n8n-workflow` (^1.82.0): Core n8n types and utilities
- `n8n-core` (^1.14.1): n8n core functionality
- `nats` (^2.29.3): Official NATS client

### Development
- `typescript` (^5.8.3): TypeScript compiler
- `jest` (^30.0.0): Testing framework
- `ts-jest` (^29.4.0): TypeScript Jest transformer
- `eslint` (^9.28.0): Linter
- `eslint-plugin-n8n-nodes-base` (^1.16.3): n8n-specific linting rules

## Project Metadata

- **Repository**: https://github.com/synadia/n8n-nodes-synadia
- **Issues**: https://github.com/synadia/n8n-nodes-synadia/issues
- **License**: ISC
- **Author**: Synadia
- **Version**: 0.2.3 (see package.json)

## Important Files

### .gitignore
Excludes:
- node_modules/
- dist/
- coverage/
- *.log
- .DS_Store
- .env

### n8n.json (Legacy)
Deprecated configuration file - all config now in package.json.

### index.ts
Empty file required for n8n package discovery - do not add exports.

## AI Assistant Instructions

When working on this codebase:

1. **Always run tests** before suggesting changes: `npm test`
2. **Check existing patterns** in similar nodes before implementing new features
3. **Use ApplicationError** for user-facing errors, not generic Error
4. **Include sample data** in all trigger nodes via manualTriggerFunction
5. **Close NATS connections** in finally blocks
6. **Follow n8n conventions** for node properties and options
7. **Test error cases** - each node should handle connection failures gracefully
8. **Maintain high coverage** - aim for >90% test coverage
9. **Update documentation** - keep README in sync with new features
10. **Respect ESLint config** - some rules are disabled for n8n compatibility