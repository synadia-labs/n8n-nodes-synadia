# Security Status

## Production Dependencies
✅ **0 vulnerabilities** in production dependencies

All NATS-related dependencies have been bundled into `src/bundled/nats-bundled.js` to avoid runtime dependency issues and ensure security.

## Development Dependencies
⚠️ 12 vulnerabilities in development dependencies (5 moderate, 5 high, 2 critical)

These vulnerabilities exist in `n8n-node-dev` and its transitive dependencies. Since this is a development-only dependency and is not included in the published npm package, these vulnerabilities do not affect users of the package.

### Known Dev Vulnerabilities:
- axios (CSRF and SSRF vulnerabilities)
- crypto-js (weak PBKDF2 implementation)
- lodash.pick and lodash.set (prototype pollution)
- request (deprecated, SSRF vulnerability)
- tough-cookie (prototype pollution)
- xml2js (prototype pollution)

## Actions Taken
1. Updated n8n-core from 1.14.1 to 1.82.0
2. Kept n8n-workflow at 1.82.0
3. Updated all other dependencies to their latest versions
4. Bundled all NATS dependencies to eliminate runtime security concerns
5. Verified all tests pass after updates
6. Confirmed build process works correctly

## Recommendations
- The dev dependency vulnerabilities are acceptable since they don't affect the published package
- Monitor for updates to n8n-node-dev that may resolve these issues
- Continue using bundled dependencies for production to maintain security

## Running Security Checks
```bash
# Check all vulnerabilities
npm audit

# Check production vulnerabilities only
npm audit --production

# Update dependencies
npm update
npm audit fix
```

Last security audit: 2025-06-17