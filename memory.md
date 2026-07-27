# Project Memory (`memory.md`)

This file is the **living state file** and **persistent engineering memory** for the Repository Intelligence & Code Review Platform project. It is continuously updated after every development task to ensure continuity across sessions for both human developers and AI assistants.

---

### Project Status

| Metric                | Status / Value                                                                 |
| :-------------------- | :----------------------------------------------------------------------------- |
| **Version**           | `0.14.0` (Multi-Language AST Symbol Extractors - Python, Go, Java)             |
| **Current Milestone** | Milestone 2: Repository Scanner & AST Parsing Engine (COMPLETE 🟢)             |
| **Current Phase**     | Phase 14: Multi-Language AST Symbol Extractors ✅                              |
| **Overall Progress**  | 33.3% (14 / 42 Phases Completed)                                               |
| **Last Updated**      | 2026-07-27                                                                     |
| **Current Branch**    | `main`                                                                         |
| **Build Status**      | 🟢 Passing (`npm run build` 0 errors across workspace)                         |
| **Test Status**       | 🟢 Passing (156/156 Vitest tests; 18 new Phase 14 tests; V8 coverage verified) |

---

## Current Focus

### Phase 14: Multi-Language AST Symbol Extractors (Python, Go, Java)

- **Status:** Complete 🟢
- **Started:** 2026-07-27
- **Completed:** 2026-07-27

#### Objectives Achieved

1. **Python Symbol Extractor** (`packages/parser/src/extractors/py-extractor.ts`):
   - Implemented `PythonExtractor` handling Python class definitions, methods, top-level functions, `async def` definitions, return types, parameters, docstrings (`"""..."""`), `import`/`import_from` statements, and export visibility.

2. **Go Symbol Extractor** (`packages/parser/src/extractors/go-extractor.ts`):
   - Implemented `GoExtractor` handling package declarations, functions, receiver methods (`func (s *Service) Handle()`), structs, interfaces, package import declarations, doc comments (`// ...`), and Go capital letter export detection (`[A-Z]...`).

3. **Java Symbol Extractor** (`packages/parser/src/extractors/java-extractor.ts`):
   - Implemented `JavaExtractor` handling package declarations, `class`, `interface`, `enum` declarations, methods, constructors, visibility modifiers (`public`, `private`, `protected`, `static`, `abstract`), JavaDoc comments (`/** ... */`), and import statements (`import java.util.List`).

4. **Multi-Language Query Registry & Tests:**
   - Pre-populated Python, Go, and Java S-expression query manifests in `QueryRegistry`.
   - Added 18 new unit tests across `py-extractor.test.ts`, `go-extractor.test.ts`, and `java-extractor.test.ts` (156/156 monorepo tests passing).


#### Objectives Achieved

1. **Phase 12 Architectural Improvements:**
   - **Stable Symbol Identity:** Implemented `buildSymbolId(repoId, filePath, name, parentName, signature)` utility in `@repo-intel/shared`.
   - **Source Location Model:** Extended `Location` interface with `startByte` and `endByte` properties.
   - **Structured Documentation Model:** Introduced `SymbolDoc` interface (`summary`, `parameters`, `returns`, `examples`, `throws`, `deprecated`) and parsed JSDoc blocks in `TypeScriptExtractor`.
   - **Extraction Diagnostics:** Added `ParseDiagnostic[]` emissions to `ExtractedFileSymbols` tracking parse recovery, skipped nodes, and syntax warnings.
   - **Query Registry:** Created `QueryRegistry` (`packages/parser/src/treesitter/query-registry.ts`) loading and caching S-expression queries by language and query type.
   - **Incremental Extraction:** Integrated `IncrementalExtractor` with `DeltaEngine` and `JsonRepositoryStateStore` to bypass re-parsing unchanged files.

2. **Semantic Relationship Extraction Engine** (`packages/parser/src/extractors/relationship-extractor.ts`):
   - Defined language-independent `SemanticRelationship` domain contract (`CONTAINS`, `CALLS`, `IMPORTS`, `EXPORTS`, `REFERENCES`, `IMPLEMENTS`, `EXTENDS`, `USES`, `DEPENDS_ON`, `OVERRIDES`).
   - Implemented `RelationshipExtractor` mapping AST symbol hierarchies, inheritance, call signatures, and module imports to semantic relationships.

