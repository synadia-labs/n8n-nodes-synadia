# Release Process

This document describes the release process for n8n-nodes-synadia.

## Prerequisites

- npm account with publish permissions for n8n-nodes-synadia
- Git repository access with push permissions
- Node.js and npm installed locally

## Release Workflow

### 1. Create a Release Tag

Push a version tag to trigger the release verification workflow:

```bash
git tag -a v0.3.0 -m "Release v0.3.0"
git push origin v0.3.0
```

### 2. Wait for CI Verification

The GitHub Actions workflow will:
- Run all tests with coverage
- Run linting checks
- Build the package
- Verify all build artifacts exist
- Update package.json to the release version
- Create a GitHub release with changelog

Check the workflow status at: https://github.com/synadia-labs/n8n-nodes-synadia/actions

### 3. Manual npm Publish

Once the CI workflow passes:

1. Pull the latest changes (if any):
   ```bash
   git pull origin main
   ```

2. Build the package locally:
   ```bash
   npm run build
   ```

3. Publish to npm:
   ```bash
   # For stable release
   npm publish

   # For pre-release/beta
   npm publish --tag beta
   ```

## Version Management

- Release candidates: `0.3.0-rc.1`, `0.3.0-rc.2`, etc.
- Stable releases: `0.3.0`, `0.3.1`, etc.
- Pre-releases: Use `--tag beta` when publishing

## Troubleshooting

### CI Failures

If the release verification workflow fails:

1. Check the workflow logs for specific errors
2. Fix any test failures or linting issues
3. Delete the tag and create a new one:
   ```bash
   git tag -d v0.3.0
   git push origin --delete v0.3.0
   ```
4. Start the process again with a new tag

### npm Publish Errors

Common issues and solutions:

- **401 Unauthorized**: Run `npm login` to authenticate
- **403 Forbidden**: Check you have publish permissions for the package
- **Version exists**: The version has already been published; increment the version

## Post-Release

After a successful release:

1. Update the version in package.json for the next development cycle
2. Consider updating the README.md if there are new features
3. Announce the release in relevant channels