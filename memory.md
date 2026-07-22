# Project Memory (`memory.md`)

This file is the **living state file** and **persistent engineering memory** for the Repository Intelligence & Code Review Platform project. It is continuously updated after every development task to ensure continuity across sessions for both human developers and AI assistants.

---

## Project Status

| Metric                | Status / Value                                                         |
| :-------------------- | :--------------------------------------------------------------------- |
| **Version**           | `0.6.0` (Web Application Shell & Hardened Foundation Initialized)      |
| **Current Milestone** | Milestone 1: Project Foundation & Core Infrastructure                  |
| **Current Phase**     | Phase 06: Web Application Shell & Layout System                        |
| **Overall Progress**  | 14.3% (6 / 42 Phases Completed)                                        |
| **Last Updated**      | 2026-07-22                                                             |
| **Current Branch**    | `main`                                                                 |
| **Build Status**      | 🟢 Passing (`npx tsc -b` 0 errors across 12 packages)                  |
| **Test Status**       | 🟢 Passing (11/11 Unit & Integration Tests; API & Web Builds Verified) |

---

## Current Focus

### Phase 06: Web Application Shell & Layout System

- **Status:** Complete 🟢
- **Started:** 2026-07-22
- **Completed:** 2026-07-22

#### Objectives Achieved

1. Created Next.js App Router application shell in `apps/web/` (`next` v14, `react`, `react-dom`, `lucide-react`).
2. Modularized Vanilla CSS Design Tokens into `styles/tokens.css`, `typography.css`, `layout.css`, `animations.css`, `utilities.css`, imported into `app/globals.css`.
3. Built client-side theme engine (`ThemeProvider`) supporting dark mode by default (`:root[data-theme="dark"]`) and soft light mode parity (`:root[data-theme="light"]`).
4. Built navigation shell components: Header (`48px`), Sidebar (`240px` collapsible to `48px`), Footer Status Bar (`24px`), and responsive drawer layout.
5. Created accessible UI primitives & component barrels: `Button`, `Badge`, `Card`, `Input`/`Select`, `Skeleton`, `EmptyState`, `Modal`, `CommandPalette`, and `Icon` wrappers.
6. Implemented interactive Dashboard feature components in `components/dashboard/`: `MetricCards`, `FindingsList`, `CodeViewerPane`, and `GraphVisualizerPane`.
7. Introduced shared error codes (`ErrorCode`, `ApiError`) and system constants (`APP_VERSION`, `API_V1_PREFIX`) in `@repo-intel/shared`.

---

## Current Working Files

```text
apps/web/package.json
apps/web/next.config.mjs
apps/web/tsconfig.json
apps/web/app/globals.css
apps/web/app/layout.tsx
apps/web/app/page.tsx
apps/web/app/loading.tsx
apps/web/app/error.tsx
apps/web/app/not-found.tsx
apps/web/components/theme-provider.tsx
apps/web/components/ui/index.ts
apps/web/components/layout/index.ts
apps/web/components/icons/index.tsx
apps/web/components/charts/index.ts
apps/web/components/dashboard/index.ts
services/api/src/server.ts
packages/shared/src/index.ts
```

---

## Recently Completed

### 2026-07-22

