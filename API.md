# Fastify REST API Reference Manual

The REST API Gateway runs by default on `http://localhost:3000/api/v1`.

## Endpoints Summary

### System Health

- `GET /healthz`: Basic health status endpoint.
- `GET /api/v1/healthz`: Versioned system health status.

### Repositories & Git

- `POST /api/v1/repositories/index`: Trigger repository AST scanning and index.
- `GET /api/v1/repositories/diff`: Extract Git diff between commit references.

### AI Code Reviews

- `POST /api/v1/review/run`: Execute multi-agent AI review across code changes.
- `GET /api/v1/review/stream`: SSE streaming endpoint for real-time review progress.

### AI Providers & Plugin System

- `GET /api/v1/providers`: List registered provider plugins and active selection.
- `POST /api/v1/providers/switch`: Hot-switch active AI provider and model target.

### GraphRAG Repository Chat

- `POST /api/v1/chat`: Perform hybrid vector + 2-hop graph context retrieval and QA.

### Patch Generation Engine

- `POST /api/v1/patches/generate`: Generate deterministic refactoring patch candidate.

### Knowledge Graph

- `GET /api/v1/graph/nodes`: Retrieve nodes, edges, and call hierarchy for 3D visualization.

### GitHub Pull Request Reviews

- `POST /api/v1/pr/review`: Trigger PR automated code review on diff payload.
- `GET /api/v1/pr/status`: Retrieve GitHub PR check run status.

### Review Memory & Repository Intelligence

- `GET /api/v1/history`: Retrieve historical review session records.
- `GET /api/v1/trends`: Get quality trend analytics and technical debt metrics.
- `GET /api/v1/intelligence`: Query codebase architectural intelligence insights.
- `POST /api/v1/feedback`: Submit user feedback to suppress false positives.
- `GET /api/v1/hotspots`: Identify high-churn or high-complexity file hotspots.

### Extension SDK & Plugin Marketplace

- `GET /api/v1/extensions`: List all registered platform extensions.
- `GET /api/v1/extensions/:id`: Inspect extension metadata and details.
- `POST /api/v1/extensions/load`: Dynamically load extension module.
- `POST /api/v1/extensions/unload`: Unload extension module safely.
- `POST /api/v1/extensions/enable`: Enable extension.
- `POST /api/v1/extensions/disable`: Disable extension.
- `GET /api/v1/extensions/logs`: Retrieve extension execution logs.

### Enterprise Security & RBAC

- `GET /api/v1/auth/providers`: List identity authentication providers (Local, OAuth2, OIDC).
- `POST /api/v1/auth/login`: Authenticate user session.
- `POST /api/v1/auth/logout`: Logout current user session.
- `GET /api/v1/audit`: Query security audit logs.
- `GET /api/v1/users`: List registered platform users.
- `GET /api/v1/roles`: List RBAC roles and permission boundaries.
- `POST /api/v1/collaboration/comments`: Post thread comment on review finding.
- `GET /api/v1/metrics`: Telemetry metrics endpoint (JSON and Prometheus text format).

### Production Operations & Resilience

- `GET /api/v1/operations/health`: Operations health report.
- `GET /api/v1/operations/readiness`: Kubernetes readiness probe.
- `GET /api/v1/operations/liveness`: Kubernetes liveness probe.
- `GET /api/v1/operations/jobs`: List background scheduled jobs.
- `GET /api/v1/operations/cache`: Multi-tier cache statistics and hit ratio.
- `GET /api/v1/operations/performance`: Performance benchmarks and bottleneck reports.
- `GET /api/v1/operations/diagnostics`: Deep diagnostic report across subsystems.
- `POST /api/v1/operations/jobs/:id/retry`: Trigger job retry execution.
- `POST /api/v1/operations/cache/clear`: Clear all cache keys.
