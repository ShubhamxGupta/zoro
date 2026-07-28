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

# Pull Request Review Commands
node apps/cli/dist/index.js pr review [prNumber]
node apps/cli/dist/index.js pr status [prNumber]

# Repository Intelligence & History Commands
node apps/cli/dist/index.js history
node apps/cli/dist/index.js trends
node apps/cli/dist/index.js intelligence
node apps/cli/dist/index.js hotspots

# Extension Manager Commands
node apps/cli/dist/index.js extensions list
node apps/cli/dist/index.js extensions load <extensionId>
node apps/cli/dist/index.js extensions unload <extensionId>
node apps/cli/dist/index.js extensions enable <extensionId>
node apps/cli/dist/index.js extensions disable <extensionId>

# Enterprise Authentication & Security Commands
node apps/cli/dist/index.js login [username]
node apps/cli/dist/index.js logout
node apps/cli/dist/index.js whoami
node apps/cli/dist/index.js audit
node apps/cli/dist/index.js users
node apps/cli/dist/index.js roles
node apps/cli/dist/index.js metrics

# AI Provider Management Commands
node apps/cli/dist/index.js providers list
node apps/cli/dist/index.js providers health
node apps/cli/dist/index.js providers switch <provider> [model]
node apps/cli/dist/index.js providers test [provider]
node apps/cli/dist/index.js providers models
node apps/cli/dist/index.js providers capabilities

# Production Operations & Diagnostics Commands
node apps/cli/dist/index.js operations health
node apps/cli/dist/index.js operations jobs
node apps/cli/dist/index.js operations cache
node apps/cli/dist/index.js operations scheduler
node apps/cli/dist/index.js operations diagnostics
node apps/cli/dist/index.js operations retry [jobId]
```
