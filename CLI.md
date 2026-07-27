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

# Check AI Provider Health Status
node apps/cli/dist/index.js providers
```
