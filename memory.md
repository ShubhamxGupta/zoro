# Project Memory (`memory.md`)

This file is the **living state file** and **persistent engineering memory** for the Repository Intelligence & Code Review Platform project. It is continuously updated after every development task to ensure continuity across sessions for both human developers and AI assistants.

---

## Project Status

| Metric                | Status / Value                                                    |
| :-------------------- | :---------------------------------------------------------------- |
| **Version**           | `0.4.0` (Shared Domain Models Initialized)                        |
| **Current Milestone** | Milestone 1: Project Foundation & Core Infrastructure             |
| **Current Phase**     | Phase 05: REST API Gateway Skeleton                               |
| **Overall Progress**  | 9.5% (4 / 42 Phases Completed)                                    |
| **Last Updated**      | 2026-07-22                                                        |
| **Current Branch**    | `main`                                                            |
| **Build Status**      | 🟢 Passing (`npx tsc -b` 0 errors across 12 packages)             |
| **Test Status**       | 🟢 Passing (Phase 02 Config, Phase 03 Log, Phase 04 Domain Tests) |

---

## Current Focus

### Phase 05: REST API Gateway Skeleton

- **Status:** In Progress (Ready to Execute)
- **Started:** 2026-07-22
- **Expected Completion:** 2026-07-23

#### Immediate Objectives

1. Create Fastify HTTP server skeleton in `services/api/src/server.ts`.
2. Register CORS, Helmet, and Swagger OpenAPI document generator plugins.
3. Add health check endpoint (`GET /healthz`) returning system health and uptime status.
4. Add global error handler middleware integrating `@repo-intel/shared` logger and schema validation error responses.

---

## Current Working Files

```text
services/api/package.json
services/api/src/server.ts
services/api/src/routes/health.ts
services/api/src/index.ts
```

---

## Recently Completed

### 2026-07-22