3. **Knowledge Graph Engine & Storage Abstraction** (`packages/graph/`):
   - Defined database-decoupled `GraphStore` interface (`addNode`, `addEdge`, `removeNode`, `removeEdge`, `getNode`, `getEdge`, `queryNodes`, `queryEdges`, `commit`, `clear`).
   - Implemented in-memory Map-backed `InMemoryGraphStore` with indexed lookup methods.
   - Implemented `KnowledgeGraphBuilder` constructing normalized graph entities (`Repository`, `Directory`, `File`, `Symbol`, `Module`) and directional edges (`CONTAINS`, `IMPORTS`, `EXPORTS`, `CALLS`, `EXTENDS`, `IMPLEMENTS`, `DEPENDS_ON`).
   - Implemented incremental graph update algorithm (`updateGraphDelta`) purging deleted/modified file subgraphs and appending updated delta nodes/edges.
   - Implemented graph serialization (`exportGraphJson`, `importGraphJson`).

4. **Testing, Benchmarks & ADRs:**
   - Added 16 unit tests across `relationship-extractor.test.ts`, `in-memory-graph-store.test.ts`, `knowledge-graph-builder.test.ts`, `graph-serialization.test.ts` (138/138 monorepo tests passing).
   - Created benchmark scaffolding (`graph.bench.ts`) verifying sub-100ms processing for 1,000 nodes / 2,000 edges.
   - Authored **ADR-022: Knowledge Graph Abstraction and Storage Strategy** in `decisions.md`.

#### Objectives Achieved

1. **Symbol Extractor Abstraction** (`packages/parser/src/extractors/extractor.interface.ts`):
   - Defined `SymbolExtractor` interface (`languageId`, `supportedExtensions`, `extract(tree, filePath): ExtractedFileSymbols`).
   - Standardized `ExtractedFileSymbols` payload structure returning `symbols: SymbolNode[]`, `imports: ImportStatement[]`, `exports: string[]`, `loc: number`.

2. **TypeScript & JavaScript S-Expression Query Manifest** (`packages/parser/queries/typescript/symbols.scm`):
   - Extended queries for functions, arrow functions, classes, methods, interfaces, type aliases, enums, imports, and exports.

3. **TypeScript Extractor Implementation** (`packages/parser/src/extractors/ts-extractor.ts`):
   - Built `TypeScriptExtractor` handling function declarations, arrow function variable declarators, class declarations, interface declarations, type aliases, enums, constructor/method signatures, modifiers (`export`, `async`, `public`, `private`, `protected`, `static`), JSDoc docstrings, named/default/wildcard imports, and exports.

4. **Tests & Barrels** (`packages/parser/src/extractors/ts-extractor.test.ts`, `index.ts`):
   - Added 14 unit tests verifying symbol node IDs, kind classification, signatures, docstrings, imports, exports, and empty tree handling.
   - Exported extractor module from `@repo-intel/parser`.

#### Objectives Achieved

1. **Phase 10 Improvements:**
   - Hardened `RepositoryState`, `DeltaResult`, and `RepositorySnapshot` with full `readonly` modifiers.
   - Added `DeltaSummaryStatistics` to `DeltaResult` exposing `addedCount`, `modifiedCount`, `deletedCount`, `totalChangedFiles`.
   - Added `createdAt: string` to `RepositorySnapshot` for snapshot immutability tracking.
   - Expanded `ScannerEventEmitter` with 5 new events: `FileQueued`, `FileParsingStarted`, `FileParsingCompleted`, `ParseFailed`, `RepositoryIndexed`, `RepositoryCompleted`.
   - Extended `LanguagePlugin` interface with `capabilities`, `queryDirectory`, `grammarId`, and `normalize`/`createParser` stubs.

2. **AST Domain Layer** (`packages/shared/src/types/ast-domain.types.ts`):
   - `ASTRange`, `ASTNode`, `ASTTree`, `ASTCursor`, `ASTVisitor<T>`, `ASTQuery`, `ASTQueryMatch`, `ASTQueryCapture`.
   - `NormalizedSymbol`, `ParseDiagnostic`, `ParseResult<T>` normalized symbol types.
   - `SymbolKind` extended in `ast.types.ts` with `constant`, `annotation`, `comment`, `module`, `unknown`.

