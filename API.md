# Fastify REST API Reference Manual

The REST API Gateway runs on `http://localhost:3000/api/v1`.

## Endpoints Summary

### Repositories

- `GET /api/v1/repositories/status`: Get indexed repository statistics.
- `POST /api/v1/repositories/scan`: Scan and index local repository path.

### AI Reviews

- `POST /api/v1/review/run`: Run multi-agent AI code review across Git diffs.
- `GET /api/v1/review/stream`: SSE streaming endpoint for review progress updates.

### AI Providers & Plugin System

- `GET /api/v1/providers`: Get installed provider plugins and active configuration.
- `GET /api/v1/providers/models`: List available models across all provider plugins.
- `GET /api/v1/providers/health`: Get real-time health metrics and latency.
- `POST /api/v1/providers/test`: Test connection availability to target provider.
- `POST /api/v1/providers/switch`: Hot-switch active AI provider and model without application restart.
- `GET /api/v1/providers/capabilities`: Retrieve capability matrix flags across plugins.
- `GET /api/v1/providers/usage`: Retrieve usage analytics, token metrics, and cost estimations.

### GraphRAG Chat

- `POST /api/v1/chat/query`: Perform GraphRAG context retrieval and response completion.

### Patch Engine

- `POST /api/v1/patches/generate`: Simulate deterministic AST refactoring patch.
- `POST /api/v1/patches/:id/accept`: Accept candidate patch.
- `POST /api/v1/patches/:id/reject`: Reject candidate patch.

### Knowledge Graph

- `GET /api/v1/graph/nodes`: Retrieve nodes and edges for visualization.
