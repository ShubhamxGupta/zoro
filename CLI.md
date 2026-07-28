# CLI Tooling Manual (`repo-intel`)

Executable CLI tool location: `apps/cli/dist/index.js`.

## Available Commands

```bash
# Scan and index target repository
node apps/cli/dist/index.js scan [repoPath]

# Run AI Code Review across Git diffs
node apps/cli/dist/index.js review

# Ask GraphRAG repository questions
node apps/cli/dist/index.js chat "<query>"

# Simulate AST refactoring patch
node apps/cli/dist/index.js patch [symbol]

# Inspect Knowledge Graph statistics
node apps/cli/dist/index.js graph

# Check AI Provider Health & Plugin System Status
node apps/cli/dist/index.js providers
node apps/cli/dist/index.js providers list
node apps/cli/dist/index.js providers health
node apps/cli/dist/index.js providers switch <provider> [model]
node apps/cli/dist/index.js providers test [provider]
node apps/cli/dist/index.js providers models
node apps/cli/dist/index.js providers capabilities
```
