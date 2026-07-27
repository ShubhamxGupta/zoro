# Implementation Roadmap: Repository Intelligence & Code Review Platform

**Document Version:** 1.0.0  
**Status:** Approved for Implementation Execution  
**Target Audience:** Engineering Lead, Core Software Engineers, AI System Engineers, DevOps Engineers  
**Date:** July 2026

---

## Executive Summary & Roadmap Strategy

This document defines the incremental execution roadmap for building the **Repository Intelligence & Code Review Platform**. To minimize risk, eliminate refactoring overhead, and maintain a continuously runnable project state, the implementation is divided into **42 granular, sequential phases** grouped into **6 major milestones**.

```mermaid
graph LR
    M1[Milestone 1: Foundation] --> M2[Milestone 2: Repo & AST Engine]
    M2 --> M3[Milestone 3: Knowledge Graph & CRE]
    M3 --> M4[Milestone 4: AI & PAL Layer]
    M4 --> M5[Milestone 5: Multi-Agent Review]
    M5 --> M6[Milestone 6: Interfaces & Enterprise]
```

### Development Philosophy & Sequencing Rules

1. **Infrastructure & Types First:** Foundation, configuration, logging, and shared domain models exist before core logic.
2. **Deterministic Understanding Before AI:** Repository scanning, Tree-Sitter AST parsing, call graphs, and graph retrieval **MUST** be fully functional before introducing LLMs.
3. **No Skipped Checkpoints:** Every phase produces an independently testable, working deliverable.
4. **Strict Alignment:** All implementation work **MUST** conform to [prd.md](file:///d:/Coding/zoro/prd.md), [architecture.md](file:///d:/Coding/zoro/architecture.md), and [rules.md](file:///d:/Coding/zoro/rules.md).

---

## Milestone 1: Project Foundation & Core Infrastructure

### Milestone 1 Goal

Establish the monorepo workspace, build toolchain, environment configuration system, structured logging, backend REST API gateway skeleton, web application shell, and CI testing setup.

---

### Phase 01: Monorepo & Workspace Initialization

- **Goal:** Initialize the pnpm monorepo workspace structure with root configuration and build scripts.
- **Why This Phase Exists:** Core dependencies and package boundaries must be defined before writing application code.
- **Features:** pnpm monorepo workspace, root TypeScript configuration, ESLint, Prettier, and basic build pipeline.
- **Tasks:**
  - Initialize root `package.json` and `pnpm-workspace.yaml`.
  - Create folder structure (`apps/`, `packages/`, `services/`, `configs/`, `scripts/`, `tests/`).
  - Configure `tsconfig.base.json` with strict type-checking settings.
  - Configure ESLint and Prettier root configuration files.
  - Add build scripts using TurboRepo or pnpm scripts.
- **Deliverables:** Working monorepo workspace with passing lint and type-check commands.
- **Dependencies:** None.
- **Acceptance Criteria:** `pnpm build`, `pnpm lint`, and `pnpm check-types` complete with 0 errors across all subfolders.
- **Testing:**
  - _Unit Tests:_ N/A.
  - _Manual Testing:_ Run workspace build and lint scripts from root terminal.
  - _Edge Cases:_ Ensure sub-packages resolve root tsconfig path aliases correctly.
- **Risks:** Misconfigured TypeScript path aliases across workspace boundaries.
- **Estimated Complexity:** Low.
- **Estimated Time:** 1 day.

---

### Phase 02: Configuration Management & Environment Validation

- **Goal:** Implement a centralized, schema-validated configuration loader in `packages/shared/`.
- **Why This Phase Exists:** Services require strongly-typed environment configuration loaded safely at startup.
- **Features:** Environment variable parser with Zod schema validation and sensible defaults.
- **Tasks:**
  - Create `packages/shared/src/config/env.schema.ts`.
  - Implement configuration loader supporting `.env` file reading.
  - Add validation for database connection strings, server port numbers, log levels, and provider keys.
  - Export frozen, strongly-typed `config` object.
- **Deliverables:** `packages/shared` package exporting validated configuration loader.
- **Dependencies:** Phase 01.
- **Acceptance Criteria:** Application crashes gracefully with readable validation errors if required variables are missing.
- **Testing:**
  - _Unit Tests:_ Test invalid port numbers, missing required variables, and default fallbacks.
  - _Edge Cases:_ Verify behavior when environment variables contain unexpected string formats.
- **Risks:** Unhandled schema parsing exceptions masking root config issues.
- **Estimated Complexity:** Low.
- **Estimated Time:** 0.5 days.

---

### Phase 03: Structured Logging & Telemetry Subsystem

- **Goal:** Implement a JSON structured logging package using Pino in `packages/shared/`.
- **Why This Phase Exists:** Consistent log outputs with correlation IDs are mandatory across API services and background workers.
- **Features:** Structured JSON logger with log levels, correlation ID injection, and sensitive data masking.
- **Tasks:**
  - Integrate Pino logger in `packages/shared/src/logging/`.
  - Create log formatters for JSON emission.
  - Implement request/correlation ID context wrapper.
  - Add sanitization transformers to automatically redact API keys, tokens, and passwords.
- **Deliverables:** Shared logging utility exported for all services.
- **Dependencies:** Phase 02.
- **Acceptance Criteria:** Logs output strictly structured JSON; secrets and API keys are automatically masked.
- **Testing:**
  - _Unit Tests:_ Test logger outputs with mock secret strings to confirm masking logic.
- **Risks:** Performance overhead if masking regexes are overly complex.
- **Estimated Complexity:** Low.
- **Estimated Time:** 0.5 days.

---

### Phase 04: Shared Domain Models & Type Definitions

- **Goal:** Define core TypeScript interfaces and domain schemas in `packages/shared/`.
- **Why This Phase Exists:** Domain types (AST nodes, Graph schemas, Finding payloads) must be standardized before building engines.
- **Features:** TypeScript interfaces for SymbolNode, GraphEdge, FindingPayload, ProviderConfig, and GitDiffPayload.
- **Tasks:**
  - Create domain model schemas in `packages/shared/src/types/`.
  - Define `SymbolNode`, `FileNode`, `GraphEdge` interfaces.
  - Define `ExplainableFinding` JSON schema matching Section 8.2 of PRD.
  - Define `ProviderAdapter` and `CompletionRequest` interfaces matching Architecture specs.
- **Deliverables:** Centralized domain type declarations exported by `packages/shared/`.
- **Dependencies:** Phase 01.
- **Acceptance Criteria:** All core domain structures are strongly typed without `any` usage.
- **Testing:**
  - _Unit Tests:_ Type assignment and Zod schema validation tests for finding payloads.
- **Risks:** Future refactoring if initial types do not accommodate complex multi-language AST structures.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1 day.

---

### Phase 05: Backend API Gateway Skeleton (Fastify)

- **Status:** Completed 🟢
- **Goal:** Create the initial REST API Gateway application shell using Fastify in `services/api/`.
- **Why This Phase Exists:** Provides the HTTP foundation for API routing, health checks, and middleware handlers.
- **Features:** Fastify HTTP server, OpenAPI spec generator (Swagger/Swagger UI), global error handler, request correlation tracking (`x-request-id`), and health check route.
- **Tasks Completed:**
  - Initialized Fastify server factory in [`services/api/src/server.ts`](file:///d:/Coding/zoro/services/api/src/server.ts).
  - Registered `@fastify/cors`, `@fastify/helmet`, `@fastify/swagger`, and `@fastify/swagger-ui` plugins.
  - Implemented `GET /healthz` and versioned `GET /api/v1/healthz` endpoints returning server status, uptime, timestamp, and version.
  - Attached custom `onRequest` hook for `x-request-id` propagation into `@repo-intel/shared` AsyncLocalStorage logger context.
  - Attached global error handler and 404 handler mapping domain & routing errors to standardized JSON payloads.
- **Deliverables:** Runnable Fastify backend server in `services/api/` with passing integration test suite in [`services/api/src/server.test.ts`](file:///d:/Coding/zoro/services/api/src/server.test.ts).
- **Dependencies:** Phase 02, Phase 03, Phase 04.
- **Acceptance Criteria:** `services/api` builds cleanly with 0 TypeScript compilation errors; `GET /healthz` returns `200 OK` with valid system status JSON.
- **Testing:**
  - _Integration Tests:_ Unit & integration tests in `services/api/src/server.test.ts` covering `/healthz`, `/api/v1/healthz`, `/documentation`, `/documentation/json`, `x-request-id` correlation tracing, 404 responses, and uncaught error formatting (11 / 11 passing).
- **Risks:** None (Resolved plugin initialization order & typescript references).
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1 day.

---

### Phase 06: Next.js Web Application Foundation & Dashboard

- **Status:** Completed 🟢
- **Goal:** Create the Next.js frontend application shell and interactive Dashboard in `apps/web/`.
- **Why This Phase Exists:** Provides the base web UI workspace for dashboard layout, routing, review findings, and component themes.
- **Features:** Next.js App Router shell, Vanilla CSS design tokens manifest, dark/light theme engine, navigation shell (Header, Sidebar, Footer), metric cards, findings split-pane view, knowledge graph visualizer container, command palette (`⌘K`), and error/loading/404 boundaries.
- **Tasks Completed:**
  - Initialized Next.js 14 App Router application shell in [`apps/web/`](file:///d:/Coding/zoro/apps/web/).
  - Modularized Vanilla CSS Design Tokens manifest into `styles/tokens.css`, `typography.css`, `layout.css`, `animations.css`, `utilities.css`.
  - Built client-side theme engine (`ThemeProvider`) supporting dark mode default and soft light mode parity.
  - Built navigation shell: Header (`48px`), Sidebar (`240px`/`48px`), Footer Status Bar (`24px`), and responsive drawer layout.
  - Built accessible UI primitives & component barrels (`Button`, `Badge`, `Card`, `Input`, `Select`, `Skeleton`, `EmptyState`, `Modal`, `CommandPalette`, `Icon`).
  - Built interactive Dashboard feature view components (`MetricCards`, `FindingsList`, `CodeViewerPane`, `GraphVisualizerPane`).
- **Deliverables:** Runnable Next.js frontend application in `apps/web/` launching on port 3001 with passing Next.js production build (`npm run build`).
- **Dependencies:** Phase 01 through Phase 05.
- **Acceptance Criteria:** `apps/web` compiles with 0 TypeScript errors; `npm run build --workspace=@repo-intel/web` generates static pages successfully.
- **Testing:**
  - _Manual & Build Verification:_ Production build verified (`✓ Compiled successfully`, 4/4 static pages generated); 11/11 workspace unit & integration tests passing.
- **Risks:** None.
- **Estimated Complexity:** Low.
- **Estimated Time:** 1 day.

---

### Phase 07: Testing Infrastructure & CI Pipeline Setup

- **Status:** Completed 🟢
- **Goal:** Setup Vitest test runner across workspace, Playwright E2E smoke tests, `@repo-intel/testing` mock package, and GitHub Actions CI workflow.
- **Why This Phase Exists:** Guarantees automated test execution, code coverage reporting, and linting quality gates on every pull request.
- **Features:** Vitest workspace runner setup (`vitest.config.ts`, `vitest.workspace.ts`), V8 coverage reporting, Playwright E2E smoke testing (`playwright.config.ts`, `smoke.spec.ts`), shared mock package (`@repo-intel/testing`), and multi-job GitHub Actions workflow (`.github/workflows/ci.yml`).
- **Tasks Completed:**
  - Configured `vitest.workspace.ts` and `vitest.config.ts` at monorepo root with V8 coverage threshold checks.
  - Created shared testing package `@repo-intel/testing` with `MockLogger` and domain entity factories.
  - Created Playwright E2E smoke test suite in `apps/web/e2e/smoke.spec.ts`.
  - Created `.github/workflows/ci.yml` running lint, type-check, Vitest coverage, Playwright e2e, and production builds.
- **Deliverables:** Automated CI pipeline passing on repository pushes; 46 passing Vitest unit/integration tests with V8 coverage reporting.
- **Dependencies:** Phase 01 through Phase 06.
- **Acceptance Criteria:** `vitest run` executes tests across all sub-packages; `npm run build` succeeds; GitHub Actions workflow passes cleanly.
- **Testing:**
  - _Automated:_ Local Vitest execution (46/46 passing) and Playwright E2E smoke test execution verified.
- **Risks:** None.
- **Estimated Complexity:** Low.
- **Estimated Time:** 0.5 days.

---

## Milestone 2: Repository Scanner & AST Parsing Engine

### Milestone 2 Goal

Build high-speed file system discovery, incremental git indexers, Tree-Sitter parsing abstractions, and language-specific AST symbol extractors for TypeScript, JavaScript, Python, and Go.

---

### Phase 08: Repository Scanner & Git Boundary Detector

- **Goal:** Implement the Repository Scanner in `packages/parser/src/scanner/`.
- **Why This Phase Exists:** Must identify repository boundaries, `.git` roots, and valid directory trees before parsing.
- **Features:** Git root detector, directory walker, and ignore rule evaluator (`.gitignore`, `.repo-intel-ignore`).
- **Tasks:**
  - Create Repository Scanner module.
  - Implement git root path resolver using `ignore` library.
  - Implement recursive directory traversal honoring `.gitignore` patterns.
  - Return structured file manifest containing relative paths and file sizes.
- **Deliverables:** Functional Repository Scanner module in `packages/parser/`.
- **Dependencies:** Phase 04.
- **Acceptance Criteria:** Scanner accurately discovers repository files while ignoring `node_modules/`, `.git/`, and custom ignored patterns.
- **Testing:**
  - _Unit Tests:_ Test scanner against mock directory structures containing `.gitignore` files.
- **Risks:** Memory pressure on large repositories with deep directory trees.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1 day.

---

### Phase 09: Language Detection & File Classifier

- **Goal:** Implement extension-based and shebang-based language detection in `packages/parser/src/language/`.
- **Why This Phase Exists:** Files must be classified into supported programming languages to route to correct parsers.
- **Features:** Language classifier mapping files to supported Tree-Sitter grammars.
- **Tasks:**
  - Build language mapping dictionary for TypeScript, JavaScript, Python, Go, Rust, Java, C/C++, C#.
  - Implement file extension inspector and fallback shebang header reader.
  - Handle unknown or unsupported binary files gracefully by filtering them out.
- **Deliverables:** Language Classifier module returning canonical language IDs.
- **Dependencies:** Phase 08.
- **Acceptance Criteria:** Given a list of file paths, correctly classifies `.ts` as `typescript`, `.py` as `python`, etc.
- **Testing:**
  - _Unit Tests:_ Test file extensions, ambiguous extensions (`.h`), and binary files.
- **Risks:** Ambiguous file extensions (e.g., `.h` for C vs C++).
- **Estimated Complexity:** Low.
- **Estimated Time:** 0.5 days.

---

### Phase 10: Incremental Indexer & SHA-256 State Tracker

- **Status:** Completed 🟢
- **Goal:** Build versioned Repository State Store (`RepositoryStateStore`), atomic JSON state cache (`.repo-intel-cache.json`), metadata hash short-circuit optimization, and Delta Engine.
- **Why This Phase Exists:** Re-parsing unchanged files on every edit is too slow; incremental re-indexing and generic state storage are required for scalable monorepo intelligence.
- **Features:** `RepositoryStateStore` interface abstraction, `JsonRepositoryStateStore` backend, `DeltaEngine` with metadata hash short-circuiting, `RepositoryFacts` extraction, event emitter (`ScannerEventEmitter`), and `RepositorySnapshot` builder.
- **Tasks Completed:**
  - Implemented `RepositoryState` domain model and versioned schema.
  - Implemented `JsonRepositoryStateStore` with atomic file swap saving `.repo-intel-cache.json`.
  - Implemented `DeltaEngine` classifying changes into `added`, `modified`, `deleted`, and `unchanged` with metadata size/mtime hash short-circuiting.
  - Implemented `extractRepositoryFacts` capturing primary/secondary languages, frameworks, package manager, build system, CI provider, Docker support, and project scale.
  - Implemented `ScannerEventEmitter` emitting scan lifecycle event notifications.
  - Created Vitest unit test suite (74 tests passing monorepo-wide) and performance benchmark scaffolding.
- **Deliverables:** Production-ready Incremental Repository Indexer skipping unchanged file hashing on warm scans ($< 50\text{ms}$).
- **Dependencies:** Phase 09.
- **Acceptance Criteria:** Subsequent scans of unmodified repositories execute in $< 50\text{ms}$, executing zero SHA-256 hash operations on unchanged files.
- **Testing:**
  - _Unit Tests:_ Verified initial cold scan, cached warm scan, file modification, file deletion, state store operations, and event emission.
- **Risks:** None.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1 day.

---

### Phase 11: Tree-Sitter Parser Abstraction Manager

- **Status:** ✅ Complete
- **Goal:** Create unified Tree-Sitter parser manager interface in `packages/parser/src/treesitter/`.
- **Why This Phase Exists:** Decouples language-specific syntax parsers behind a common parsing manager.
- **Features:** Tree-Sitter parser manager pooling instances and managing grammar load cycles.
- **Tasks:**
  - Integrate `web-tree-sitter` or node Tree-Sitter bindings.
  - Create `ParserManager` base class for parser initialization.
  - Implement safe syntax tree generation with error recovery.
- **Deliverables:**
  - `packages/parser/src/treesitter/grammar-registry.ts` — Grammar metadata registry
  - `packages/parser/src/treesitter/parser-pool.ts` — Generic reusable parser pool
  - `packages/parser/src/treesitter/tree-sitter-manager.ts` — Central parser lifecycle manager
  - `packages/parser/src/treesitter/ast-normalizer.ts` — AST to NormalizedSymbol normalizer
  - `packages/parser/src/treesitter/treesitter.test.ts` — 16 unit tests (all passing)
  - `packages/parser/src/treesitter/treesitter.bench.ts` — Benchmark scaffolding
  - `packages/parser/queries/` — S-expression query scaffolding for TS, Python, Go, Java, Rust
  - `packages/shared/src/types/ast-domain.types.ts` — ASTNode, ASTTree, ASTCursor, ASTVisitor, ASTQuery, NormalizedSymbol domain types
- **Dependencies:** Phase 09.
- **Acceptance Criteria:** Successfully parses code strings into ASTTree domain objects without memory leaks; full abstraction layer in place.
- **Testing:**
  - _Unit Tests:_ 108/108 passing (16 new Phase 11 tests)
- **Risks:** Native binary compilation issues with Tree-Sitter C bindings across OS platforms.
- **Estimated Complexity:** High.
- **Estimated Time:** 2 days.

---

### Phase 12: TypeScript & JavaScript AST Symbol Extractor

- **Status:** Completed 🟢
- **Goal:** Build symbol extraction queries for TypeScript/JavaScript in `packages/parser/src/extractors/ts-extractor.ts`.
- **Why This Phase Exists:** Must extract functions, classes, interfaces, methods, and variables from TS/JS code.
- **Features:** Tree-Sitter query handler for TypeScript symbol declarations, line ranges, and imports.
- **Tasks:**
  - Write Tree-Sitter S-expression queries for TS classes, interfaces, functions, methods, and exported variables.
  - Extract symbol identifiers, start/end line numbers, docstrings, and parameter signatures.
  - Extract `import` statements and target specifiers.
- **Deliverables:** TypeScript AST Extractor returning array of `SymbolNode` objects.
- **Dependencies:** Phase 04, Phase 11.
- **Acceptance Criteria:** Extracts all function, class, and interface declarations from a TS file with exact line numbers.
- **Testing:**
  - _Unit Tests:_ Run extractor against complex TS files containing decorators, generics, and re-exports.
- **Risks:** Missing complex TypeScript syntax variants (e.g., overloaded function signatures).
- **Estimated Complexity:** High.
- **Estimated Time:** 2 days.

---

### Phase 13: Semantic Relationship Extraction & Knowledge Graph Builder

- **Status:** Completed 🟢
- **Goal:** Extract language-independent semantic relationships and build the normalized Repository Knowledge Graph (RKG) with a database-decoupled storage abstraction.
- **Why This Phase Exists:** Enables structural and architectural graph walks, dependency analysis, and multi-hop context retrieval.
- **Features:**
  - Stable symbol identity schema (`buildSymbolId`) and byte-accurate source location model.
  - Normalized structured documentation model (`SymbolDoc`).
  - Query Registry for managing Tree-Sitter S-expression query files.
  - Incremental symbol extraction integrated with `DeltaEngine`.
  - Language-independent `SemanticRelationship` extractor (`CONTAINS`, `CALLS`, `IMPORTS`, `EXPORTS`, `REFERENCES`, `IMPLEMENTS`, `EXTENDS`, `USES`, `DEPENDS_ON`, `OVERRIDES`).
  - Database-decoupled `GraphStore` interface and `InMemoryGraphStore` backend.
  - `KnowledgeGraphBuilder` producing graph nodes (`Repository`, `Directory`, `File`, `Symbol`, `Module`) and edges.
  - Incremental graph update engine (`updateGraphDelta`) and JSON graph serializer (`exportGraphJson`/`importGraphJson`).
- **Deliverables:** `@repo-intel/graph` package fully integrated with `@repo-intel/parser` and `@repo-intel/shared`.
- **Dependencies:** Phase 10, Phase 11, Phase 12.
- **Acceptance Criteria:** Constructs complete, queryable knowledge graphs and executes incremental graph delta updates under 100ms.
- **Testing:** Unit tests (138/138 passing monorepo-wide) and performance benchmark (`graph.bench.ts`).
- **Estimated Complexity:** High.
- **Estimated Time:** 2 days.

---

### Phase 14: Multi-Language AST Symbol Extractors (Python, Go, Java)

- **Status:** Completed 🟢
- **Goal:** Implement AST symbol extractors for Python (`py-extractor.ts`), Go (`go-extractor.ts`), and Java (`java-extractor.ts`).
- **Why This Phase Exists:** Expands multi-language coverage to compile-time typed languages.
- **Features:** Tree-Sitter queries for Go structs/interfaces/functions and Java classes/interfaces/methods.
- **Tasks:**
  - Implement Go extractor for `struct`, `interface`, `func`, and package imports.
  - Implement Java extractor for `class`, `interface`, `enum`, methods, and import statements.
- **Deliverables:** Go and Java symbol extractors.
- **Dependencies:** Phase 11.
- **Acceptance Criteria:** Successfully extracts symbol declarations and imports from Go and Java source files.
- **Testing:**
  - _Unit Tests:_ Test Go struct methods and Java generic interfaces.
- **Risks:** Differences in Go receiver method syntax vs standard class methods.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 2 days.

---

## Milestone 3: Knowledge Graph & Context Retrieval Engine

### Milestone 3 Goal

Construct the Repository Knowledge Graph (RKG), resolve symbol references across module boundaries, store nodes in KùzuDB embedded graph database, embed code semantics in LanceDB, and implement the hybrid Context Retrieval Engine (CRE).

---

### Phase 15: Graph Enrichment & Cross-Language Resolution

- **Status:** Completed 🟢
- **Goal:** Perform multi-pass graph enrichment, resolve module and type references across boundaries, attach provenance metadata, and normalize multi-language AST constructs to unified `NormalizedConcept` abstractions.
- **Why This Phase Exists:** Resolves import specifiers, inheritance chains, and method overrides, and enables unified language-agnostic graph queries.
- **Features:**
  - Language capability registry (`LanguageCapabilityRegistry`).
  - Symbol semantic fingerprints (`generateSymbolFingerprint`) for rename detection and duplicate identification.
  - Decoupled `DefaultModuleResolver` and `DefaultTypeResolver` with `ResolutionCache`.
  - Multi-pass `GraphEnricher` executing import resolution, method override detection, and graph provenance tracking (`GraphProvenance`).
  - `CrossLanguageResolver` attaching `concept` properties (`ClassLike`, `FunctionLike`, `InterfaceLike`, `EnumLike`, `ModuleLike`).
- **Deliverables:** Enriched Repository Knowledge Graph (RKG) with full graph provenance and cross-language semantic concept mappings.
- **Dependencies:** Phase 12, Phase 13, Phase 14.
- **Acceptance Criteria:** Given an imported symbol call or interface method, resolves exact target declarations and computes `OVERRIDES` edges with $> 0.9$ confidence.
- **Testing:** Unit tests (172/172 passing monorepo-wide across 44 test files) and enrichment benchmark (`enrichment.bench.ts`).
- **Risks:** Unresolved dynamic imports or wildcard re-exports (`export * from ...`).
- **Estimated Complexity:** High.
- **Estimated Time:** 2.5 days.

---

### Phase 16: Module Dependency & Import Graph Builder

- **Goal:** Build file-level and module-level import/export dependency graphs in `packages/graph/src/builder/`.
- **Why This Phase Exists:** Necessary for architectural layer analysis and circular dependency detection.
- **Features:** Import graph builder creating `IMPORTS` and `BELONGS_TO` edges between File and Module nodes.
- **Tasks:**
  - Process extracted file imports.
  - Create `FileNode` and `ModuleNode` instances.
  - Create directional `IMPORTS` edges between source and target files.
  - Detect circular import cycles ($A \rightarrow B \rightarrow A$).
- **Deliverables:** Import Dependency Graph generator.
- **Dependencies:** Phase 15.
- **Acceptance Criteria:** Builds complete dependency graph for a repository and correctly flags circular imports.
- **Testing:**
  - _Unit Tests:_ Test dependency graph generation on mock 10-file repository with circular references.
- **Risks:** Cycle detection performance on large graphs.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1.5 days.

---

### Phase 17: Call Graph Generator & Inheritance Hierarchy Engine

- **Goal:** Construct function `CALLS`, `INHERITS_IMPLEMENTS`, and `TESTED_BY` relationships.
- **Why This Phase Exists:** Required by the Context Retrieval Engine to walk 2-hop caller/callee subgraphs.
- **Features:** Call graph generator and class inheritance tree builder.
- **Tasks:**
  - Extract function call invocations within method bodies.
  - Create `CALLS` edges between caller symbols and resolved callee symbols.
  - Create `INHERITS_IMPLEMENTS` edges for class extensions and interface implementations.
  - Map unit test files to target symbols creating `TESTED_BY` edges.
- **Deliverables:** Call Graph Engine emitting complete symbol graph edges.
- **Dependencies:** Phase 16.
- **Acceptance Criteria:** Given a changed function, correctly lists all immediate callers, callees, and unit tests.
- **Testing:**
  - _Unit Tests:_ Assert call graph edges for nested callers and interface implementations.
- **Risks:** Disambiguating overloaded functions or polymorphic method calls.
- **Estimated Complexity:** High.
- **Estimated Time:** 2.5 days.

---

### Phase 18: KùzuDB Embedded Knowledge Graph Persistence

- **Goal:** Integrate KùzuDB embedded graph database in `packages/graph/src/storage/`.
- **Why This Phase Exists:** Provides fast, embedded Cypher query execution for multi-hop graph walks without external server daemons.
- **Features:** KùzuDB embedded storage manager, schema initialization, and Cypher query executors.
- **Tasks:**
  - Initialize KùzuDB database instance on local disk state.
  - Create Node tables (`File`, `Symbol`, `Module`, `UnitTest`) and Rel tables (`CONTAINS`, `IMPORTS`, `CALLS`, `TESTED_BY`).
  - Implement transactional batch node/edge insertion methods.
  - Implement Cypher graph walk queries (e.g., 2-hop caller queries).
- **Deliverables:** Embedded Graph Database adapter executing Cypher queries.
- **Dependencies:** Phase 17.
- **Acceptance Criteria:** Successfully writes complete repository graph to KùzuDB and executes sub-10ms Cypher queries.
- **Testing:**
  - _Integration Tests:_ Perform batch writes and verify Cypher query return records.
- **Risks:** KùzuDB native C++ binding compatibility across host environments.
- **Estimated Complexity:** High.
- **Estimated Time:** 3 days.

---

### Phase 19: Embedded Vector Store & Code Embeddings Engine

- **Goal:** Integrate LanceDB embedded vector storage in `packages/retrieval/src/vector/`.
- **Why This Phase Exists:** Enables semantic similarity search for natural language queries, docstrings, and READMEs.
- **Features:** LanceDB vector storage adapter and local embedding generator integration.
- **Tasks:**
  - Integrate LanceDB client in `packages/retrieval/`.
  - Implement text chunking for docstrings, comments, and README markdown files.
  - Compute and store embeddings using local lightweight embedding models (or ONNX bindings).
  - Implement vector similarity search method returning Top-K matching items with metadata.
- **Deliverables:** Vector Storage module providing hybrid semantic search capabilities.
- **Dependencies:** Phase 18.
- **Acceptance Criteria:** Returns top semantic code matches for natural language queries in $< 50\text{ms}$.
- **Testing:**
  - _Integration Tests:_ Index 50 docstrings and verify vector search cosine similarity ranking.
- **Risks:** Large binary size of embedded vector engines or embedding models.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 2 days.

---

### Phase 20: Context Retrieval Engine (CRE) & Hybrid 2-Hop Graph Walk

- **Goal:** Implement the hybrid Context Retrieval Engine in `packages/retrieval/src/engine.ts`.
- **Why This Phase Exists:** CRE combines graph walk context with vector search snippets to construct minimal context payloads (< 2,000 tokens) for LLMs.
- **Features:** Hybrid context retriever, token budget manager, and context payload builder.
- **Tasks:**
  - Implement git diff modified symbol seed extractor.
  - Execute 2-hop Cypher traversal in KùzuDB for modified symbols (callers, callees, interfaces, tests).
  - Perform LanceDB vector search for relevant semantic docstrings.
  - Deduplicate, rank, and truncate function bodies to signatures to fit strict token budget limit.
- **Deliverables:** Functional CRE module returning compact Context Subgraph Payloads.
- **Dependencies:** Phase 18, Phase 19.
- **Acceptance Criteria:** Emits context payloads under 2,000 tokens containing 100% of direct caller/callee signatures for a given diff.
- **Testing:**
  - _Unit Tests:_ Test CRE retrieval for modified staged diffs; assert token budget enforcement.
- **Risks:** Context truncation dropping critical caller signatures if token limits are exceeded.
- **Estimated Complexity:** High.
- **Estimated Time:** 3 days.

---

## Milestone 4: AI Provider Abstraction Layer & Prompt Pipeline

### Milestone 4 Goal

Build the AI Provider Abstraction Layer (PAL), implement adapters for cloud LLMs (OpenAI, Claude, Gemini) and local models (Ollama, vLLM), build token-pruned prompt templates, and enforce structured JSON response parsing.

---

### Phase 21: Provider Abstraction Layer (PAL) Interface

- **Goal:** Define the unified `ProviderAdapter` interface in `packages/ai/src/base/`.
- **Why This Phase Exists:** Decouples core review engine logic from specific AI model vendor APIs.
- **Features:** `ProviderAdapter` interface, capabilities matrix schema, and configuration types.
- **Tasks:**
  - Create `packages/ai/src/base/provider.interface.ts`.
  - Define `complete()`, `streamComplete()`, `validateCapabilities()`, and `getHealthStatus()` method signatures.
  - Create `ProviderFactory` registry for dynamically instantiating configured adapters.
- **Deliverables:** PAL abstract framework package.
- **Dependencies:** Phase 04.
- **Acceptance Criteria:** All AI provider implementations strictly adhere to the `ProviderAdapter` contract.
- **Testing:**
  - _Unit Tests:_ Mock adapter implementation passing factory validation tests.
- **Risks:** None.
- **Estimated Complexity:** Low.
- **Estimated Time:** 1 day.

---

### Phase 22: OpenAI & Anthropic Claude Model Adapters

- **Goal:** Build production adapters for OpenAI (GPT-4o) and Anthropic (Claude 3.5 Sonnet) in `packages/ai/src/providers/`.
- **Why This Phase Exists:** Provides cloud LLM integration for high-accuracy code reviews.
- **Features:** OpenAI adapter (`openai-adapter.ts`) and Claude adapter (`claude-adapter.ts`).
- **Tasks:**
  - Implement `OpenAIAdapter` using official SDK / fetch HTTP client.
  - Implement `ClaudeAdapter` using Anthropic Messages API.
  - Map raw provider responses to standard completion objects.
  - Handle API authentication keys and zero-data-retention header flags.
- **Deliverables:** Working OpenAI and Anthropic Claude provider adapters.
- **Dependencies:** Phase 21.
- **Acceptance Criteria:** Adapters successfully send prompts and return structured text completions from OpenAI and Anthropic APIs.
- **Testing:**
  - _Integration Tests:_ Mock HTTP responses for OpenAI and Claude API endpoints asserting payload parsing.
- **Risks:** Vendor API schema changes or network latency timeouts.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1.5 days.

---

### Phase 23: Local Air-Gapped Model Adapters (Ollama & vLLM)

- **Goal:** Build privacy-first adapters for local runners in `packages/ai/src/providers/`.
- **Why This Phase Exists:** Enables 100% offline, air-gapped security analysis where source code never leaves internal networks.
- **Features:** Ollama adapter (`ollama-adapter.ts`) and vLLM adapter (`vllm-adapter.ts`).
- **Tasks:**
  - Implement `OllamaAdapter` connecting to `http://localhost:11434`.
  - Implement `vLLMAdapter` connecting to local OpenAI-compatible vLLM endpoints.
  - Handle local runner connection failure errors gracefully.
- **Deliverables:** Functional local model provider adapters.
- **Dependencies:** Phase 21.
- **Acceptance Criteria:** Executes code analysis prompts offline via local Ollama/vLLM instances without external network calls.
- **Testing:**
  - _Integration Tests:_ Test local HTTP mock server simulating Ollama JSON completions.
- **Risks:** Slow token generation speeds on non-GPU local machines.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1.5 days.

---

### Phase 24: Provider Router, Rate Limiter & Fallback Chain

- **Goal:** Implement automatic provider failover, retry backoff, and rate limiting in `packages/ai/src/router/`.
- **Why This Phase Exists:** Prevents pipeline failures when primary providers hit rate limits or experience outages.
- **Features:** Provider router, exponential backoff retry handler, and fallback chain executor.
- **Tasks:**
  - Implement leaky-bucket rate limiter enforcing RPM/TPM limits per provider.
  - Build exponential backoff retry wrapper for 5xx/429 HTTP status codes.
  - Build failover router executing secondary fallback providers (e.g., Local vLLM $\rightarrow$ Claude 3.5 Sonnet $\rightarrow$ GPT-4o).
- **Deliverables:** Resilient Provider Router handling retries and failovers transparently.
- **Dependencies:** Phase 22, Phase 23.
- **Acceptance Criteria:** Automatically retries 3 times on 429 rate limit error, then successfully fails over to secondary provider.
- **Testing:**
  - _Unit Tests:_ Test mock primary provider failure triggering secondary provider execution.
- **Risks:** Cascading timeouts across multiple failing providers in the fallback chain.
- **Estimated Complexity:** High.
- **Estimated Time:** 2 days.

---

### Phase 25: Prompt Engineering Pipeline & Token Pruner

- **Goal:** Build reusable prompt templates and token pruning wrappers in `packages/ai/src/prompts/`.
- **Why This Phase Exists:** System prompts must format git diffs and CRE subgraphs into token-optimized instructions.
- **Features:** Prompt template engine, system role instructions, and token counter.
- **Tasks:**
  - Create base system prompt templates for code review.
  - Implement diff & CRE subgraph context injection logic.
  - Implement exact token counter (using Tiktoken or byte estimation) enforcing strict max token budgets.
- **Deliverables:** Prompt Generation Pipeline producing formatted prompt strings.
- **Dependencies:** Phase 20, Phase 21.
- **Acceptance Criteria:** Prompts strictly adhere to token budgets and format code subgraphs cleanly.
- **Testing:**
  - _Unit Tests:_ Test prompt assembly with oversized context payloads; assert token truncation.
- **Risks:** Token counter mismatch between tokenizer libraries and specific LLM models.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1.5 days.

---

### Phase 26: Structured JSON Response Validator & Schema Parser

- **Goal:** Implement strict JSON response validation for model outputs in `packages/ai/src/parser/`.
- **Why This Phase Exists:** Model output MUST strictly conform to the `ExplainableFinding` JSON schema before processing.
- **Features:** JSON extractor, markdown fence stripper, and Zod finding schema validator.
- **Tasks:**
  - Implement JSON extractor stripping markdown code fences (` ```json ... ``` `).
  - Parse JSON output against Zod finding schema.
  - Implement auto-repair retry prompt for malformed JSON responses.
- **Deliverables:** Reliable JSON Response Validator.
- **Dependencies:** Phase 25.
- **Acceptance Criteria:** Successfully parses valid JSON responses; triggers repair retry on malformed outputs.
- **Testing:**
  - _Unit Tests:_ Test parsing valid JSON, markdown-wrapped JSON, and invalid syntax strings.
- **Risks:** LLMs emitting non-compliant JSON despite explicit system instructions.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1.5 days.

---

## Milestone 5: Multi-Agent Review Engine & Auto-Fix Framework

### Milestone 5 Goal

Build the specialized Multi-Agent Review Framework (Syntax, Logic, Security, Performance, Architecture), risk calculator, and unified patch auto-fix engine.

---

### Phase 27: Explainable Review Finding Data Engine

- **Goal:** Build finding data aggregator and deduplicator in `packages/review-engine/src/aggregator/`.
- **Why This Phase Exists:** Raw findings from multiple agents must be aggregated, deduplicated, and formatted consistently.
- **Features:** Finding aggregator, line-level deduplicator, and severity ranker.
- **Tasks:**
  - Create finding aggregator collecting results from specialized agents.
  - Implement deduplication engine merging identical findings on overlapping line ranges.
  - Sort findings by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Deliverables:** Finding Aggregation Engine.
- **Dependencies:** Phase 04, Phase 26.
- **Acceptance Criteria:** Successfully merges overlapping findings into a unified, sorted findings list.
- **Testing:**
  - _Unit Tests:_ Input 5 duplicate agent findings; verify output contains 1 deduplicated item.
- **Risks:** Improper deduplication dropping distinct issues occurring on the same line.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1 day.

---

### Phase 28: Syntax, Style & Linter Review Agent

- **Goal:** Build the Syntax & Style Review Agent in `packages/agents/src/syntax-agent.ts`.
- **Why This Phase Exists:** Analyzes formatting adherence, unused variables, and linter rule violations.
- **Features:** SyntaxAgent class implementing specialized review prompt rules.
- **Tasks:**
  - Create `SyntaxAgent` extending base agent framework.
  - Build specialized prompt instructions focusing on syntax error detection and formatting.
  - Return structured findings for unused parameters, dead code, or style violations.
- **Deliverables:** Working Syntax & Style Agent.
- **Dependencies:** Phase 27.
- **Acceptance Criteria:** Emits valid `ExplainableFinding` objects for syntax and style defects.
- **Testing:**
  - _Unit Tests:_ Execute agent against code sample containing unused variables; assert finding output.
- **Risks:** High false positive rate if style rules conflict with repo conventions.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1.5 days.

---

### Phase 29: Logic, Bugs & Edge-Case Review Agent

- **Goal:** Build the Logic & Bug Review Agent in `packages/agents/src/logic-agent.ts`.
- **Why This Phase Exists:** Identifies off-by-one errors, null pointers, unhandled exceptions, and race conditions.
- **Features:** LogicAgent class leveraging 2-hop call graph context to verify contract safety.
- **Tasks:**
  - Create `LogicAgent`.
  - Inject caller/callee context signatures into logic prompts.
  - Flag unhandled null checks, uncaught promise rejections, and state mutation flaws.
- **Deliverables:** Logic & Bug Review Agent.
- **Dependencies:** Phase 28.
- **Acceptance Criteria:** Successfully flags missing null validation in call chains.
- **Testing:**
  - _Unit Tests:_ Execute agent on code snippet missing boundary checks; verify finding severity `HIGH`.
- **Risks:** Complex logic bugs requiring multi-file context exceeding prompt token limits.
- **Estimated Complexity:** High.
- **Estimated Time:** 2 days.

---

### Phase 30: Security & Vulnerability Analysis Agent

- **Goal:** Build the Security Review Agent in `packages/agents/src/security-agent.ts`.
- **Why This Phase Exists:** Scans for OWASP Top 10 vulnerabilities, hardcoded secrets, SQL injection, and XSS patterns.
- **Features:** SecurityAgent class with taint-tracking prompt instructions and secret entropy scanning.
- **Tasks:**
  - Implement regex-based static secret entropy scanner (AWS keys, JWTs).
  - Build `SecurityAgent` prompt instructions analyzing input sanitization and dataflows.
  - Emit findings with severity `CRITICAL` for exposed credentials or unsanitized queries.
- **Deliverables:** Security & Vulnerability Analysis Agent.
- **Dependencies:** Phase 28.
- **Acceptance Criteria:** Detects hardcoded secrets and un-parameterized raw SQL query strings with 100% recall on test samples.
- **Testing:**
  - _Unit Tests:_ Run security agent on files containing dummy AWS keys and raw SQL concatenations.
- **Risks:** False positives on dummy test keys or benign string literals.
- **Estimated Complexity:** High.
- **Estimated Time:** 2 days.

---

### Phase 31: Performance Bottleneck & N+1 Query Agent

- **Goal:** Build Performance Review Agent in `packages/agents/src/performance-agent.ts`.
- **Why This Phase Exists:** Detects algorithmic inefficiencies, N+1 DB queries in loops, and blocking I/O calls.
- **Features:** PerformanceAgent class flagging inefficient loops and un-awaited async calls.
- **Tasks:**
  - Create `PerformanceAgent`.
  - Build prompt instructions detecting database queries executed inside `for`/`while` loops.
  - Detect missing `await` statements or synchronous file I/O in async request paths.
- **Deliverables:** Performance Review Agent.
- **Dependencies:** Phase 28.
- **Acceptance Criteria:** Accurately flags database query function calls placed inside loop blocks.
- **Testing:**
  - _Unit Tests:_ Run agent on code containing `forEach` loops with async DB calls.
- **Risks:** Misidentifying non-blocking in-memory iterations as performance bottlenecks.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1.5 days.

---

### Phase 32: Architectural Layer Violation Agent

- **Goal:** Build Architecture Review Agent in `packages/agents/src/architecture-agent.ts`.
- **Why This Phase Exists:** Enforces architectural boundary rules (e.g., database layers importing UI React components).
- **Features:** ArchitectureAgent class inspecting module dependency graphs for layer leaks.
- **Tasks:**
  - Create `ArchitectureAgent`.
  - Inject module import graph dependency edges into context payload.
  - Flag cross-layer violation edges (e.g., low-level domain models importing presentation controllers).
- **Deliverables:** Architectural Layer Violation Agent.
- **Dependencies:** Phase 16, Phase 28.
- **Acceptance Criteria:** Flags invalid architectural dependency edges identified in the Knowledge Graph.
- **Testing:**
  - _Unit Tests:_ Test agent with mock graph containing a DB utility file importing a UI component.
- **Risks:** Overly rigid boundary rules flagging valid cross-cutting utilities.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 2 days.

---

### Phase 33: Regression Risk Calculator & Change Impact Engine

- **Goal:** Build Change Impact Risk Analysis Engine in `packages/review-engine/src/risk/`.
- **Why This Phase Exists:** Calculates quantitative regression risk scores based on downstream call counts and test coverage.
- **Features:** Risk Calculator implementing formula $\text{Risk Score} = w_1 \cdot (\text{Callers}) + w_2 \cdot (\text{Criticality}) + w_3 \cdot (1 - \text{Coverage})$.
- **Tasks:**
  - Implement downstream caller count calculator from RKG call graph.
  - Implement test coverage edge reader (`TESTED_BY`).
  - Calculate numerical risk score ($0.0 - 1.0$) and assign risk badges (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Deliverables:** Regression Risk Calculator module.
- **Dependencies:** Phase 17, Phase 27.
- **Acceptance Criteria:** Correctly assigns `CRITICAL` risk rating to changes modifying functions with $> 10$ callers and 0 unit tests.
- **Testing:**
  - _Unit Tests:_ Assert risk score output across various caller count and test coverage combinations.
- **Risks:** Inaccurate weight constants skewing overall risk scores.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 1.5 days.

---

### Phase 34: Unified Patch Generator & Auto-Fix Framework

- **Goal:** Implement `.patch` generator in `packages/patch-gen/src/patch-generator.ts`.
- **Why This Phase Exists:** Converts suggested fixes into standard unified diff patches that can be applied with one click.
- **Features:** Unified diff generator, patch formatter, and diff validator.
- **Tasks:**
  - Create `packages/patch-gen/`.
  - Implement unified diff string generator using `diff` library.
  - Validate patch diff line offsets against original source code files.
  - Output valid `.patch` strings formatted for git application.
- **Deliverables:** Unified Patch Generator package.
- **Dependencies:** Phase 27.
- **Acceptance Criteria:** Emits valid unified diff patch strings that apply cleanly using `git apply`.
- **Testing:**
  - _Unit Tests:_ Generate patch string for sample file change and test applying diff programmatically.
- **Risks:** Line number drift if source file is edited after review generation.
- **Estimated Complexity:** High.
- **Estimated Time:** 2 days.

---

## Milestone 6: User Interfaces, Integrations & Enterprise Readiness

### Milestone 6 Goal

Deliver CLI tool (`repo-intel`), Next.js Web Dashboard with 3D Graph Visualizer, VS Code Extension, GitHub PR Bot integration, Repository Memory, RBAC security, performance optimization, and production release hardening.

---

### Phase 35: Command Line Interface (`repo-intel` CLI)

- **Goal:** Build the terminal CLI tool in `apps/cli/`.
- **Why This Phase Exists:** Allows developers to run local reviews and graph scans directly from their terminal.
- **Features:** Commander.js CLI framework, terminal table formatter, and commands (`init`, `review`, `analyze`, `graph`).
- **Tasks:**
  - Setup CLI entrypoint in `apps/cli/src/index.ts` using `commander`.
  - Implement `repo-intel init` command initializing local repo config.
  - Implement `repo-intel review --staged --provider ollama` executing review pipeline.
  - Format output in terminal using chalk and cli-table with line numbers and patch hints.
- **Deliverables:** Runnable `repo-intel` CLI binary.
- **Dependencies:** Phase 20, Phase 24, Phase 34.
- **Acceptance Criteria:** `repo-intel review --staged` runs local review on staged files and outputs structured findings in terminal under 20 seconds.
- **Testing:**
  - _Integration Tests:_ Execute CLI commands against sample git repositories.
- **Risks:** Terminal formatting rendering incorrectly across different shell environments.
- **Estimated Complexity:** High.
- **Estimated Time:** 2.5 days.

---

### Phase 36: Web Dashboard & 3D Knowledge Graph Visualizer

- **Goal:** Build Next.js Dashboard components and Cytoscape.js/Three.js graph viewer in `apps/web/`.
- **Why This Phase Exists:** Provides visual exploration of repository architecture health, risk scores, and dependency graphs.
- **Features:** Findings explorer table, risk matrix badges, interactive 3D node graph visualizer, and provider settings panel.
- **Tasks:**
  - Build Review Findings Explorer view (`apps/web/src/app/findings/`).
  - Integrate Cytoscape.js / 3D Force Graph library in `apps/web/src/components/GraphVisualizer.tsx`.
  - Connect graph visualizer to backend `/api/v1/graphs/subgraph` API endpoint.
  - Build Provider Configuration management UI.
- **Deliverables:** Complete Next.js Web Application interface.
- **Dependencies:** Phase 05, Phase 06, Phase 34.
- **Acceptance Criteria:** Renders interactive node graph showing files, symbols, and call edges; allows filtering findings by severity.
- **Testing:**
  - _Manual Testing:_ Test web UI layout, graph node dragging, and finding filtering in Chrome.
- **Risks:** Browser canvas performance degradation when rendering $> 5,000$ graph nodes.
- **Estimated Complexity:** Very High.
- **Estimated Time:** 4 days.

---

### Phase 37: VS Code Extension Client & LSP Integration

- **Goal:** Build VS Code extension in `apps/vscode/`.
- **Why This Phase Exists:** Delivers real-time inline review highlights, hover tooltips, and quick-fix patch actions directly in editor.
- **Features:** VS Code extension entrypoint, inline wavy underline decorations, hover diagnostic provider, and quick-fix code actions.
- **Tasks:**
  - Initialize VS Code extension project in `apps/vscode/`.
  - Register diagnostic collection rendering inline squiggly underlines on findings.
  - Implement HoverProvider displaying finding explanations and evidence chains on mouse hover.
  - Implement CodeActionProvider adding "Apply Auto-Fix Patch" lightbulb action.
- **Deliverables:** Packaged `.vsix` extension for VS Code.
- **Dependencies:** Phase 34, Phase 35.
- **Acceptance Criteria:** Extension displays inline review decorations on open files and applies patch fixes via quick-fix action.
- **Testing:**
  - _Manual Testing:_ Launch VS Code Extension Development Host and test inline highlights and code actions.
- **Risks:** VS Code Extension API context lifecycle memory leaks.
- **Estimated Complexity:** Very High.
- **Estimated Time:** 4 days.

---

### Phase 38: GitHub App & PR Bot Webhook Handler

- **Goal:** Build GitHub PR Bot integration in `services/pr-bot/`.
- **Why This Phase Exists:** Automates code review workflows on remote Pull Requests.
- **Features:** GitHub Webhook listener (`pull_request.opened`, `synchronize`), Octokit REST integration, and inline PR comment poster.
- **Tasks:**
  - Create GitHub App webhook service in `services/pr-bot/`.
  - Parse incoming GitHub pull request diff payloads.
  - Execute Multi-Agent Review pipeline on PR changes.
  - Post inline PR review comments on exact diff lines via GitHub REST API.
  - Set GitHub Check Run status (`SUCCESS`, `FAILURE`).
- **Deliverables:** Operational GitHub PR Bot service.
- **Dependencies:** Phase 05, Phase 33, Phase 34.
- **Acceptance Criteria:** Automatically posts inline review comments and summary tables on newly opened GitHub PRs.
- **Testing:**
  - _Integration Tests:_ Send mock GitHub webhook payloads to service and verify Octokit API call parameters.
- **Risks:** Hitting GitHub API rate limits during large PR reviews.
- **Estimated Complexity:** High.
- **Estimated Time:** 3 days.

---

### Phase 39: Repository Memory & Learning Engine

- **Goal:** Implement Repository Memory and convention learning in `packages/review-engine/src/memory/`.
- **Why This Phase Exists:** Prevents re-flagging user-dismissed false positives and learns codebase-specific conventions over time.
- **Features:** Ignored findings persistence, rule embedding store, and historical review comparison.
- **Tasks:**
  - Create `RepositoryMemory` database table storing dismissed findings.
  - Filter generated findings against ignored finding embedding signatures.
  - Compare current PR findings against historical review metrics to track technical debt trends.
- **Deliverables:** Repository Memory & Learning Subsystem.
- **Dependencies:** Phase 18, Phase 27.
- **Acceptance Criteria:** Dismissed findings are automatically suppressed in future review executions.
- **Testing:**
  - _Unit Tests:_ Mark finding as ignored, re-run review, verify finding is excluded from output.
- **Risks:** Over-broad suppression logic hiding legitimate new bugs.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 2 days.

---

### Phase 40: Authentication, RBAC & Multi-Tenant Workspace Isolation

- **Goal:** Implement enterprise authentication, role-based access control, and workspace isolation in `services/api/src/auth/`.
- **Why This Phase Exists:** Secures API endpoints and isolates multi-tenant data in enterprise cloud deployments.
- **Features:** JWT authentication, OAuth2 SSO integration, RBAC middleware (`Admin`, `Architect`, `Developer`), and tenant isolation filters.
- **Tasks:**
  - Implement JWT authentication strategy and middleware in Fastify API service.
  - Add RBAC role checks to protected API endpoints.
  - Enforce `workspace_id` tenant filters on graph queries and database records.
- **Deliverables:** Secure, authenticated API Gateway.
- **Dependencies:** Phase 05, Phase 36.
- **Acceptance Criteria:** Unauthenticated requests receive 401 Unauthorized; users cannot access graph data belonging to other workspaces.
- **Testing:**
  - _Integration Tests:_ Test API calls with valid/invalid JWT tokens and cross-tenant workspace IDs.
- **Risks:** Security vulnerabilities in custom auth middleware.
- **Estimated Complexity:** High.
- **Estimated Time:** 2.5 days.

---

### Phase 41: Performance Benchmarking & Distributed Worker Scaling

- **Goal:** Benchmark indexing performance and implement background worker queue handling in `services/indexing/`.
- **Why This Phase Exists:** Ensures system indexes 100,000 LOC repositories under 45 seconds and handles concurrent PR reviews.
- **Features:** Distributed BullMQ job queue for indexing tasks, memory optimization, and benchmark suite.
- **Tasks:**
  - Implement Redis-backed BullMQ job queue in `services/indexing/`.
  - Offload repository scanning and AST parsing to background worker pods.
  - Run benchmark suite against large open-source repositories (100k+ LOC).
  - Optimize graph batch insertion parameters.
- **Deliverables:** High-throughput, distributed indexing service.
- **Dependencies:** Phase 18, Phase 35.
- **Acceptance Criteria:** Indexes a 100,000 LOC repository in $< 45\text{s}$; handles 50 concurrent PR review queue tasks smoothly.
- **Testing:**
  - _Performance Tests:_ Run load test suite measuring indexing duration, memory footprint, and token latency.
- **Risks:** Memory starvation during concurrent AST parsing of large repositories.
- **Estimated Complexity:** High.
- **Estimated Time:** 3 days.

---

### Phase 42: Production Security Audit, Hardening & Release Packaging

- **Goal:** Perform final security hardening, secret sanitization verification, containerization, and production release packaging.
- **Why This Phase Exists:** Prepares platform for enterprise deployment and air-gapped production usage.
- **Features:** Production Dockerfile builds, security audit verification, zero data retention header verification, and release documentation.
- **Tasks:**
  - Build optimized multi-stage production `Dockerfile` images for API, Web, and Worker services.
  - Verify 100% offline air-gapped execution mode with zero external network leaks.
  - Conduct dependency security audit (`pnpm audit`) and fix vulnerabilities.
  - Finalize deployment guides, API specifications, and operator documentation.
- **Deliverables:** Production-ready container images, packages, and deployment documentation.
- **Dependencies:** All previous phases (Phases 01 - 41).
- **Acceptance Criteria:** Production Docker containers launch cleanly; air-gapped security validation passes with 0 external network requests; all automated tests pass.
- **Testing:**
  - _E2E / Security Tests:_ Run full end-to-end review lifecycle in an air-gapped network environment.
- **Risks:** None.
- **Estimated Complexity:** Medium.
- **Estimated Time:** 2 days.

---

## Milestone Summary & Capabilities Roadmap

| Milestone                                | Key Capability Delivered                                                                                         | Completed Phases |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :--------------- |
| **Milestone 1: Project Foundation**      | Monorepo setup, config loader, structured logging, API gateway, Web app shell, CI pipeline.                      | Phases 01 – 07   |
| **Milestone 2: Repository & AST Engine** | File discovery, incremental indexer, Tree-Sitter parsers for TS, JS, Python, Go, and Java.                       | Phases 08 – 14   |
| **Milestone 3: Knowledge Graph & CRE**   | Symbol resolution, call/import graphs, KùzuDB graph storage, LanceDB vector storage, CRE 2-hop retrieval.        | Phases 15 – 20   |
| **Milestone 4: AI & Provider Layer**     | PAL interface, OpenAI, Claude, Ollama, vLLM adapters, rate limiting, router fallbacks, prompt engineering.       | Phases 21 – 26   |
| **Milestone 5: Multi-Agent Review**      | Specialized agents (Syntax, Logic, Security, Perf, Arch), risk calculator, unified patch generator framework.    | Phases 27 – 34   |
| **Milestone 6: Interfaces & Enterprise** | CLI (`repo-intel`), 3D Graph Web Dashboard, VS Code Extension, GitHub Bot, Repo Memory, Auth, Release Packaging. | Phases 35 – 42   |

---

## Implementation Progress Tracking Matrix

| Phase  | Phase Name                                               |  Milestone  |  Status   |
| :----: | :------------------------------------------------------- | :---------: | :-------: |
| **01** | Monorepo & Workspace Initialization                      | Milestone 1 | ☐ Planned |
| **02** | Configuration Management & Environment Validation        | Milestone 1 | ☐ Planned |
| **03** | Structured Logging & Telemetry Subsystem                 | Milestone 1 | ☐ Planned |
| **04** | Shared Domain Models & Type Definitions                  | Milestone 1 | ☐ Planned |
| **05** | Backend API Gateway Skeleton (Fastify)                   | Milestone 1 | ☐ Planned |
| **06** | Next.js Web Application Foundation                       | Milestone 1 | ☐ Planned |
| **07** | Testing Infrastructure & CI Pipeline Setup               | Milestone 1 | ☐ Planned |
| **08** | Repository Scanner & Git Boundary Detector               | Milestone 2 | ☐ Planned |
| **09** | Language Detection & File Classifier                     | Milestone 2 | ☐ Planned |
| **10** | Incremental Indexer & SHA-256 State Tracker              | Milestone 2 | ☐ Planned |
| **11** | Tree-Sitter Parser Abstraction Manager                   | Milestone 2 | ☐ Planned |
| **12** | TypeScript & JavaScript AST Symbol Extractor             | Milestone 2 | ☐ Planned |
| **13** | Python AST Symbol Extractor                              | Milestone 2 | ☐ Planned |
| **14** | Go & Java AST Symbol Extractors                          | Milestone 2 | ☐ Planned |
| **15** | Symbol Resolution & Identifier Scope Mapping             | Milestone 3 | ☐ Planned |
| **16** | Module Dependency & Import Graph Builder                 | Milestone 3 | ☐ Planned |
| **17** | Call Graph Generator & Inheritance Hierarchy Engine      | Milestone 3 | ☐ Planned |
| **18** | KùzuDB Embedded Knowledge Graph Persistence              | Milestone 3 | ☐ Planned |
| **19** | Embedded Vector Store & Code Embeddings Engine           | Milestone 3 | ☐ Planned |
| **20** | Context Retrieval Engine (CRE) & Hybrid 2-Hop Graph Walk | Milestone 3 | ☐ Planned |
| **21** | Provider Abstraction Layer (PAL) Interface               | Milestone 4 | ☐ Planned |
| **22** | OpenAI & Anthropic Claude Model Adapters                 | Milestone 4 | ☐ Planned |
| **23** | Local Air-Gapped Model Adapters (Ollama & vLLM)          | Milestone 4 | ☐ Planned |
| **24** | Provider Router, Rate Limiter & Fallback Chain           | Milestone 4 | ☐ Planned |
| **25** | Prompt Engineering Pipeline & Token Pruner               | Milestone 4 | ☐ Planned |
| **26** | Structured JSON Response Validator & Schema Parser       | Milestone 4 | ☐ Planned |
| **27** | Explainable Review Finding Data Engine                   | Milestone 5 | ☐ Planned |
| **28** | Syntax, Style & Linter Review Agent                      | Milestone 5 | ☐ Planned |
| **29** | Logic, Bugs & Edge-Case Review Agent                     | Milestone 5 | ☐ Planned |
| **30** | Security & Vulnerability Analysis Agent                  | Milestone 5 | ☐ Planned |
| **31** | Performance Bottleneck & N+1 Query Agent                 | Milestone 5 | ☐ Planned |
| **32** | Architectural Layer Violation Agent                      | Milestone 5 | ☐ Planned |
| **33** | Regression Risk Calculator & Change Impact Engine        | Milestone 5 | ☐ Planned |
| **34** | Unified Patch Generator & Auto-Fix Framework             | Milestone 5 | ☐ Planned |
| **35** | Command Line Interface (`repo-intel` CLI)                | Milestone 6 | ☐ Planned |
| **36** | Web Dashboard & 3D Knowledge Graph Visualizer            | Milestone 6 | ☐ Planned |
| **37** | VS Code Extension Client & LSP Integration               | Milestone 6 | ☐ Planned |
| **38** | GitHub App & PR Bot Webhook Handler                      | Milestone 6 | ☐ Planned |
| **39** | Repository Memory & Learning Engine                      | Milestone 6 | ☐ Planned |
| **40** | Authentication, RBAC & Multi-Tenant Isolation            | Milestone 6 | ☐ Planned |
| **41** | Performance Benchmarking & Distributed Scaling           | Milestone 6 | ☐ Planned |
| **42** | Production Security Audit & Release Hardening            | Milestone 6 | ☐ Planned |

_Status Legend:_ `☐ Planned` | `🔄 In Progress` | `✅ Completed` | `⛔ Blocked`