3. **Grammar Registry** (`packages/parser/src/treesitter/grammar-registry.ts`):
   - `GrammarEntry` with id, languageId, WASM path, version, capabilities, isLoaded flag.
   - `GrammarRegistry` class with register/get/getByLanguageId/markLoaded/listRegistered/clear.
   - `createDefaultGrammarRegistry()` factory pre-populating 6 core language grammars.

4. **Parser Pool** (`packages/parser/src/treesitter/parser-pool.ts`):
   - Generic `ParserPool<T extends Poolable>` with acquire/release/disposeAll/idleCount/activeCount.
   - Idle timeout eviction, overflow handling, factory-based instance creation.

5. **TreeSitterManager** (`packages/parser/src/treesitter/tree-sitter-manager.ts`):
   - Central manager coordinating grammar registry and parser pool.
   - Async `parse(source, languageId): Promise<ASTTree>` via placeholder binding (Phase 12+ for real WASM).
   - `initialize()`, `supportsLanguage()`, `getPoolStats()`, `dispose()` lifecycle API.

6. **AST Normalizer** (`packages/parser/src/treesitter/ast-normalizer.ts`):
   - `normalizeTree(tree, languageId): NormalizedSymbol[]` interface-level implementation.
   - Node type → SymbolKind inference mapping.

7. **Query Infrastructure** (`packages/parser/queries/`):
   - Documented S-expression placeholder queries for TypeScript, Python, Go, Java, Rust.

8. **Tests & Benchmarks:**
   - `treesitter.test.ts` — 16 unit tests covering GrammarRegistry, ParserPool, TreeSitterManager, and AST normalizer.
   - `treesitter.bench.ts` — Benchmark scaffolding: parser creation vs. pool reuse, parse throughput.

9. **Documentation:**
   - Added ADR-018 through ADR-021 to `decisions.md`.
   - Updated `phases.md` Phase 11 status to Complete.

---

## Current Working Files

```text
packages/shared/src/types/ast-domain.types.ts
packages/shared/src/types/ast.types.ts
packages/shared/src/types/state.types.ts
packages/parser/src/treesitter/grammar-registry.ts
packages/parser/src/treesitter/parser-pool.ts
packages/parser/src/treesitter/tree-sitter-manager.ts
packages/parser/src/treesitter/ast-normalizer.ts
packages/parser/src/treesitter/treesitter.test.ts
packages/parser/src/treesitter/treesitter.bench.ts
packages/parser/src/treesitter/index.ts
packages/parser/queries/typescript/symbols.scm
packages/parser/queries/python/symbols.scm
packages/parser/queries/go/symbols.scm
packages/parser/queries/java/symbols.scm
packages/parser/queries/rust/symbols.scm
packages/parser/src/indexer/events.ts
packages/parser/src/languages/plugin.interface.ts
memory.md
phases.md
decisions.md
```

---

## Recently Completed

### 2026-07-22

- **Phase:** Phase 10: Incremental Indexer & SHA-256 State Tracker
- **Feature:** Repository State Store abstraction (`JsonRepositoryStateStore`), metadata hash short-circuit optimization, modular framework detectors with confidence scores, `RepositoryFacts` domain model, language plugin interfaces, event-driven scanner emitter, unit tests (74 passing), benchmark scaffolding, and ADR-020.
- **Summary:** Completed Phase 09 improvements and Phase 10 Repository State Store & Incremental Indexer in `@repo-intel/parser` and `@repo-intel/shared`. Verified with 74 passing Vitest unit tests across the workspace.

---

## Upcoming Phase

### Phase 11: Tree-Sitter Parser Abstraction Manager

- **Goal:** Create unified Tree-Sitter parser manager interface in `packages/parser/src/treesitter/` pooling instances and managing grammar load cycles.
- **Dependencies:** Phase 10.

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

### Milestone 3: Repository Scanner & AST Parsing Engine (3 / 7)

- [x] Phase 08: Repository Scanner & Git Boundary Detector
- [x] Phase 09: Language Detection & File Classifier
- [x] Phase 10: Incremental Indexer & SHA-256 State Tracker
- [ ] Phase 11: Tree-Sitter Parser Abstraction Manager
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