- **Phase:** Phase 04: Shared Domain Models & Type Definitions
- **Feature:** Standardized domain interfaces for AST symbols, RKG Knowledge Graph, Explainable Findings, Risk Scores, PAL Provider Adapters, and Git Diff Payloads
- **Files Created / Modified:**
  - [`packages/shared/src/types/ast.types.ts`](file:///d:/Coding/zoro/packages/shared/src/types/ast.types.ts)
  - [`packages/shared/src/types/graph.types.ts`](file:///d:/Coding/zoro/packages/shared/src/types/graph.types.ts)
  - [`packages/shared/src/types/finding.types.ts`](file:///d:/Coding/zoro/packages/shared/src/types/finding.types.ts)
  - [`packages/shared/src/types/pal.types.ts`](file:///d:/Coding/zoro/packages/shared/src/types/pal.types.ts)
  - [`packages/shared/src/types/diff.types.ts`](file:///d:/Coding/zoro/packages/shared/src/types/diff.types.ts)
  - [`packages/shared/src/types/domain.test.ts`](file:///d:/Coding/zoro/packages/shared/src/types/domain.test.ts)
  - [`packages/shared/src/types/index.ts`](file:///d:/Coding/zoro/packages/shared/src/types/index.ts)
  - [`packages/shared/src/index.ts`](file:///d:/Coding/zoro/packages/shared/src/index.ts)
- **Summary:** Defined centralized TypeScript domain interfaces for `SymbolNode`, `FileNode`, `GraphNode`, `GraphEdge`, `ExplainableFinding`, `RiskScore`, `ProviderAdapter`, `CompletionRequest`, `CompletionResponse`, and `GitDiffPayload`. Verified with clean TypeScript typecheck and domain unit tests.

- **Phase:** Phase 03: Structured Logging & Telemetry Subsystem
- **Feature:** Structured JSON logger with AsyncLocalStorage context propagation & automatic secret redaction
- **Files Created / Modified:**
  - [`packages/shared/src/logging/logger.types.ts`](file:///d:/Coding/zoro/packages/shared/src/logging/logger.types.ts)
  - [`packages/shared/src/logging/redactor.ts`](file:///d:/Coding/zoro/packages/shared/src/logging/redactor.ts)
  - [`packages/shared/src/logging/context.ts`](file:///d:/Coding/zoro/packages/shared/src/logging/context.ts)
  - [`packages/shared/src/logging/logger.ts`](file:///d:/Coding/zoro/packages/shared/src/logging/logger.ts)
  - [`packages/shared/src/logging/logging.test.ts`](file:///d:/Coding/zoro/packages/shared/src/logging/logging.test.ts)
  - [`packages/shared/src/logging/index.ts`](file:///d:/Coding/zoro/packages/shared/src/logging/index.ts)
  - [`packages/shared/src/index.ts`](file:///d:/Coding/zoro/packages/shared/src/index.ts)
- **Summary:** Implemented structured JSON logger supporting log severity levels (`fatal`, `error`, `warn`, `info`, `debug`, `trace`), correlation tracing context via Node `AsyncLocalStorage`, automatic credential/token masking (`[REDACTED]`), and child logger context binding. Verified with passing unit tests.

---

## Current TODO

1. [ ] Install Fastify and essential plugins in `services/api`.
2. [ ] Implement Fastify server instance in `services/api/src/server.ts`.
3. [ ] Register GET `/healthz` route handler.
4. [ ] Write integration test for Fastify API gateway skeleton.

---

## Upcoming Phase

### Phase 06: Web Application Shell & Layout System

- **Goal:** Create Next.js App Router shell in `apps/web/` with responsive layout, sidebar, and design system color tokens.
- **Dependencies:** Phase 01 through Phase 05.
- **Expected Deliverables:** Runnable Next.js frontend application.

---

## Progress Dashboard

### Milestone 1: Project Foundation & Core Infrastructure (4 / 7)

- [x] Phase 01: Monorepo & Workspace Initialization
- [x] Phase 02: Configuration Management & Environment Validation Engine
- [x] Phase 03: Structured Logger & Diagnostics Module
- [x] Phase 04: Domain Types & Shared Data ModelsModels
- [ ] Phase 05: REST API Gateway Skeleton
- [ ] Phase 06: Web Application Shell & Layout System
- [ ] Phase 07: Testing Infrastructure & CI Pipeline Setup

### Milestone 2: Repository Scanner & AST Parsing Engine (0 / 7)

- [ ] Phase 08: Repository Scanner & Git Boundary Detector
- [ ] Phase 09: Incremental File Indexer & Hash Tracker
- [ ] Phase 10: Tree-Sitter AST Parsing Infrastructure
- [ ] Phase 11: TypeScript & JavaScript Symbol Extractor
- [ ] Phase 12: Python AST Symbol Extractor
- [ ] Phase 13: Go & Java AST Symbol Extractors
- [ ] Phase 14: Diff Parser & Staged Change Mapping

### Milestone 3: Knowledge Graph & Context Retrieval Engine (0 / 6)

- [ ] Phase 15: Symbol Resolution & Identifier Scope Mapping
- [ ] Phase 16: Module Dependency & Import Graph Builder
- [ ] Phase 17: KùzuDB Embedded Graph Storage Adapter
- [ ] Phase 18: Code Call Graph & Edge Traversal Engine
- [ ] Phase 19: Vector Embedding Storage & Semantic Search Engine
- [ ] Phase 20: Context Retrieval Engine (CRE) Subgraph Aggregator

### Milestone 4: AI Provider Abstraction Layer & Prompt Pipeline (0 / 6)

- [ ] Phase 21: Provider Abstraction Layer (PAL) Interface
- [ ] Phase 22: OpenAI & Anthropic Cloud Model Adapters
- [ ] Phase 23: Local Air-Gapped Model Adapters (Ollama & vLLM)
- [ ] Phase 24: Provider Router, Rate Limiter & Fallback Chain
- [ ] Phase 25: Prompt Engineering Framework & Context Token Pruner
- [ ] Phase 26: Response Parser & Guardrail Validation Engine

### Milestone 5: Multi-Agent Review Engine & Auto-Fix Framework (0 / 8)

- [ ] Phase 27: Explainable Review Finding Data Engine
- [ ] Phase 28: Syntax, Style & Linter Review Agent
- [ ] Phase 29: Logic, Bugs & Edge-Case Review Agent
- [ ] Phase 30: Security & Vulnerability Analysis Agent
- [ ] Phase 31: Performance & Resource Efficiency Review Agent
- [ ] Phase 32: Architecture & Dependency Impact Agent
- [ ] Phase 33: Multi-Agent Orchestrator & Risk Rating Calculator
- [ ] Phase 34: Unified Patch Generator & Auto-Fix Framework

### Milestone 6: User Interfaces, Integrations & Enterprise Readiness (0 / 8)

- [ ] Phase 35: Command Line Interface (`repo-intel` CLI)
- [ ] Phase 36: Web Dashboard & 3D Knowledge Graph Visualizer
- [ ] Phase 37: VS Code Extension Client & LSP Integration
- [ ] Phase 38: GitHub App & PR Bot Webhook Handler
- [ ] Phase 39: Repository Memory & Historical Review Knowledge Base
- [ ] Phase 40: Multi-Tenant RBAC & Security Audit Log Infrastructure
- [ ] Phase 41: End-to-End Performance Optimization & Graph Caching
- [ ] Phase 42: Production Deployment Packaging & Release Verification

---

## Active Decisions

| Decision                                   | Reason                                                                                                          | Alternatives Considered                          | Date       | Status   |
| :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- | :--------- | :------- |
| **pnpm Monorepo Workspace**                | Fast, deterministic disk-space efficient package management for multi-package architecture.                     | npm workspaces, Yarn v4                          | 2026-07-22 | Accepted |
| **Embedded Graph Storage (KùzuDB)**        | In-process high performance graph DB requiring no external service setup for local users.                       | Neo4j, Memgraph                                  | 2026-07-22 | Accepted |
| **Vanilla CSS over Tailwind for Web Core** | High customizability without utility class bloat when implementing specialized glassmorphism & 3D graph shells. | TailwindCSS v3/v4                                | 2026-07-22 | Accepted |
| **Tree-Sitter Parsing**                    | Multi-language AST parsing support with consistent node syntax tree representations.                            | Language-specific compilers (Babel, tsc, libcst) | 2026-07-22 | Accepted |

---

## Open Questions

| Priority   | Owner            | Question / Description                                                                                      | Notes                                      | Status |
| :--------- | :--------------- | :---------------------------------------------------------------------------------------------------------- | :----------------------------------------- | :----- |
| **Medium** | Engineering Lead | Should KùzuDB native bindings be compiled as WASM for browser preview mode or kept exclusively backend/CLI? | Investigate in Phase 17.                   | Open   |
| **Low**    | DevOps Team      | Optimal default token budget threshold for local Ollama models vs cloud GPT-4o models.                      | Test token pruning benchmarks in Phase 25. | Open   |

---

## Known Issues

_No known runtime issues currently logged (project in initialization phase)._

---

## Technical Debt

| Reason                                                           | Priority | Estimated Effort | When to Address     |
| :--------------------------------------------------------------- | :------- | :--------------- | :------------------ |
| Single-file placeholder workspace configs pending full packaging | Low      | 0.5 days         | Phase 01 completion |

---

## Recent File Changes

| Path                                                        | Reason                                   | Date       | Status   |
| :---------------------------------------------------------- | :--------------------------------------- | :--------- | :------- |
| [`prd.md`](file:///d:/Coding/zoro/prd.md)                   | Initial product requirements definition  | 2026-07-22 | Complete |
| [`architecture.md`](file:///d:/Coding/zoro/architecture.md) | Technical system architecture design     | 2026-07-22 | Complete |
| [`rules.md`](file:///d:/Coding/zoro/rules.md)               | Engineering standards & coding rules     | 2026-07-22 | Complete |
| [`design.md`](file:///d:/Coding/zoro/design.md)             | Visual design system & UX specifications | 2026-07-22 | Complete |
| [`phases.md`](file:///d:/Coding/zoro/phases.md)             | 42-phase granular execution roadmap      | 2026-07-22 | Complete |

---

## Repository Health

- **Build:** 🟡 Pending Initialization
- **Lint:** 🟢 Configured (ESLint / Prettier pending setup)
- **Tests:** 🟡 Pending Setup (Vitest in Phase 07)
- **Coverage:** 🟡 Not Measured
- **Performance:** 🟢 Baseline Blueprint Verified
- **Security:** 🟢 Zero-Data-Retention & Air-Gap Standards Enforced in Specification
- **Documentation:** 🟢 Complete & Aligned

---

## AI Context

### Core Architectural Assumptions

- **Monorepo structure:** `apps/` (web, cli, vscode), `packages/` (common, parser, graph, ai, agents, review-engine, patch-gen).
- **Deterministic first:** AST parsing and Knowledge Graph traversal execute before sending context to LLMs.
- **PAL Isolation:** AI Provider Abstraction Layer (`packages/ai`) encapsulates model vendor API differences.

### Strict Conventions

- All code written in TypeScript with strict type checking enabled (`strict: true`, no `any` allowed).
- Custom CSS / design variables defined in `index.css` for web app components.
- No raw file system mutations outside designated workspace paths.

### Files That Should Not Be Modified Unnecessarily

- `prd.md`, `architecture.md`, `rules.md`, `design.md`, `phases.md` (require explicit architectural change approval).

---

## Important Files

- [`prd.md`](file:///d:/Coding/zoro/prd.md) — Product requirements document & feature matrix.
- [`architecture.md`](file:///d:/Coding/zoro/architecture.md) — System architecture, data flow, graph schemas.
- [`rules.md`](file:///d:/Coding/zoro/rules.md) — Engineering guidelines, coding standards, error handling rules.
- [`design.md`](file:///d:/Coding/zoro/design.md) — Design system specification, component tokens, aesthetic guidelines.
- [`phases.md`](file:///d:/Coding/zoro/phases.md) — 42-phase sequential development roadmap.
- [`memory.md`](file:///d:/Coding/zoro/memory.md) — Living state file & persistent engineering memory (this file).

---

## Blockers

_No active blockers._

---

## Notes for the Next Development Session

### Handoff Summary

- **What was completed:** Comprehensive documentation suite (`prd.md`, `architecture.md`, `rules.md`, `design.md`, `phases.md`) and persistent state memory (`memory.md`) created and aligned.
- **What should be done next:** Begin **Phase 01: Monorepo & Workspace Initialization**. Create root `package.json`, `pnpm-workspace.yaml`, and `tsconfig.base.json`.
- **Files to open first:**
  1. [`rules.md`](file:///d:/Coding/zoro/rules.md)
  2. [`phases.md`](file:///d:/Coding/zoro/phases.md#L40) (Phase 01 task details)
  3. [`memory.md`](file:///d:/Coding/zoro/memory.md)
- **Key Pitfalls / Warnings:** Ensure `pnpm` workspace syntax matches pnpm v8+ specifications. Do not install global dependencies inside individual package subdirectories.

---

## Update Rules

This `memory.md` file **MUST** be updated:

1. Immediately upon completing any phase or milestone.
2. Whenever a feature is added, updated, or removed.
3. Whenever a new file or module is created or deleted.
4. Whenever an active technical decision is made or changed.
5. When a blocker is encountered or resolved.
6. When changing active working files or starting a new phase task.
7. At the end of every coding turn/session before handing off.

---

## Maintenance Rules

1. Represent the **current state only**.
2. Never copy-paste long passages from `prd.md` or `architecture.md`; reference them via markdown file links instead.
3. Maintain chronological order in `Recently Completed`.
4. Ensure there is strictly **one active task** in `Current Focus`.