- **Phase:** Phase 06: Web Application Shell & Layout System
- **Feature:** Next.js App Router application shell, modularized Vanilla CSS design tokens manifest, dark/light theme engine, responsive navigation shell, metric cards, findings split-pane view, knowledge graph visualizer container, command palette, error/loading/404 boundaries, shared error codes, system constants, and API modularization.
- **Files Created / Modified:**
  - [`apps/web/package.json`](file:///d:/Coding/zoro/apps/web/package.json)
  - [`apps/web/next.config.mjs`](file:///d:/Coding/zoro/apps/web/next.config.mjs)
  - [`apps/web/tsconfig.json`](file:///d:/Coding/zoro/apps/web/tsconfig.json)
  - [`apps/web/app/globals.css`](file:///d:/Coding/zoro/apps/web/app/globals.css)
  - [`apps/web/styles/tokens.css`](file:///d:/Coding/zoro/apps/web/styles/tokens.css)
  - [`apps/web/styles/typography.css`](file:///d:/Coding/zoro/apps/web/styles/typography.css)
  - [`apps/web/styles/layout.css`](file:///d:/Coding/zoro/apps/web/styles/layout.css)
  - [`apps/web/styles/animations.css`](file:///d:/Coding/zoro/apps/web/styles/animations.css)
  - [`apps/web/styles/utilities.css`](file:///d:/Coding/zoro/apps/web/styles/utilities.css)
  - [`apps/web/app/layout.tsx`](file:///d:/Coding/zoro/apps/web/app/layout.tsx)
  - [`apps/web/app/page.tsx`](file:///d:/Coding/zoro/apps/web/app/page.tsx)
  - [`apps/web/app/loading.tsx`](file:///d:/Coding/zoro/apps/web/app/loading.tsx)
  - [`apps/web/app/error.tsx`](file:///d:/Coding/zoro/apps/web/app/error.tsx)
  - [`apps/web/app/not-found.tsx`](file:///d:/Coding/zoro/apps/web/app/not-found.tsx)
  - [`apps/web/components/theme-provider.tsx`](file:///d:/Coding/zoro/apps/web/components/theme-provider.tsx)
  - [`apps/web/components/ui/index.ts`](file:///d:/Coding/zoro/apps/web/components/ui/index.ts)
  - [`apps/web/components/ui/command-palette.tsx`](file:///d:/Coding/zoro/apps/web/components/ui/command-palette.tsx)
  - [`apps/web/components/layout/index.ts`](file:///d:/Coding/zoro/apps/web/components/layout/index.ts)
  - [`apps/web/components/icons/index.tsx`](file:///d:/Coding/zoro/apps/web/components/icons/index.tsx)
  - [`apps/web/components/charts/index.ts`](file:///d:/Coding/zoro/apps/web/components/charts/index.ts)
  - [`apps/web/components/dashboard/index.ts`](file:///d:/Coding/zoro/apps/web/components/dashboard/index.ts)
  - [`packages/shared/src/errors/error.codes.ts`](file:///d:/Coding/zoro/packages/shared/src/errors/error.codes.ts)
  - [`packages/shared/src/constants/index.ts`](file:///d:/Coding/zoro/packages/shared/src/constants/index.ts)
  - [`services/api/src/plugins/security.plugin.ts`](file:///d:/Coding/zoro/services/api/src/plugins/security.plugin.ts)
  - [`services/api/src/plugins/swagger.plugin.ts`](file:///d:/Coding/zoro/services/api/src/plugins/swagger.plugin.ts)
  - [`services/api/src/middleware/request-tracing.middleware.ts`](file:///d:/Coding/zoro/services/api/src/middleware/request-tracing.middleware.ts)
  - [`services/api/src/middleware/error.handler.ts`](file:///d:/Coding/zoro/services/api/src/middleware/error.handler.ts)
  - [`services/api/src/routes/health.ts`](file:///d:/Coding/zoro/services/api/src/routes/health.ts)
  - [`services/api/src/server.ts`](file:///d:/Coding/zoro/services/api/src/server.ts)
- **Summary:** Completed Next.js Web Application Shell & Layout System in `apps/web/`, hardened core foundation across shared errors and constants, modularized CSS and component barrels, and built the full interactive Dashboard view. Verified with clean TypeScript composite typecheck (`tsc -b`), passing test suite (11/11 passing), and static Next.js production builds.

---

## Current TODO

1. [x] Harden foundation across `@repo-intel/shared` and `@repo-intel/api`.
2. [x] Modularize CSS stylesheets into `styles/` tokens, typography, layout, animations, utilities.
3. [x] Build reusable component barrels (`components/ui/`, `components/layout/`, `components/icons/`, `components/charts/`, `components/dashboard/`).
4. [x] Implement Dashboard View (`MetricCards`, `FindingsList`, `CodeViewerPane`, `GraphVisualizerPane`, `CommandPalette`).
5. [x] Run production builds and unit test verification.

---

## Upcoming Phase

### Phase 07: Testing Infrastructure & CI Pipeline Setup

- **Goal:** Setup Vitest test runner across workspace and GitHub Actions CI workflow file.
- **Dependencies:** Phase 01 through Phase 06.
- **Expected Deliverables:** Automated CI pipeline passing on repository pushes.

---

## Progress Dashboard

### Milestone 1: Project Foundation & Core Infrastructure (6 / 7)

- [x] Phase 01: Monorepo & Workspace Initialization
- [x] Phase 02: Configuration Management & Environment Validation Engine
- [x] Phase 03: Structured Logger & Diagnostics Module
- [x] Phase 04: Domain Types & Shared Data Models
- [x] Phase 05: REST API Gateway Skeleton
- [x] Phase 06: Web Application Shell & Layout System
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
- [`decisions.md`](file:///d:/Coding/zoro/decisions.md) — Permanent Architecture Decision Records (ADRs).
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
