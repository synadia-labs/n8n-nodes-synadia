# N8N NATS Nodes Linting Configuration

This project uses ESLint with the official N8N nodes linting plugin (`eslint-plugin-n8n-nodes-base`) to ensure code quality and N8N compatibility.

## Linting Status ✅

All linting issues have been resolved or appropriately configured:

- **Build**: ✅ Passes without errors
- **Tests**: ✅ All 51 tests passing
- **N8N Linting**: ✅ No errors

## Configuration

The ESLint configuration (`eslint.config.js`) includes:

1. **N8N Rules**: Applied from `eslint-plugin-n8n-nodes-base` for nodes, credentials, and community packages
2. **TypeScript Rules**: Configured for N8N's dynamic data handling
3. **Disabled Rules**: Some N8N rules are disabled where they conflict with TypeScript requirements or our project structure

### Key Disabled Rules:
- `node-dirname-against-convention`: Our flat structure works well for this package
- `node-class-description-inputs-wrong-regular-node`: TypeScript requires `NodeConnectionType.Main`
- `node-class-description-outputs-wrong`: TypeScript requires `NodeConnectionType.Main`
- `@typescript-eslint/no-explicit-any`: Required for N8N's dynamic data structures

## Available Scripts

```bash
# Run all linting (including tests)
npm run lint

# Run N8N-specific linting (excludes test files)
npm run lint:n8n

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Notes

- The `NodeConnectionType` import is required for TypeScript compilation but flagged as unused by ESLint. This is handled by the `varsIgnorePattern` configuration.
- The `_context` parameter in `createNatsConnection` is preserved for future use and API compatibility.
- All error handling uses N8N's `ApplicationError` and `NodeOperationError` classes as required.