# Project Memory (`memory.md`)

This file is the **living state file** and **persistent engineering memory** for the Repository Intelligence & Code Review Platform project. It is continuously updated after every development task to ensure continuity across sessions for both human developers and AI assistants.

---

### Project Status

| Metric                | Status / Value                                                                  |
| :-------------------- | :------------------------------------------------------------------------------ |
| **Version**           | `0.8.0` (Repository Discovery & File Walker Initialized)                        |
| **Current Milestone** | Milestone 2: Repository Scanner & AST Parsing Engine                            |
| **Current Phase**     | Phase 08: Repository Scanner & Git Boundary Detector                            |
| **Overall Progress**  | 19.0% (8 / 42 Phases Completed)                                                 |
| **Last Updated**      | 2026-07-22                                                                      |
| **Current Branch**    | `main`                                                                          |
| **Build Status**      | 🟢 Passing (`npx tsc -b` 0 errors across 14 packages)                           |
| **Test Status**       | 🟢 Passing (56 Vitest tests passing; V8 coverage verified; Playwright suite)   |

---

## Current Focus

### Phase 08: Repository Scanner & Git Boundary Detector

- **Status:** Complete 🟢
- **Started:** 2026-07-22
- **Completed:** 2026-07-22

#### Objectives Achieved

1. Implemented repository root detection ([`root-detector.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/root-detector.ts)) searching upward for boundary markers (`.git`, `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`).
2. Built `.gitignore` and ignore rule evaluator ([`ignore-evaluator.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/ignore-evaluator.ts)) loading `.gitignore` and `.repo-intel-ignore` with default filtering for `.git`, `node_modules`, `dist`, `.next`, `coverage`, and OS system files.
3. Implemented binary file detection (`isBinaryFile`) via initial 8KB buffer null-byte `/0` inspection and symlink cycle tracker ([`file-utils.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/file-utils.ts)).
4. Built high-performance asynchronous directory walker ([`repo-walker.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/repo-walker.ts)) returning structured file manifests (`ScannedFile[]`) with progress callbacks (`ScanProgress`), sha256 hashing, and cancellation signals (`AbortSignal`).
5. Authored Vitest unit tests ([`scanner.test.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/scanner.test.ts)) and benchmark scaffolding ([`scanner.bench.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/scanner.bench.ts)).

---

## Current Working Files

```text
packages/parser/package.json
packages/parser/tsconfig.json
packages/parser/src/index.ts
packages/parser/src/scanner/scanner.types.ts
packages/parser/src/scanner/root-detector.ts
packages/parser/src/scanner/ignore-evaluator.ts
packages/parser/src/scanner/file-utils.ts
packages/parser/src/scanner/repo-walker.ts
packages/parser/src/scanner/index.ts
packages/parser/src/scanner/scanner.test.ts
packages/parser/src/scanner/scanner.bench.ts
memory.md
phases.md
```

---

## Recently Completed

### 2026-07-22

- **Phase:** Phase 08: Repository Scanner & Git Boundary Detector
- **Feature:** Standalone file system scanner and repository boundary detector in `@repo-intel/parser`, `.gitignore` rule evaluator, binary buffer inspector, symlink loop tracker, progress reporting, cancellation support, unit test suite, and benchmark scaffolding.
- **Files Created / Modified:**
  - [`packages/parser/package.json`](file:///d:/Coding/zoro/packages/parser/package.json)
  - [`packages/parser/tsconfig.json`](file:///d:/Coding/zoro/packages/parser/tsconfig.json)
  - [`packages/parser/src/index.ts`](file:///d:/Coding/zoro/packages/parser/src/index.ts)
  - [`packages/parser/src/scanner/scanner.types.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/scanner.types.ts)
  - [`packages/parser/src/scanner/root-detector.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/root-detector.ts)
  - [`packages/parser/src/scanner/ignore-evaluator.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/ignore-evaluator.ts)
  - [`packages/parser/src/scanner/file-utils.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/file-utils.ts)
  - [`packages/parser/src/scanner/repo-walker.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/repo-walker.ts)
  - [`packages/parser/src/scanner/index.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/index.ts)
  - [`packages/parser/src/scanner/scanner.test.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/scanner.test.ts)
  - [`packages/parser/src/scanner/scanner.bench.ts`](file:///d:/Coding/zoro/packages/parser/src/scanner/scanner.bench.ts)
  - [`memory.md`](file:///d:/Coding/zoro/memory.md)
  - [`phases.md`](file:///d:/Coding/zoro/phases.md)
- **Summary:** Built Phase 08 Repository Discovery & File Walker in `@repo-intel/parser`. Implemented root detection, `.gitignore` parsing, recursive traversal, binary buffer checking, symlink cycle prevention, progress reporting, and cancellation support. Verified with 56 passing Vitest unit tests across the workspace.

---

## Current TODO

1. [x] Build root detector `detectRepositoryRoot`.
2. [x] Implement `.gitignore` and `.repo-intel-ignore` evaluator.
3. [x] Implement binary file inspector and symlink cycle tracker.
4. [x] Implement `walkRepository` with progress callback and cancellation.
5. [x] Write Vitest unit tests and benchmark scaffolding.

---

## Upcoming Phase

### Phase 09: Language Detection & File Classifier

- **Goal:** Implement extension-based and shebang-based language classification in `packages/parser/src/language/` mapping files to canonical language IDs (`typescript`, `javascript`, `python`, `go`).
- **Dependencies:** Phase 08.

---

## Progress Dashboard

### Milestone 1: Project Foundation & Core Infrastructure (7 / 7 COMPLETE 🟢)

- [x] Phase 01: Monorepo & Workspace Initialization
- [x] Phase 02: Configuration Management & Environment Validation Engine
- [x] Phase 03: Structured Logger & Diagnostics Module
- [x] Phase 04: Domain Types & Shared Data Models
- [x] Phase 05: REST API Gateway Skeleton
- [x] Phase 06: Web Application Shell & Layout System
- [x] Phase 07: Testing Infrastructure & CI Pipeline Setup

### Milestone 2: Repository Scanner & AST Parsing Engine (1 / 7)

- [x] Phase 08: Repository Scanner & Git Boundary Detector
- [ ] Phase 09: Language Detection & File Classifier
- [ ] Phase 10: Incremental File Indexer & Hash Tracker
- [ ] Phase 11: Tree-Sitter AST Parsing Infrastructure
- [ ] Phase 12: TypeScript & JavaScript Symbol Extractor
- [ ] Phase 13: Python AST Symbol Extractor
- [ ] Phase 14: Go & Java AST Symbol Extractors
- [ ] Phase 15: Diff Parser & Staged Change Mapping

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
