# Changelog

All notable changes to the Repo Intelligence Platform project will be documented in this file.

## [v0.1.0-beta] - 2026-07-27

### Added

- **Platform Runtime Layer (`PlatformRuntime`):** Centralized lifecycle, service discovery, and graceful shutdown.
- **Typed Event Bus & Job Queue:** Asynchronous pub/sub event messaging and in-memory background job execution.
- **Fastify REST API Gateway:** Exposes REST endpoints for scan, review, retrieval, findings, patches, and chat with OpenAPI documentation.
- **Web UI Dashboard:** React/Next.js 14 web app featuring Repository Dashboard, Review Runner, Findings Explorer, Patch Previewer, Repo Chat, Knowledge Graph Viewer, and Settings.
- **`repo-intel` CLI Tool:** Terminal commands for scan, review, chat, patch, graph, and provider health checks.
- **Ollama Primary Integration:** Native support for local model runners (`llama3`, `qwen`, `mistral`, `deepseek`, `codellama`, `phi`).
- **Explainable Patch Generation Engine:** Deterministic in-memory AST refactoring simulation with safety scoring and rollback metadata.
