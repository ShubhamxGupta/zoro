# Architecture Decision Records (`decisions.md`)

This document serves as the project's permanent **Architecture Decision Record (ADR)** for the Repository Intelligence &
Code Review Platform. Unlike `memory.md`, this file does not track day-to-day progress. Instead, it records fundamental
engineering, architectural, product, and technology decisions that shape the long-term direction of the codebase.

---

## Project Overview

The **Repository Intelligence & Code Review Platform** is an enterprise-grade, graph-aware, multi-agent code analysis
system. By constructing an in-memory/embedded **Repository Knowledge Graph (RKG)** via static analysis and Tree-Sitter
AST parsing, the platform provides exact structural context (< 2,000 tokens) to a multi-agent review pipeline through a
unified **AI Provider Abstraction Layer (PAL)** supporting both cloud LLMs and local offline models.

---

## Decision Index

| ADR ID      | Title                                                   | Status   | Date       |
|:------------|:--------------------------------------------------------|:---------|:-----------|
| **ADR-001** | pnpm Workspaces for Monorepo Package Management         | Accepted | 2026-07-22 |
| **ADR-002** | TypeScript Composite Projects & Build Pipelines         | Accepted | 2026-07-22 |
| **ADR-003** | Fastify as REST API Gateway Core Framework              | Accepted | 2026-07-22 |
| **ADR-004** | Next.js App Router for Web Dashboard Shell              | Accepted | 2026-07-22 |
| **ADR-005** | Strict Type Checking & Zero-Implicit-Any Standard       | Accepted | 2026-07-22 |
| **ADR-006** | Tree-Sitter as Core AST & Symbol Parsing Infrastructure | Accepted | 2026-07-22 |
| **ADR-007** | KùzuDB Embedded Graph Database for RKG Storage          | Accepted | 2026-07-22 |
| **ADR-008** | Provider Abstraction Layer (PAL) Interface Contract     | Accepted | 2026-07-22 |
| **ADR-009** | Specialized Multi-Agent Parallel Review Engine          | Accepted | 2026-07-22 |
| **ADR-010** | Repository Knowledge Graph (RKG) Schema & Taxonomy      | Accepted | 2026-07-22 |
| **ADR-011** | Graph-First 2-Hop Context Retrieval Engine (CRE)        | Accepted | 2026-07-22 |
| **ADR-012** | Vanilla CSS Design Tokens over Tailwind for Web Core    | Accepted | 2026-07-22 |
| **ADR-013** | Stitch for Interactive UI Generation & Mockups          | Accepted | 2026-07-22 |
| **ADR-014** | Vitest as Workspace Test Runner Infrastructure          | Accepted | 2026-07-22 |
| **ADR-015** | Docker Packaging Strategy for Local & Cloud Deployments | Accepted | 2026-07-22 |
| **ADR-016** | GitHub Actions for CI Pipeline Gate Enforcement         | Accepted | 2026-07-22 |
| **ADR-017** | 4-Tier Unidirectionally Layered Monorepo Architecture   | Accepted | 2026-07-22 |
| **ADR-018** | Data-Driven Language Registry Architecture              | Accepted | 2026-07-22 |
| **ADR-019** | Repository Scanner Event-Driven Architecture            | Accepted | 2026-07-22 |
| **ADR-020** | JSON File-Based Repository State Store Strategy         | Accepted | 2026-07-22 |
| **ADR-021** | Tree-Sitter Abstraction & Parser Pooling Strategy       | Accepted | 2026-07-22 |
| **ADR-022** | Knowledge Graph Abstraction and Storage Strategy        | Accepted | 2026-07-27 |

---

## Decision Log

### ADR-001: pnpm Workspaces for Monorepo Package Management

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The platform requires clear package boundaries dividing executable applications (`apps/`), shared business logic
(`packages/`), and infrastructure services (`services/`). We needed a fast, deterministic package manager supporting
monorepo workspace linking.

#### Alternatives Considered

1. **npm Workspaces:** Slower resolution, prone to phantom dependency hoisting.
2. **Yarn v4 (PnP):** Complex node resolution quirks; compatibility issues with native C++ bindings (Tree-Sitter,
   KùzuDB).
3. **pnpm Workspaces:** Hard-linked content-addressable storage, strict dependency isolation, zero phantom imports.

#### Why This Option Was Chosen

`pnpm` guarantees that subpackages can only import explicitly declared dependencies, eliminating hidden hoisting bugs
while optimizing local disk usage.

#### Trade-offs

- **Pros:** Fast installs, strict boundary isolation, minimal disk consumption.
- **Cons:** Requires `pnpm` CLI installed in developer environments and CI runners.
- **Limitations:** Native binding node_modules symlinking requires explicit `pnpm-workspace.yaml` configuration.

#### Consequences

- **Positive:** Strict monorepo governance matching [`rules.md`](file:///d:/Coding/zoro/rules.md#L69).
- **Negative:** CI pipelines must use `pnpm/action-setup`.
- **Affected Modules:** All workspace packages.
- **References:** [`rules.md`](file:///d:/Coding/zoro/rules.md#L69), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L40).

---

### ADR-002: TypeScript Composite Projects & Build Pipelines

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

With 12 decoupled subpackages, building each package independently using uncoordinated scripts introduces build ordering
errors and slow incremental builds.

#### Alternatives Considered

1. **Single Flat tsconfig.json:** Loses package boundary enforcement.
2. **TurboRepo alone without TS references:** Requires redundant configuration for typechecking graph resolution.
3. **TypeScript Composite Projects (`tsc -b`):** Built-in incremental compilation graph using `tsconfig.json`
   references.

#### Why This Option Was Chosen

TypeScript composite project references (`composite: true`, `references: [...]`) allow `tsc -b` to build the entire
monorepo in topological order with incremental cache invalidation out-of-the-box.

#### Trade-offs

- **Pros:** Zero third-party build orchestrator overhead for type checking, instant incremental re-compilation.
- **Cons:** Requires explicit declaration files (`declaration: true`) and declaration maps.
- **Limitations:** Every package must maintain a `tsconfig.json` extending `tsconfig.base.json`.

#### Consequences

- **Positive:** Monorepo compilation succeeds with 0 errors across all 12 packages in seconds.
- **Affected Modules:** All packages in `apps/`, `packages/`, `services/`.
- **References:** [`tsconfig.base.json`](file:///d:/Coding/zoro/tsconfig.base.json), [
  `tsconfig.json`](file:///d:/Coding/zoro/tsconfig.json).

---

### ADR-003: Fastify as REST API Gateway Core Framework

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The backend API Gateway (`services/api`) requires high throughput, low overhead, JSON schema request/response
validation, and OpenAPI specification generation.

#### Alternatives Considered

1. **Express.js:** Legacy architecture, slow JSON serialization, lacks native TypeScript schema integration.
2. **NestJS:** Excessive decorator abstraction, high boilerplate overhead violating "Simplicity Over Cleverness" rule.
3. **Fastify:** Ultra-low overhead, native JSON schema compilation via Ajv, automatic Swagger generation.

#### Why This Option Was Chosen

Fastify provides 2–4x higher request throughput than Express while natively compiling Zod/JSON schemas into high-speed
serializers.

#### Trade-offs

- **Pros:** Fast throughput, native TypeScript types, clean plugin architecture.
- **Cons:** Plugin ecosystem differs slightly from legacy Express middleware.
- **Affected Modules:** `services/api`.
- **References:** [`architecture.md`](file:///d:/Coding/zoro/architecture.md#L53), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L128).

---

### ADR-004: Next.js App Router for Web Dashboard Shell

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The frontend web application (`apps/web`) requires server-side rendering for initial graph loads, React Server
Components (RSC) for streaming review findings, and client-side interactive rendering for 3D graph visualizers.

#### Alternatives Considered

1. **Vite SPA:** Client-only rendering causes loading layout shifts when fetching large graph payloads.
2. **Next.js App Router:** Hybrid SSR/RSC framework with layout routing, optimized asset loading, and server action
   support.

#### Why This Option Was Chosen

Next.js App Router provides streaming SSR out of the box, allowing the review dashboard to render server-cached findings
instantly while lazy-loading heavy Cytoscape/Three.js graph visualizer canvases.

#### Trade-offs

- **Pros:** Instant initial page loads, built-in layout routing, seamless API proxying.
- **Cons:** Server/Client component boundary rules require explicit `'use client'` demarcation.
- **Affected Modules:** `apps/web`.
- **References:** [`design.md`](file:///d:/Coding/zoro/design.md#L15), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L150).

---

### ADR-005: Strict Type Checking & Zero-Implicit-Any Standard

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Repository intelligence engines handle complex AST syntax trees and graph edge topologies. Untyped code or permissive
`any` types invite null pointer crashes and subtle parsing bugs.

#### Alternatives Considered

1. **Permissive TypeScript (`strict: false`):** Faster initial prototyping but causes runtime errors in edge traversal.
2. **Strict TypeScript (`strict: true`, `noImplicitAny: true`):** Compiler enforces total type safety and non-null
   assertions.

#### Why This Option Was Chosen

Mandating strict type-checking at root level (`tsconfig.base.json`) prevents type erosion across workspace boundaries.

#### Trade-offs

- **Pros:** Zero runtime type crashes, self-documenting method signatures.
- **Cons:** Requires explicit parameter annotations and type guard assertions.
- **Affected Modules:** Entire codebase.
- **References:** [`rules.md`](file:///d:/Coding/zoro/rules.md#L21), [
  `tsconfig.base.json`](file:///d:/Coding/zoro/tsconfig.base.json).

---

### ADR-006: Tree-Sitter as Core AST & Symbol Parsing Infrastructure

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The platform must extract AST symbols (classes, interfaces, functions, imports) across multiple programming languages
(TypeScript, JavaScript, Python, Go, Java) with identical concrete syntax tree representations.

#### Alternatives Considered

1. **Compiler-Specific AST Parsers (Babel, `@typescript/compiler-api`, `libcst`, `go/parser`):** Disparate AST schemas,
   heavy memory footprints, inconsistent line offset models.
2. **Regex / Heuristic Extractors:** Extremely error-prone, misses nested function definitions and macro expansions.
3. **Tree-Sitter:** High-performance C-based incremental parser generator with unified S-expression tree-query syntax.

#### Why This Option Was Chosen

Tree-Sitter parses source files in milliseconds, provides concrete syntax tree node positions, supports incremental
parsing on file saves, and unifies multi-language queries under standard `.scm` file queries.

#### Trade-offs

- **Pros:** Extremely fast parsing, unified multi-language query API, incremental re-parsing.
- **Cons:** Requires native C/WASM bindings.
- **Affected Modules:** `packages/parser`.
- **References:** [`architecture.md`](file:///d:/Coding/zoro/architecture.md#L19), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L190).

---

### ADR-007: KùzuDB Embedded Graph Database for RKG Storage

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The Repository Knowledge Graph (RKG) stores millions of symbol nodes and caller/callee/import edges. We needed a graph
storage engine optimized for local execution without requiring complex client-server database cluster infrastructure.

#### Alternatives Considered

1. **Neo4j:** Requires heavy JVM server setup, external service orchestration, high memory footprint.
2. **Memgraph:** Docker container dependency required for local execution.
3. **KùzuDB:** Extremely fast in-process C++ graph database with Cypher query support, embedded like SQLite.

#### Why This Option Was Chosen

KùzuDB runs directly in-process via C++/Node native bindings, requiring zero server configuration for local CLI users
while delivering sub-millisecond 2-hop graph traversal queries.

#### Trade-offs

- **Pros:** In-process embedded execution, Cypher support, zero external daemon requirements.
- **Cons:** Single-writer concurrency model.
- **Affected Modules:** `packages/graph`.
- **References:** [`architecture.md`](file:///d:/Coding/zoro/architecture.md#L21), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L378).

---

### ADR-008: Provider Abstraction Layer (PAL) Interface Contract

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Review agents need to dispatch prompts to cloud LLMs (OpenAI, Claude, Gemini, Groq) and local offline LLMs (Ollama,
vLLM) without coupling agent code to vendor-specific SDKs.

#### Alternatives Considered

1. **Vendor SDK Direct Imports:** Tight coupling; adding new model providers breaks existing agent logic.
2. **Unified PAL Adapter Contract (`ProviderAdapter`):** Standard interface exposing `complete()`, `streamComplete()`,
   `validateCapabilities()`, and `getHealthStatus()`.

#### Why This Option Was Chosen

PAL decouples model integration completely. Switching from cloud GPT-4o to offline Ollama requires changing one
configuration string.

#### Trade-offs

- **Pros:** Easy addition of new model vendors, zero-data-retention header control, offline support.
- **Cons:** Standardized request wrapper must normalize minor vendor output differences.
- **Affected Modules:** `packages/ai`, `packages/agents`, `packages/review-engine`.
- **References:** [`architecture.md`](file:///d:/Coding/zoro/architecture.md#L315), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L471).

---

### ADR-009: Specialized Multi-Agent Parallel Review Engine

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Code reviews require evaluating orthogonal engineering dimensions (Syntax, Logic, Security, Performance, Architecture).
Single monolithic LLM prompts suffer from context truncation and missed vulnerabilities.

#### Alternatives Considered

1. **Single Monolithic Prompt:** Generates generic, shallow feedback and misses subtle security flaws.
2. **Sequential Agent Chain:** High latency ($> 45$ seconds per diff review).
3. **Parallel Specialized Agents:** Independent agents (SyntaxAgent, LogicAgent, SecurityAgent, PerformanceAgent,
   ArchitectureAgent) running concurrently against focused prompts.

#### Why This Option Was Chosen

Parallel agent execution reduces overall review latency to the duration of the slowest single agent call while allowing
each agent prompt to specialize strictly on its domain.

#### Trade-offs

- **Pros:** Deep domain analysis, parallel execution speed, modular agent extensions.
- **Cons:** Requires a finding aggregator & deduplicator to merge overlapping recommendations.
- **Affected Modules:** `packages/agents`, `packages/review-engine`.
- **References:** [`architecture.md`](file:///d:/Coding/zoro/architecture.md#L336), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L600).

---

### ADR-010: Repository Knowledge Graph (RKG) Schema & Taxonomy

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Static code analysis requires a formal graph taxonomy to represent code structures and relationships across file and
module boundaries.

#### Alternatives Considered

1. **Ad-Hoc JSON References:** Fragile, lacks explicit relation query capabilities.
2. **Formal Node & Edge Taxonomy:**
    - **Nodes:** `File`, `Module`, `Package`, `Class`, `Interface`, `Function`, `Variable`, `APIEndpoint`,
      `DatabaseModel`, `ConfigurationKey`, `UnitTest`.
    - **Edges:** `CONTAINS`, `IMPORTS`, `CALLS`, `INHERITS_IMPLEMENTS`, `MUTATES`, `TESTED_BY`, `CONFIGURES`,
      `HANDLED_BY`.

#### Why This Option Was Chosen

A formal node/edge taxonomy enables deterministic Cypher queries for caller/callee chains, circular dependency
detection, and impact radius calculations.

#### Trade-offs

- **Pros:** Strongly typed graph model, deterministic context extraction.
- **Cons:** Symbol resolution logic must map relative imports to absolute declaration IDs.
- **Affected Modules:** `packages/graph`, `packages/shared`.
- **References:** [`architecture.md`](file:///d:/Coding/zoro/architecture.md#L201), [
  `packages/shared/src/types/graph.types.ts`](file:///d:/Coding/zoro/packages/shared/src/types/graph.types.ts).

---

### ADR-011: Graph-First 2-Hop Context Retrieval Engine (CRE)

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

LLM context windows are limited and expensive. Naive vector search (RAG) dumps entire files or irrelevant text chunks,
causing high false positive rates and hallucinations.

#### Alternatives Considered

1. **Naive Vector RAG:** Misses caller/callee relationships; retrieves text based on keyword similarity rather than
   syntax rules.
2. **Full File Context Dumps:** Exceeds token budgets ($> 50,000$ tokens) and inflates API costs.
3. **Graph-First CRE Retrieval:** 2-hop structural graph walk ($C \rightarrow F \rightarrow D$) combined with vector
   search, producing compact subgraphs under 2,000 tokens.

#### Why This Option Was Chosen

CRE provides 100% precision on direct callers and callees while keeping prompt payloads lightweight, drastically
reducing LLM cost and hallucination rates.

#### Trade-offs

- **Pros:** Grounded precision, sub-2k token context size, low LLM cost.
- **Cons:** Requires RKG index build before initial retrieval.
- **Affected Modules:** `packages/retrieval`, `packages/graph`.
- **References:** [`architecture.md`](file:///d:/Coding/zoro/architecture.md#L261), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L442).

---

### ADR-012: Vanilla CSS Design Tokens over Tailwind for Web Core

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The Web Dashboard (`apps/web`) requires custom glassmorphism visual effects, dark mode themes, and specialized 3D graph
control containers matching [`design.md`](file:///d:/Coding/zoro/design.md).

#### Alternatives Considered

1. **TailwindCSS:** Rapid prototyping, but introduces utility class bloat when writing complex glassmorphism CSS
   backdrops and 3D graph canvas overlays.
2. **Vanilla CSS Design Tokens (`index.css`):** Centralized CSS custom properties (`--bg-primary`, `--accent-color`,
   `--glass-blur`) with pure CSS module encapsulation.

#### Why This Option Was Chosen

Vanilla CSS design tokens provide total styling flexibility, direct control over backdrop filters, and zero utility
class compilation overhead.

#### Trade-offs

- **Pros:** Pure CSS control, custom glassmorphism design system matching PRD specs.
- **Cons:** Requires writing semantic CSS selectors instead of inline utility classes.
- **Affected Modules:** `apps/web`.
- **References:** [`design.md`](file:///d:/Coding/zoro/design.md#L20), [`rules.md`](file:///d:/Coding/zoro/rules.md).

---

### ADR-013: Stitch for Interactive UI Generation & Mockups

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Designing premium frontend screens for the Web Dashboard requires rapid, high-fidelity UI layout generation that
strictly aligns with [`design.md`](file:///d:/Coding/zoro/design.md).

#### Alternatives Considered

1. **Manual Ad-Hoc Component Coding:** Time-consuming, risks design inconsistency across screens.
2. **Stitch Tool Integration:** Automated screen design, variant generation, and design system enforcement.

#### Why This Option Was Chosen

Stitch automates screen mockup generation while strictly enforcing predefined color tokens, glassmorphism card surfaces,
and accessibility boundaries.

#### Trade-offs

- **Pros:** Consistent UI design language, rapid screen generation.
- **Cons:** Generated UI components must be integrated into Next.js App Router paths.
- **Affected Modules:** `apps/web`.
- **References:** [`design.md`](file:///d:/Coding/zoro/design.md#L1).

---

### ADR-014: Vitest as Workspace Test Runner Infrastructure

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

We need a fast, native ESM unit and integration test runner across all monorepo subpackages.

#### Alternatives Considered

1. **Jest:** Slow startup times in ESM monorepos, complex transform configuration for TypeScript.
2. **Vitest:** Instant HMR test runner, native ESM and TypeScript support, shared configuration via
   `vitest.workspace.ts`.

#### Why This Option Was Chosen

Vitest uses Vite's transformation pipeline, running monorepo test suites in parallel with minimal startup overhead.

#### Trade-offs

- **Pros:** Ultra-fast execution, native TypeScript & ESM parsing, seamless workspace integration.
- **Cons:** Minor API differences from legacy Jest runners in global setup hooks.
- **Affected Modules:** All packages in `packages/`, `apps/`, `services/`.
- **References:** [`phases.md`](file:///d:/Coding/zoro/phases.md#L170).

---

### ADR-015: Docker Packaging Strategy for Local & Cloud Deployments

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The API Gateway and indexing workers must run reliably across local developer workstations, air-gapped enterprise
servers, and cloud Kubernetes clusters.

#### Alternatives Considered

1. **Bare Metal Node.js Install:** Prone to Node version mismatches and missing native C++ build toolchains.
2. **Multi-Stage Docker Containers:** Self-contained container images building native Tree-Sitter & KùzuDB dependencies
   in isolated build stages.

#### Why This Option Was Chosen

Multi-stage Docker builds isolate C++ native compilation in build stages, producing lightweight production runtime
containers (< 150MB).

#### Trade-offs

- **Pros:** Environment consistency, air-gapped offline deployment capability.
- **Cons:** Requires container build caching configuration in CI.
- **Affected Modules:** `services/api`, `services/indexing`, `services/pr-bot`.
- **References:** [`architecture.md`](file:///d:/Coding/zoro/architecture.md#L500), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L950).

---

### ADR-016: GitHub Actions for CI Pipeline Gate Enforcement

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Automated linting, typechecking, unit testing, and security scanning must execute on every pull request to protect
codebase integrity.

#### Alternatives Considered

1. **Manual PR Reviews:** Human oversight misses formatting regressions and subtle type errors.
2. **GitHub Actions Workflow (`ci.yml`):** Automated PR gate executing `pnpm lint`, `pnpm check-types`, and `pnpm test`.

#### Why This Option Was Chosen

GitHub Actions provides seamless GitHub PR integration, caching pnpm store directories to keep PR validation runs under
2 minutes.

#### Trade-offs

- **Pros:** Automated quality enforcement on PR pushes.
- **Cons:** Requires workflow file maintenance.
- **Affected Modules:** Root repository.
- **References:** [`.github/workflows/ci.yml`](file:///d:/Coding/zoro/.github/workflows/ci.yml), [
  `phases.md`](file:///d:/Coding/zoro/phases.md#L170).

---

### ADR-017: 4-Tier Unidirectionally Layered Monorepo Architecture

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

To prevent circular dependencies and spaghetti code in a complex repository platform, strict layer boundaries must be
enforced.

#### Alternatives Considered

1. **Unstructured Layering:** Allows presentation components to call database drivers or LLMs directly, causing tight
   coupling and untestable code.
2. **4-Tier Unidirectional Layering:**
   $$\text{Presentation Layer (Apps)} \longrightarrow \text{Application Layer (Services)} \longrightarrow \text{Domain Layer (Engines)} \longrightarrow \text{Infrastructure Layer (Adapters)}$$

#### Why This Option Was Chosen

Unidirectional layering guarantees that higher layers depend on lower abstraction layers, never in reverse. Presentation
components are forbidden from importing database drivers or PAL adapters directly.

#### Trade-offs

- **Pros:** Modular testability, architectural isolation, zero circular dependencies.
- **Cons:** Requires passing requests through application service orchestrators.
- **Affected Modules:** Entire monorepo workspace.
- **References:** [`rules.md`](file:///d:/Coding/zoro/rules.md#L36), [
  `architecture.md`](file:///d:/Coding/zoro/architecture.md#L40).

---

### ADR-018: Unified Vitest Workspace & Playwright E2E Strategy

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The monorepo requires a unified testing framework to execute unit tests, integration tests with V8 coverage, and
end-to-end (E2E) browser smoke tests across all sub-packages without configuration fragmentation.

#### Alternatives Considered

1. **Jest + Cypress:** Heavy configuration footprint, slow startup times, and complex monorepo ESM module resolution
   issues.
2. **Node.js Native Test Runner (`node:test`):** Lightweight, but lacks native V8 code coverage threshold enforcement,
   React DOM component rendering utilities, and workspace runner configuration.
3. **Vitest + Playwright (`@repo-intel/testing`):** Vitest provides instant ESM execution across monorepo packages
   (`vitest.workspace.ts`) with V8 coverage thresholds, while Playwright provides headless browser E2E smoke tests.

#### Why This Option Was Chosen

Vitest integrates seamlessly with Vite and TypeScript composite packages, enabling zero-config ESM test execution across
sub-packages. Playwright ensures full-stack E2E UI verification for the Next.js web application.

#### Trade-offs

- **Pros:** Fast ESM execution, unified workspace runner, V8 coverage reporting, automated Playwright UI smoke testing.
- **Cons:** Requires Chromium binary installation in CI runner environments.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/testing`, `services/api`, `apps/web`,
  `.github/workflows/ci.yml`.
- **References:** [`phases.md`](file:///d:/Coding/zoro/phases.md#L175), [
  `vitest.workspace.ts`](file:///d:/Coding/zoro/vitest.workspace.ts).

---

### ADR-019: Heuristic Language Registry & Zero-Grammar Metadata Strategy

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Repository intelligence requires classifying scanned files into programming languages (`typescript`, `python`, `go`) and
functional categories (`source`, `test`, `config`, `documentation`) and computing repository-level metadata (primary
language, framework hints, language distribution byte percentages) prior to executing heavy AST parsing.

#### Alternatives Considered

1. **Tree-Sitter Grammar Parsing for Classification:** Invoking full Tree-Sitter grammars just to identify file
   language/type is computationally expensive ($> 100\text{ms}$ per file).
2. **Extension & Shebang Heuristics (`@repo-intel/parser`):** Fast $O (1)$ extension mapping dictionary fallback to
   256-byte shebang header inspection (`#!/usr/bin/env node`, `python3`).

#### Why This Option Was Chosen

Heuristic classification executes in $< 0.01\text{ms}$ per file with zero native WASM/C++ grammar dependency overhead,
keeping file classification and repository metadata extraction decoupled from AST parsing.

#### Trade-offs

- **Pros:** Ultra-high throughput ($> 50,000$ files/sec), zero Tree-Sitter overhead, clean separation of concerns.
- **Cons:** Ambiguous extensions (e.g. `.h`) require fallback heuristics based on sibling directory files.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/parser`.
- **References:** [`phases.md`](file:///d:/Coding/zoro/phases.md#L226), [
  `packages/parser/src/language/classifier.ts`](file:///d:/Coding/zoro/packages/parser/src/language/classifier.ts).

---

### ADR-020: Repository State Store & Incremental Hash Short-Circuit Strategy

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Scanning and hashing every file content in large monorepos ($> 100,000$ files) on every incremental edit causes severe
disk I/O bottlenecks and high system latency.

#### Alternatives Considered

1. **Full Re-Scan & Re-Hash On Every Run:** Computes SHA-256 for all files every scan, causing high CPU/disk I/O usage.
2. **Generic State Store & Metadata Short-Circuiting (`RepositoryStateStore` & `DeltaEngine`):** Decouples cache
   persistence via `RepositoryStateStore` (`JsonRepositoryStateStore` saving `.repo-intel-cache.json`). The
   `DeltaEngine` compares `sizeInBytes` and `mtimeMs` first; SHA-256 is only computed if file metadata differs.

#### Why This Option Was Chosen

Metadata short-circuiting reduces warm scan duration to $< 100\text{ms}$ with zero disk read operations on unchanged
files while remaining extensible for future persistent backends (SQLite / KùzuDB) via `RepositoryStateStore`.

#### Trade-offs

- **Pros:** Fast warm scans ($< 50\text{ms}$), atomic state saving, decoupled storage backend, zero hash ops on
  unchanged files.
- **Cons:** Extremely rare `mtime` touch collisions without content change require fallbacks.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/parser`.
- **References:** [`phases.md`](file:///d:/Coding/zoro/phases.md#L246), [
  `packages/parser/src/indexer/delta-engine.ts`](file:///d:/Coding/zoro/packages/parser/src/indexer/delta-engine.ts).

---

## Future Decisions

Reserved slots for future architectural decision records:

- **ADR-021:** KùzuDB Native vs WASM Browser Compilation Strategy
- **ADR-022:** Vector Embedding Engine Selection (LanceDB vs Qdrant)
- **ADR-023:** Token Pruning & Signature Truncation Algorithm
- **ADR-024:** PR Webhook Event Queue Strategy (Redis / BullMQ vs Native NATS)
- **ADR-022:** Multi-Tenant Role-Based Access Control (RBAC) Architecture
- **ADR-023:** 3D Knowledge Graph Rendering Engine (Cytoscape.js vs Three.js ForceGraph)
- **ADR-024:** VS Code LSP Diagnostic Protocol Extension Design
- **ADR-025:** Repository Memory & Ignored Findings Vector Persistence
- ...
- **ADR-100:** Enterprise Self-Hosted Air-Gapped Packaging Specification

---

### ADR-018: Data-Driven Language Registry Architecture

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Phase 09 introduced a language classification system. Early prototypes hard-coded language extension mappings directly
in TypeScript. As the number of supported languages grew, this became difficult to maintain and extend.

#### Decision

Language definitions are extracted into a `languages.data.ts` resource file using a structured `LanguageDefinition`
interface. Framework detectors are modular classes implementing a `FrameworkDetector` interface. A `LanguageRegistry`
class wraps the data for runtime lookup.

#### Consequences

- Adding new languages requires editing only the data file, not logic code.
- Framework detection is composable and testable in isolation.
- Language plugin contracts are consistent across all languages.

---

### ADR-019: Repository Scanner Event-Driven Architecture

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The incremental indexer and scanner need to report progress and lifecycle events to higher-level consumers (API, UI,
tests). A polling model would couple consumers to internals.

#### Decision

A strongly typed `ScannerEventEmitter` class publishes a discriminated union of event types with typed payloads.
Consumer code subscribes via `on(eventType, listener)`. Event types cover the full lifecycle: `RepositoryOpened`,
`RepositoryScanned`, `FileAdded`, `FileModified`, `FileDeleted`, `FileIgnored`, `FileParsingStarted`,
`FileParsingCompleted`, `ParseFailed`, `ScanCompleted`, `RepositoryIndexed`, `RepositoryCompleted`, `ScanCancelled`.

#### Consequences

- Decouples scanner internals from consumers.
- Events are type-safe at compile time.
- Subscriber errors are caught to avoid crashing the scanner loop.

---

### ADR-020: JSON File-Based Repository State Store Strategy

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

The incremental indexer needs persistent state across runs to support delta computation and hash short-circuit
optimization. The solution must be simple, portable, and not introduce a database dependency in Phase 10.

#### Decision

`JsonRepositoryStateStore` saves `RepositoryState` as a `.repo-intel-cache.json` file inside the repository root using
atomic rename (write-then-move) to prevent corruption on crash. Nodes requiring `node:sqlite` are avoided to maintain
Node.js v20 compatibility.

#### Consequences

- Zero external database dependency for state caching.
- Atomic writes prevent partial state corruption.
- The interface (`RepositoryStateStore`) allows swapping to SQLite or embedded DB in future phases.

---

### ADR-021: Tree-Sitter Abstraction & Parser Pooling Strategy

- **Status:** Accepted
- **Date:** 2026-07-22

#### Context

Phase 11 introduces the Tree-Sitter Parser Abstraction Manager. The goal is to provide a production-ready parsing
infrastructure layer without exposing raw Tree-Sitter API types to higher-level packages.

#### Decision

Four design choices were made:

1. **AST Domain Layer in `@repo-intel/shared`:** All packages consume `ASTNode`, `ASTTree`, `ASTCursor`, `ASTVisitor`,
   `ASTQuery`, and `NormalizedSymbol` domain types. Raw Tree-Sitter nodes must never cross package boundaries.

2. **Grammar Registry (`GrammarRegistry`):** Maintains grammar metadata (id, languageId, WASM path placeholder, version,
   capabilities) independently from language plugins. This allows grammar loading to evolve without touching plugin
   definitions.

3. **Generic Parser Pool (`ParserPool<T>`):** A reusable object pool with `acquire()`/`release()` semantics, `maxSize`
   limit, and idle timeout eviction. Avoids repeated expensive Tree-Sitter parser instance creation.

4. **Placeholder Binding First:** Phase 11 builds the full abstraction without wiring actual WASM/native binaries.
   Actual grammar loading is deferred to Phase 12 when the first symbol extractor (TypeScript) validates the grammar
   binary in CI.

#### Consequences

- Higher-level packages are fully decoupled from Tree-Sitter internals.
- The parser pool enables concurrent parsing without re-initialization overhead.
- Grammar registry supports future hot-swap of grammars without restarts.

### ADR-022: Knowledge Graph Abstraction and Storage Strategy

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

The platform requires building an in-memory/embedded **Repository Knowledge Graph (RKG)** containing normalized entities
(`Repository`, `Directory`, `File`, `Symbol`, `Module`) and directional semantic relationships (`CONTAINS`, `IMPORTS`,
`EXPORTS`, `CALLS`, `REFERENCES`, `IMPLEMENTS`, `EXTENDS`, `DEPENDS_ON`, `USES`, `OVERRIDES`). To prevent vendor lock-in
and enable zero-dependency development and testing, graph building must be decoupled from specific underlying graph
database drivers (KùzuDB, Neo4j, etc.).

#### Alternatives Considered

1. **Direct Coupling to KùzuDB Native Driver:** Requires native C++ compilation in unit testing and local development,
   increasing build friction.
2. **Generic Database Agnostic Interface (`GraphStore`):** Define a clean `GraphStore` interface (`addNode`, `addEdge`,
   `removeNode`, `removeEdge`, `getNode`, `getEdge`, `queryNodes`, `queryEdges`, `commit`, `clear`) with an in-memory
   Map-backed implementation (`InMemoryGraphStore`) for rapid local development, testing, and graph serialization.

#### Why This Option Was Chosen

`GraphStore` abstraction guarantees that `KnowledgeGraphBuilder` and graph traversals operate purely against clean
domain interfaces. Future storage adapters (e.g. KùzuDB in Phase 17) can be introduced without changing graph
construction logic.

#### Consequences

- **Positive:** Fast, zero-dependency unit testing and graph serialization (`exportGraphJson`/`importGraphJson`).
- **Negative:** Requires mapping graph entities to native storage drivers when introducing persistent graph databases.
- **Affected Modules:** `@repo-intel/graph`, `@repo-intel/parser`, `@repo-intel/shared`.

---

### ADR-023: Graph Enrichment, Provenance, and Cross-Language Resolution Strategy

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

The Repository Knowledge Graph (RKG) requires multi-pass semantic enrichment to resolve import specifiers to target file
nodes, compute inheritance chains and method overrides, and track evidence and confidence scores. Furthermore,
multi-language repositories (TypeScript, Python, Go, Java) necessitate a normalized semantic layer (`ClassLike`,
`FunctionLike`, `InterfaceLike`, `EnumLike`, `ModuleLike`) to allow unified, language-agnostic graph queries.

#### Alternatives Considered

1. **Embedding Resolution in Language Extractors:** Bundling import and type resolution directly inside AST extractors
   couples parsing with graph state and duplicates resolution logic across languages.
2. **Modular Resolvers & Graph Enrichment Engine (`ModuleResolver`, `TypeResolver`, `GraphEnricher`,
   `CrossLanguageResolver`):** Decouple resolution into standalone language-independent resolvers. `GraphEnricher`
   performs multi-pass graph resolution while attaching `GraphProvenance` metadata (`extractor`, `language`, `evidence`,
   `confidence`, `timestamp`) to enriched edges. `CrossLanguageResolver` maps language-specific nodes to unified
   `NormalizedConcept` abstractions.

#### Why This Option Was Chosen

Decoupling resolution guarantees that AST extraction remains high-speed and stateless. Attaching explicit provenance
metadata to enriched edges enables full explainability during AI code review and graph walks. High-speed resolution
caching (`ResolutionCache`) ensures monorepo scalability.

#### Consequences

- **Positive:** Clean architectural separation, language-agnostic graph queries, full provenance explainability, and
  high-performance resolution caching.
- **Negative:** Requires multi-pass execution during knowledge graph construction.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/parser`, `@repo-intel/graph`.

---

### ADR-024: Vector Embedding Architecture, Vector Store Abstraction, and Hybrid Search Strategy

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

The Context Retrieval Engine (CRE) requires combining structural Knowledge Graph entities with semantic vector
embeddings to enable similarity search, hybrid search, and code context payload construction. The vector storage and
embedding provider layers must be database-decoupled to support both cloud model embeddings (OpenAI
`text-embedding-3-small`) and air-gapped local embeddings (Ollama / SentenceTransformers) without lock-in to a specific
vector database.

#### Alternatives Considered

1. **Direct Coupling to a Specific Vector Database (e.g. LanceDB or Qdrant):** Embeds specific vector database drivers
   directly into code analysis logic, making unit testing and local offline runs complex.
2. **Decoupled Provider & Vector Store Abstraction (`EmbeddingProvider`, `VectorStore`, `ContextBuilder`,
   `RankingService`):** Introduce `EmbeddingProvider` (`embed`, `embedBatch`, `dimensions`, `model`) and `VectorStore`
   (`upsert`, `search`, `delete`, `get`) interfaces in `@repo-intel/shared`. `ContextBuilder` constructs semantic text
   representations combining entity labels, signatures, docs, modifiers, and 1-hop graph neighbourhoods.
   `RankingService` combines vector similarity, graph proximity, lexical relevance, and symbol importance into unified
   scores.

#### Why This Option Was Chosen

`VectorStore` abstraction allows seamless swapping between `InMemoryVectorStore` (used in fast unit tests and
zero-dependency environments) and persistent vector engines (LanceDB/Qdrant in future production deployments).
`RankingService` guarantees multi-dimensional score normalization across vector and structural graph dimensions.

#### Consequences

- **Positive:** Zero-dependency testing, full vector model migration support via `EmbeddingMetadata`, hybrid vector +
  graph ranking capability.
- **Negative:** Requires serializing graph neighbourhood context strings into embedding payloads.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/graph`, `@repo-intel/retrieval`.

---

### ADR-025: GraphRAG Retrieval Engine Architecture, Retrieval Planner, and Retrieval Bundle Payload Specification

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Downstream multi-agent AI review pipelines and patch generators require a standardized, budget-constrained context
payload payload bundle (`RetrievalBundle`) extracted from the repository. Raw vector similarity searches miss structural
graph dependencies (call chains, inheritance, import relationships), while pure graph walks lack semantic query
understanding. A hybrid GraphRAG retrieval pipeline combining intent analysis, retrieval planning, vector search,
multi-hop graph expansion, context compression, and provenance tracking is required.

#### Alternatives Considered

1. **Unstructured Text Snippet Assembly:** Passing raw file diffs or unranked text chunks to LLM prompts risks context
   window overflow ($> 128,000$ tokens) and introduces hallucination.
2. **Stage-Gated GraphRAG Retrieval Pipeline (`GraphRAGRetrievalEngine`):**
    - **Query Intent Analysis (`QueryAnalyzer`):** Classifies queries into 8 intent categories (`bug_investigation`,
      `architecture`, `dependency`, `performance`, `security`, `documentation`, `refactoring`, `general_search`).
    - **Retrieval Planner (`DefaultRetrievalPlanner`):** Computes `vectorK`, `maxHops`, `expansionStrategies`,
      `tokenBudget`, and ranking policy.
    - **Multi-Hop Graph Expander (`GraphExpander`):** Walks `CALLS`, `IMPORTS`, `EXTENDS`, `IMPLEMENTS`, and
      `DEPENDS_ON` edges.
    - **Context Compressor (`ContextCompressor`):** Merges duplicate entities and prunes context payloads to strictly
      fit LLM token budgets.
    - **Standardized Payload Model (`RetrievalBundle`):** Assembles summary, intent, plan, compressed entities with
      `EntityRetrievalProvenance`, relationships, file/symbol IDs, evidence text, and latency metrics.

#### Why This Option Was Chosen

GraphRAG guarantees that AI review agents receive concise ($< 2,000$ tokens), highly relevant, structurally sound
subgraphs with complete provenance explainability.

#### Consequences

- **Positive:** Concise context payloads, zero prompt pollution, complete retrieval explainability, multi-hop structural
  context, and sub-500ms retrieval latency.
- **Negative:** Requires maintaining graph expansion policies and query intent keyword rules.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/graph`, `@repo-intel/retrieval`.

---

### ADR-026: AI Platform Layer (PAL) & Provider Abstraction

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Code intelligence features must avoid vendor lock-in to specific AI foundation model providers (e.g., OpenAI, Anthropic,
Google Gemini, Ollama, OpenRouter). System business logic, review agents, and patch planners should consume a
provider-agnostic interface capable of runtime provider switching, automatic health monitoring, and failover execution.

#### Alternatives Considered

1. **Direct SDK Import (e.g., `openai` or `@google/generative-ai` in review code):** Tightly couples review agents to
   proprietary vendor APIs, making air-gapped local LLM deployments (Ollama) impossible.
2. **Provider-Independent AI Platform Layer (`AIProvider`, `ProviderRegistry`, `ModelRegistry`):**
    - **`AIProvider` Interface:** `chat`, `stream`, `embeddings`, `health`, `metadata`.
    - **`ProviderRegistry`:** Dynamic provider registration, active provider selection, and health-based failover chains
      (`openai` -> `ollama` -> `mock`).
    - **`ModelRegistry`:** Context window specs, token pricing, reasoning, tool support, streaming, and vision
      capabilities.
    - **`PromptTemplateManager`:** Decoupled external prompt templates for `architecture`, `bug`, `performance`,
      `security`, `code_quality`, `documentation`.

#### Why This Option Was Chosen

`AIProvider` guarantees total provider independence, zero-downtime failover, and seamless switching between cloud LLMs
and air-gapped local models.

#### Consequences

- **Positive:** Zero vendor lock-in, air-gap compatibility via `OllamaProvider`, deterministic offline testing via
  `MockAIProvider`.
- **Negative:** Requires mapping provider-specific response formats to standard `AIChatResponse`.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/ai`, `@repo-intel/review-engine`.

---

### ADR-027: Multi-Agent Review Architecture

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Code review requires multidimensional inspection (architecture, security, performance, logic bugs, code quality,
documentation). A monolithic single-prompt LLM call suffers from context pollution, high latency, and poor specialized
analysis.

#### Alternatives Considered

1. **Monolithic Prompt LLM Review:** Passing the entire context to a single prompt asking for "all issues" produces
   surface-level, inconsistent feedback.
2. **Decoupled Multi-Agent Review Engine (`AgentOrchestrator` & 6 Specialized Agents):**
    - **Specialized Agents:** `ArchitectureAgent`, `BugDetectionAgent`, `PerformanceAgent`, `SecurityAgent`,
      `CodeQualityAgent`, `DocumentationAgent`.
    - **Independent Execution:** Every agent operates in isolation, receiving `RetrievalBundle` subgraphs and selecting
      domain-specific prompts.
    - **`AgentOrchestrator`:** Orchestrates parallel agent execution with configurable timeouts (10s), retry logic,
      fallback providers, and finding aggregation into standard `ExplainableFinding[]`.

#### Why This Option Was Chosen

Multi-agent parallelism provides deep, specialized analysis across domain concerns while reducing review latency via
concurrent provider calls.

#### Consequences

- **Positive:** High audit precision, parallel review execution, fault isolation, standardized `ExplainableFinding`
  payloads.
- **Negative:** Increases token consumption across concurrent LLM API calls.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/ai`, `@repo-intel/review-engine`.

---

### ADR-028: CI/CD & Release Pipeline Strategy

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Monorepo stability and security require rigorous continuous integration quality gates on Node 22 LTS, frozen lockfile
enforcement, composite TypeScript compilation, unit test coverage reporting, static CodeQL security analysis, and
automated dependency management.

#### Alternatives Considered

1. **Ad-hoc Unstructured CI Scripts:** Leads to non-reproducible builds, lockfile drift, and silent type failures.
2. **Stage-Gated GitHub Actions Workflows (`ci.yml`, `codeql.yml`, `dependabot.yml`):**
    - **Quality Gates:** Lockfile verification (`pnpm install --frozen-lockfile`), format checking, `tsc --build`
      composite typecheck.
    - **Testing & Artifacts:** Vitest suite execution with JUnit test reporting and V8 coverage artifact uploads.
    - **Security:** Static security analysis via GitHub CodeQL (`javascript-typescript`) and weekly Dependabot
      dependency checks.

#### Why This Option Was Chosen

Stage-gated CI enforces strict build hygiene and prevents broken code or security vulnerabilities from reaching `main`.

#### Consequences

- **Positive:** Automated lockfile hygiene, zero type errors, security vulnerability prevention, reproducible builds.
- **Negative:** Requires managing GitHub Actions runner execution times.
- **Affected Modules:** `.github/workflows/`, root repository configuration.

---

### ADR-029: Developer Context Engine Architecture & Runtime Context Model

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

AI review agents and patch planning engines require a unified runtime context object combining code diffs, Knowledge
Graph subgraphs, historical commits, related documentation, and test associations. Passing unstructured diff text misses
critical graph dependencies and context boundaries.

#### Alternatives Considered

1. **Unstructured String Concat:** Assembling plain diff strings and passing them directly to LLMs leads to missing
   dependency context and prompt token bloat.
2. **Unified `DeveloperContext` Runtime Engine (`DeveloperContextEngine`):** Combines `StructuredDiff` (from
   `DiffEngine`), impacted symbols, graph dependencies, affected architecture modules, historical commits, related
   documentation, and unit tests into a single structured object.

#### Why This Option Was Chosen

`DeveloperContext` serves as the universal runtime payload for all downstream AI review agents and prompt context
builders, ensuring full structural awareness.

#### Consequences

- **Positive:** Complete structural context, token-budgeted prompt generation via `PromptContextBuilder`, zero
  hallucination regarding code dependencies.
- **Negative:** Requires graph lookup overhead per review request.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/review-engine`.

---

### ADR-030: Git Intelligence Layer & Structured Diff Engine

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Directly invoking `git` CLI subprocesses inside review agents creates platform dependency risks and makes local unit
testing complex. A provider-agnostic Git intelligence abstraction (`GitProvider`) and structured diff parser
(`DiffEngine`) are required.

#### Alternatives Considered

1. **Direct `child_process.exec('git diff')` calls:** Inflexible, OS-dependent, untestable in zero-dependency unit
   environments.
2. **Git Abstraction & Structured Diff Engine (`GitProvider`, `LocalGitProvider`, `DiffEngine`):**
    - **`GitProvider`:** Abstraction exposing `getRepository`, `getBranches`, `getCommit`, `getDiff`, `getPullRequest`,
      `getChangedFiles`, `getChangedSymbols`.
    - **`DiffEngine`:** Parses raw diff patches into `StructuredDiff` objects tracking `changedFiles`, `changedSymbols`,
      `addedMethods`, `removedMethods`, `renamedSymbols`, `movedFiles`.

#### Why This Option Was Chosen

`GitProvider` decouples the review engine from local shell environments, supporting seamless extensions to GitHub API
(`GitHubGitProvider`) and GitLab API.

#### Consequences

- **Positive:** Total VCS platform independence, fast unit testing via `LocalGitProvider`, rich symbol-level diff
  breakdown.
- **Negative:** Requires custom regex diff parsing logic for non-standard patch formats.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/review-engine`.

---

### ADR-031: Review Session Lifecycle & Session Store Architecture

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Code reviews require persistent tracking of user prompts, participating agents, execution history, findings, generated
patch plans, and latency metrics across time.

#### Alternatives Considered

1. **Stateless Transient Execution:** Review outputs are returned immediately and lost, preventing auditability or
   incremental follow-up patches.
2. **Stateful `ReviewSession` & `ReviewSessionStore` Architecture:**
    - **`ReviewSession`:** Encapsulates `repositoryId`, `branch`, `commitHash`, `userPrompt`, `retrievedContext`,
      `participatingAgents`, `executionHistory`, `findings`, `patchPlans`, `metrics`.
    - **`ReviewSessionStore`:** Abstraction supporting `InMemoryReviewSessionStore` (for unit testing/CLI) with future
      persistent adapters (SQLite/Postgres).

#### Why This Option Was Chosen

`ReviewSessionStore` enables persistent audit history, multi-turn review conversations, and automated session artifact
export in CI.

#### Consequences

- **Positive:** Full auditability, multi-agent execution tracking, session persistence.
- **Negative:** In-memory store requires memory management under high session volumes.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/review-engine`.

---

### ADR-032: Incremental AI Review Strategy & Subgraph Scoping

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Re-analyzing an entire multi-million line repository for a single file or method change consumes excessive LLM tokens
and introduces multi-second latency.

#### Alternatives Considered

1. **Full Repository Re-Review:** Re-embedding and re-evaluating all repository symbols on every commit.
2. **Scoped Incremental AI Review (`IncrementalReviewEngine`):**
    - Extracts changed symbols and files from `StructuredDiff`.
    - Executes scoped retrieval queries limited to changed symbols and 1-hop graph neighbourhoods.
    - Enforces a reduced token budget (1,500 tokens) for sub-5s incremental analysis.

#### Why This Option Was Chosen

Incremental review reduces LLM API costs by $> 80\%$ and delivers sub-5s feedback during active developer editing and PR
review pipelines.

#### Consequences

- **Positive:** Sub-5s review latency, 80% reduction in LLM token cost, targeted audit precision.
- **Negative:** May miss complex multi-hop indirect side-effects spanning $> 3$ hops.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/review-engine`.

---

### ADR-033: AST Transformation Framework Architecture & Reversible Refactorings

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Automated code modification and auto-fixing require deterministic, language-agnostic AST transformations that can be
safely validated and reversed (rolled back) without corrupting source code repositories.

#### Alternatives Considered

1. **Unstructured String Regular Expressions:** Regex search and replace fails on complex nested syntax, corrupts
   indentation, and cannot be reliably validated or reversed.
2. **AST Transformation Framework (`ASTTransformation`, `TransformationRegistry`, Language Adapters):**
    - **`ASTTransformation` Interface:** Enforces `apply()`, `validate()`, `rollback()` contracts.
    - **`TransformationRegistry`:** Manages capability discovery, registration, and deterministic execution.
    - **Refactoring Library:** 12 core transformations (`RenameSymbol`, `ExtractMethod`, `InlineMethod`, `InsertImport`,
      `RemoveImport`, `UpdateSignature`, `AddDocumentation`, etc.).
    - **Language Adapters:** Exposes AST parsers, node builders, and formatters for TypeScript, Python, Go, and Java.

#### Why This Option Was Chosen

`ASTTransformation` guarantees deterministic code modifications, language independence, and complete rollback safety.

#### Consequences

- **Positive:** Reversible code edits, zero syntax corruption, multi-language support.
- **Negative:** Requires adapter maintenance per supported language AST structure.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/patch-gen`.

---

### ADR-034: Patch Generation Engine & Validation Pipeline Strategy

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Generated patches must be rigorously validated before presentation or execution to ensure zero syntax errors, lint
compliance, type correctness, and low blast radius.

#### Alternatives Considered

1. **Direct Disk Editing:** Mutating files directly on disk risks corrupting active development workspaces upon invalid
   LLM output.
2. **In-Memory Patch Simulation & Multi-Factor Validation Pipeline (`PatchGenerationEngine`,
   `PatchValidationPipeline`):**
    - **Simulation Pipeline:** Original AST -> Transformation -> Validation -> Pretty Printer -> Unified Diff ->
      `PatchCandidate`.
    - **Validation Pipeline:** Runs AST syntax validation, parser checks, lint rules, type safety checks, and computes a
      multi-factor score (`correctness`, `confidence`, `complexity`, `blastRadius`, `breakingChangeLikelihood`).

#### Why This Option Was Chosen

In-memory simulation ensures files are never mutated directly, while multi-factor scoring rejects low-confidence or
high-risk patches automatically.

#### Consequences

- **Positive:** Non-destructive patch generation, multi-factor safety scoring, sub-100ms patch generation latency.
- **Negative:** Scored metrics rely on heuristic blast-radius calculations.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/patch-gen`.

---

### ADR-035: Explainable Patch Architecture & Simulation Pipeline

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Developers require complete transparency into why a patch was generated, what symbols were modified, what risks exist,
and how to verify the patch before applying it.

#### Alternatives Considered

1. **Unexplainable Unified Diff Only:** Emitting raw diff patches without rationale or risk metadata forces developers
   to manually re-audit changes.
2. **Explainable Patch Architecture (`PatchExplanationEngine`, `PatchCandidate`):**
    - **`PatchExplanationEngine`:** Generates structured explanations containing problem summary, why this change was
      made, affected files, affected symbols, expected behavior, possible risks, and verification steps.
    - **`PatchCandidate` Payload:** Combines unified diff, original code, transformed code, explanation, validation
      report, risk score, and rollback metadata.

#### Why This Option Was Chosen

Explainable patches build developer trust, streamline code reviews, and provide clear verification steps.

#### Consequences

- **Positive:** Complete patch transparency, automated risk disclosures, actionable verification steps.
- **Negative:** Increases payload size of `PatchCandidate` objects.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/patch-gen`.

---

### ADR-036: Platform Runtime Architecture & Unified Lifecycle Management

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Clients (API Gateway, CLI, IDE Extension, GitHub App) require a single, centralized runtime interface to orchestrate
dependency wiring, lifecycle management, service discovery, configuration, and graceful shutdown without accessing
lower-level engine implementations directly.

#### Alternatives Considered

1. **Ad-hoc Service Instantiation in Client Handlers:** Leads to duplicate engine wiring, uncoordinated database
   connections, and dirty shutdowns.
2. **Unified `PlatformRuntime` Architecture (`DefaultPlatformRuntime`):**
    - Implements `initialize()`, `shutdown()`, `health()`, and `execute()` lifecycle interfaces.
    - Centralizes `EventBus`, `ObservabilityManager`, `JobQueue`, `WorkflowEngine`, and internal domain services.
    - Enforces that no client bypasses the runtime.

#### Why This Option Was Chosen

`PlatformRuntime` guarantees centralized lifecycle control, robust health monitoring, and uniform command dispatching.

#### Consequences

- **Positive:** Centralized dependency wiring, reliable graceful shutdown, single point of entry for all clients.
- **Negative:** Requires initial startup initialization phase.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/api`.

---

### ADR-037: Workflow Engine Architecture & Deterministic Stages

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Multi-step platform operations (Review, Patch Generation, Repository Indexing) require deterministic execution stages
with progress tracking, retries, cancellation capabilities, and execution history logging.

#### Alternatives Considered

1. **Unstructured Async Function Calls:** Hard to track progress, impossible to cancel mid-flight, and lacks structured
   execution histories.
2. **Deterministic `WorkflowEngine` Stage Pipeline (`DefaultWorkflowEngine`):**
    - Defines `WorkflowStage` steps for `review`, `patch`, and `index` workflows.
    - Manages stage transitions, stage context accumulation, execution state logging (`WorkflowExecution`), and runtime
      cancellation.

#### Why This Option Was Chosen

`WorkflowEngine` provides total execution transparency, stage-gated progress reporting, and clean cancellation control.

#### Consequences

- **Positive:** Deterministic stage progress, cancellation support, execution history logging.
- **Negative:** Requires serializing intermediate stage contexts.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/api`.

---

### ADR-038: Internal Event Bus & Typed Event Messaging Strategy

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

Platform components (indexer, graph, retrieval, review engine, patch generator, session store) require asynchronous,
decoupled event notifications without direct circular dependencies between modules.

#### Alternatives Considered

1. **Direct Synchronous Method Invocations:** Tightly couples modules, causing circular package references and
   synchronous latency spikes.
2. **Typed Pub/Sub Event Bus (`TypedEventBus`):**
    - Exposes `publish` and `subscribe` for strongly-typed events (`RepositoryIndexed`, `GraphUpdated`,
      `RetrievalCompleted`, `ReviewStarted`, `ReviewCompleted`, `PatchGenerated`, `PatchValidated`, `SessionClosed`).
    - Attaches correlation IDs for distributed tracing.

#### Why This Option Was Chosen

`TypedEventBus` decouples domain modules, enables asynchronous event processing, and maintains strict correlation
tracing.

#### Consequences

- **Positive:** Decoupled architecture, asynchronous event handling, end-to-end correlation tracing.
- **Negative:** Requires managing event handler errors to prevent unhandled rejections.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/api`.

---

### ADR-039: Internal Service Layer Architecture & Domain Orchestration

- **Status:** Accepted
- **Date:** 2026-07-27

#### Context

API routes, CLI commands, and web sockets should consume high-level domain services (`RepositoryService`,
`ReviewService`, `RetrievalService`, `PatchService`, `SessionService`, `GraphService`, `AIService`) rather than invoking
raw low-level engines (`GraphStore`, `VectorStore`, `SearchEngine`) directly.

#### Alternatives Considered

1. **Direct Engine Usage in Controller Handlers:** Mixes HTTP transport logic with low-level graph and vector store
   orchestration.
2. **Internal Service Layer Architecture (`DefaultRepositoryService`, `DefaultReviewService`, etc.):**
    - High-level domain services orchestrate underlying engines, git providers, and review agents.
    - Exposes clean, stable contracts defined in `@repo-intel/shared`.

#### Why This Option Was Chosen

The internal service layer enforces clean architectural boundaries, separates transport from domain logic, and
simplifies unit testing.

#### Consequences

- **Positive:** Clean architecture boundaries, reusable domain logic across CLI and API, simplified testing.
- **Negative:** Adds a thin delegation wrapper over internal engines.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/api`.

---

### ADR-040: AI Provider Plugin Architecture

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Adding new AI providers (e.g. OpenAI, Anthropic, Ollama, vLLM) required modifying internal provider registries and
factory switch statements. A self-contained plugin model was required so that new providers can be registered without
altering core code.

#### Options Considered

1. **Monolithic Factory Switches:** Tightly couples core provider registry code to specific vendor SDK implementations.
2. **Self-Contained Plugin System (`AIProviderPlugin`):**
    - Each provider encapsulates `metadata`, `provider`, `models`, `capabilities`, `initialize()`, and `dispose()`.
    - New providers are added simply by implementing `AIProviderPlugin` and registering with `ProviderManager`.

#### Why This Option Was Chosen

`AIProviderPlugin` provides a modular plugin system enabling third-party or custom LLM adapters to be registered
dynamically without modifying core system logic.

#### Consequences

- **Positive:** Zero core code modifications needed when adding new providers.
- **Negative:** Requires wrapping existing `AIProvider` instances in plugin shells.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/ai`.

---

### ADR-041: Model Capability Framework & Dynamic Feature Toggles

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

The application needs to enable or disable features (e.g., streaming, embeddings, vision, reasoning, function calling,
long context) based on model capabilities rather than hardcoding vendor check strings like `if (provider === 'openai')`.

#### Options Considered

1. **Vendor Check Conditionals:** Fragile string checks scattered across UI and backend services.
2. **Capability Framework (`ModelCapabilityMap`):**
    - Models advertise explicit boolean capability flags (`chat`, `streaming`, `embeddings`, `reasoning`, `vision`,
      `tools`, `longContext`).
    - Feature auto-toggle queries (`hasCapability('streaming')`) drive application behavior dynamically.

#### Why This Option Was Chosen

The capability framework decouples feature flags from vendor names, ensuring new models automatically activate supported
features.

#### Consequences

- **Positive:** Decoupled feature toggling, dynamic UI capability badges, self-documenting model capabilities.
- **Negative:** Model capability definitions must be kept updated.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/ai`, `apps/web`.

---

### ADR-042: Provider Lifecycle & Health Monitoring Architecture

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

The system requires centralized lifecycle management (`initializeAll`, `disposeAll`), background health checks, hot
provider switching without application restart, persistent configuration, and usage analytics.

#### Options Considered

1. **Stateless Unmanaged Providers:** Fails to track latency, request success rates, token usage, or configuration
   persistence.
2. **Centralized Provider Manager (`ProviderManager`):**
    - Manages lifecycle, health monitoring, error rate tracking, and usage metrics aggregation.
    - Persists settings across sessions to `.repo-intel-providers.json`.
    - Enables zero-downtime hot switching via REST API and CLI.

#### Why This Option Was Chosen

`ProviderManager` provides enterprise-grade observability, health diagnostics, usage tracking, and hot provider
switching across web, CLI, and REST interfaces.

#### Consequences

- **Positive:** Hot provider switching without restart, continuous health diagnostics, persistent configuration.
- **Negative:** Requires background periodic health polling.
- **Affected Modules:** `@repo-intel/ai`, `services/api`, `apps/cli`, `apps/web`.

---

### ADR-043: Pull Request Review Architecture & Workflow Engine Integration

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

The platform requires automated Pull Request code review capabilities orchestrating `DeveloperContext`, `GraphRAG`,
`AgentOrchestrator`, and `PatchPlanner` without automatic code mutation.

#### Options Considered

1. **Monolithic Review Runner:** Combines PR diff fetching, review execution, and comment publishing in single API
   handler.
2. **Decoupled PR Workflow Architecture (`PullRequest` Domain Model & Workflow Engine):**
    - Defines provider-agnostic `PullRequest` domain abstractions.
    - Orchestrates multi-agent review and report generation via `WorkflowEngine`.
    - Leaves patch generation optional requiring explicit user approval.

#### Why This Option Was Chosen

Provider-agnostic domain models ensure the review engine can seamlessly support GitHub, GitLab, Azure DevOps, and
Bitbucket without redesign.

#### Consequences

- **Positive:** Reusable across Git host providers, zero automatic code mutation risk, transparent execution stages.
- **Negative:** Requires serializing intermediate review findings.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/review-engine`, `services/api`.

---

### ADR-044: Multi-Format Review Report Generation (Markdown, HTML, JSON, SARIF)

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Code review findings must be exported into standardized report formats for human readability (Markdown, HTML),
programmatic consumption (JSON), and CI security tool integration (SARIF).

#### Options Considered

1. **Markdown Only Output:** Limits integration with CI security scanners like GitHub CodeQL.
2. **Multi-Format Report Generator (`ReviewReportGenerator`):**
    - Supports Markdown, HTML, JSON, and SARIF 2.1.0 specifications out of the box.
    - Maps `ExplainableFinding` objects into SARIF rule definitions and physical locations.

#### Why This Option Was Chosen

SARIF export enables seamless integration with GitHub Code Security, SonarQube, and CI security artifact pipelines.

#### Consequences

- **Positive:** Native SARIF compliance, flexible UI preview and export options.
- **Negative:** Must maintain SARIF 2.1.0 schema compatibility.
- **Affected Modules:** `@repo-intel/review-engine`, `services/api`, `apps/cli`.

---

### ADR-045: Provider-Agnostic GitHub Integration & Previewable Comment Publishing

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

The platform needs to post review summaries and inline comments to GitHub PRs while ensuring publishing is strictly
optional and previewable before execution.

#### Options Considered

1. **Automatic Direct Comment Insertion:** Risk of spamming PR threads with unverified bot comments.
2. **Previewable GitHub Client (`GitHubClient` & `CommentPublisher`):**
    - Supports personal access tokens and mock preview modes.
    - Exposes preview capabilities before posting summary Markdown or line-specific comments.

#### Why This Option Was Chosen

Requiring explicit user confirmation before posting prevents unintended GitHub PR comment noise.

#### Consequences

- **Positive:** Zero risk of unintended comment spam, clean preview UI support.
- **Negative:** Requires an extra approval step before posting comments.
- **Affected Modules:** `@repo-intel/review-engine`, `services/api`, `apps/web`.

---

### ADR-046: Repository Memory Architecture & Persistent Store

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Code reviews should become context-aware across time rather than treating every review session independently. A
persistent repository memory store is required to record completed reviews, findings, user feedback, accepted/rejected
patches, and notes.

#### Options Considered

1. **In-Memory Session Storage:** Forgets findings history, feedback, and patch acceptance metrics upon application
   restart.
2. **Persistent Repository Memory (`RepositoryMemoryStore`):**
    - Persists state locally to `.repo-intel-memory.json`.
    - Tracks review history, accepted/rejected patch records, code hotspots, and user notes across restarts.

#### Why This Option Was Chosen

Local JSON file storage provides fast, zero-dependency persistence that survives application restarts.

#### Consequences

- **Positive:** Persistent state across restarts, zero external DB setup needed for local usage.
- **Negative:** File write concurrency must be handled gracefully.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/review-engine`.

---

### ADR-047: Adaptive Review Context & Feedback Loop

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Before running a review, the system should load past findings, unresolved issues, accepted fixes, and user feedback
(Useful, Incorrect, Ignored, False Positive) to adapt future prompt context and re-rank findings.

#### Options Considered

1. **Static Review Prompts:** Repeats identical findings and potential false positives regardless of past user feedback.
2. **Adaptive Context Engine (`AdaptiveContextEngine`):**
    - Automatically injects historical memory, unstable hotspots, user feedback constraints, and architectural decisions
      into GraphRAG retrieval bundles and review prompts.

#### Why This Option Was Chosen

Adaptive context injection prevents repetitive false positives and aligns AI code reviews with team feedback over time.

#### Consequences

- **Positive:** Progressively improves review quality, reduces false positives, enforces team architectural standards.
- **Negative:** Consumes a small portion of prompt context tokens.
- **Affected Modules:** `@repo-intel/review-engine`, `@repo-intel/retrieval`.

---

### ADR-048: Repository Intelligence & Trend Analytics Engine

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Engineering leads and team members need visibility into repository health trends over time, such as findings per review,
patch acceptance rates, false positive rates, severity breakdowns, and code hotspots.

#### Options Considered

1. **Uncalculated Ad-Hoc Logs:** Requires manually sifting through raw session logs.
2. **Trend Analytics Engine (`TrendAnalyticsEngine`):**
    - Computes repository intelligence metrics, hotspot scores, and trend breakdowns.
    - Exposes REST API endpoints and interactive Web UI dashboard visualizers.

#### Why This Option Was Chosen

Automated trend metrics provide actionable repository health visibility for engineering managers and team leads.

#### Consequences

- **Positive:** Real-time visibility into repository health trends and hotspots.
- **Negative:** Requires accumulating feedback and session events over time.
- **Affected Modules:** `@repo-intel/review-engine`, `services/api`, `apps/web`.

---

### ADR-049: Extension SDK & Plugin Architecture

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

The platform requires third-party extensibility for custom review agents, language parsers, static analysis
integrations, report exporters, AI providers, workflow hooks, and UI widgets without modifying core platform code.

#### Options Considered

1. **Core Source Edits:** Forces users to fork and modify core monorepo packages.
2. **Extension SDK & Plugin Framework (`BaseExtension` Contracts):**
    - Defines strict interfaces for `ReviewAgentExtension`, `LanguageExtension`, `ExporterExtension`,
      `WorkflowExtension`, `AIProviderExtension`, and `UIExtension`.

#### Why This Option Was Chosen

Contract-based SDK interfaces allow third-party developers to extend every layer of the platform cleanly.

#### Consequences

- **Positive:** Zero core code modifications required for customization, modular plugin ecosystem.
- **Negative:** Must maintain SDK interface backwards compatibility.
- **Affected Modules:** `@repo-intel/shared`, `@repo-intel/review-engine`.

---

### ADR-050: Plugin Lifecycle & Failure Isolation

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Third-party plugin failures or runtime exceptions must be isolated to prevent crashing the core review engine or runtime
environment.

#### Options Considered

1. **Uncaught Direct Execution:** Unhandled plugin errors crash the core API process.
2. **Isolated Plugin Runner (`ExtensionManager` & Fail-Safe Wrappers):**
    - Wraps plugin calls in try/catch boundaries with isolated logging.
    - Disables misbehaving plugins automatically without interrupting core pipelines.

#### Why This Option Was Chosen

Failure isolation ensures enterprise uptime guarantees regardless of third-party plugin quality.

#### Consequences

- **Positive:** Platform resilience, zero crash risk from external plugins.
- **Negative:** Plugin failures must be surfaced via log inspector.
- **Affected Modules:** `@repo-intel/review-engine`.

---

### ADR-051: Workflow Hook Event Bus Framework

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Plugins need to observe or augment core execution stages (e.g. before/after indexing, review, patch generation, report
generation) transparently.

#### Options Considered

1. **Hardcoded Middleware Interceptors:** Rigorous setup for each stage.
2. **Workflow Hook Event Bus (`WorkflowHookBus`):**
    - Emits lifecycle hook events (`beforeReview`, `afterReview`, etc.) allowing extensions to inspect or modify
      payloads sequentially.

#### Why This Option Was Chosen

An event bus decouples extensions from pipeline internals while enabling powerful workflow automation.

#### Consequences

- **Positive:** Flexible event-driven extensibility.
- **Negative:** Asynchronous hook chains add slight latency to review pipelines.
- **Affected Modules:** `@repo-intel/review-engine`.

---

### ADR-052: Enterprise Authentication & Identity Architecture

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Team and enterprise deployments require extensible authentication supporting Local accounts, OAuth 2.0, and OpenID
Connect (GitHub, Google, Entra ID, Okta).

#### Options Considered

1. **Hardcoded Local Passwords Only:** Limits enterprise adoption.
2. **Extensible Auth Abstraction (`AuthManager` & OAuth2/OIDC Adapters):**
    - Supports local token authentication alongside OAuth2/OIDC identity providers.

#### Why This Option Was Chosen

Abstracted auth provider interfaces enable smooth integration with enterprise identity providers.

#### Consequences

- **Positive:** Enterprise SSO readiness, flexible auth options.
- **Negative:** Session state management required across providers.
- **Affected Modules:** `services/api`.

---

### ADR-053: Role-Based Access Control (RBAC) & Permission Boundaries

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

To ensure operational security in team environments, permissions must be governed by granular roles (Administrator,
Maintainer, Reviewer, Developer, Read-Only).

#### Options Considered

1. **Unrestricted Admin Access for All Users:** High security risk in enterprise settings.
2. **RBAC Manager (`RBACManager`):**
    - Enforces permission checks (`repo:read`, `review:execute`, `provider:configure`, `admin:manage`) per route and
      command.

#### Why This Option Was Chosen

Strict RBAC boundaries prevent unauthorized configuration changes and secure sensitive credentials.

#### Consequences

- **Positive:** Granular security enforcement.
- **Negative:** API requests must pass role authorization headers.
- **Affected Modules:** `services/api`, `apps/cli`.

---

### ADR-054: Enterprise Operations, Encryption & Telemetry Metrics

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Operations teams need Prometheus-compatible telemetry metrics and AES-256-GCM secret encryption at rest.

#### Options Considered

1. **Unencrypted Plaintext Secret Storage:** Insecure.
2. **Encrypted Secrets & Telemetry Engine (`SecretsManager` & `MetricsCollector`):**
    - AES-256-CBC/GCM encryption at rest.
    - Prometheus text format metrics endpoint (`/api/v1/metrics`).

#### Why This Option Was Chosen

Meets enterprise security and observability standards out of the box.

#### Consequences

- **Positive:** Industry-standard secret security and Prometheus monitoring.
- **Negative:** Secret key seed must be backed up securely.
- **Affected Modules:** `services/api`.

---

### ADR-055: Production Operations Architecture & Diagnostics

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Production deployments require real-time diagnostics, performance profiling, readiness/liveness checks, and operational
dashboards.

#### Options Considered

1. **Ad-Hoc Logs Only:** High diagnostic complexity during outages.
2. **Operations & Diagnostics Suite (`HealthDiagnostics` & `PerformanceProfiler`):**
    - Microsecond execution timing, bottleneck identification, and health readiness/liveness APIs.

#### Why This Option Was Chosen

Provides real-time operational visibility into system state and performance bottlenecks.

#### Consequences

- **Positive:** Deep observability, fast troubleshooting during production incidents.
- **Negative:** Telemetry recording adds minimal CPU overhead.
- **Affected Modules:** `services/api`, `apps/cli`, `apps/web`.

---

### ADR-056: Resilience & Circuit Breaker Fault Tolerance

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Downstream AI providers, GitHub APIs, and external services can experience outages or latency spikes. The system must
degrade gracefully without crashing core workflows.

#### Options Considered

1. **Unprotected Asynchronous Calls:** Provider failures crash review pipelines.
2. **Circuit Breaker Pattern (`ResilienceCircuitBreaker`):**
    - Automatically trips to OPEN state after consecutive failures and executes fallback handlers.

#### Why This Option Was Chosen

Guarantees system resilience and uptime during external API degradation.

#### Consequences

- **Positive:** System stability during external service outages.
- **Negative:** Fallback responses may have lower fidelity.
- **Affected Modules:** `services/api`, `@repo-intel/ai`.

---

### ADR-057: Job Scheduler & Queue Abstraction

- **Status:** Accepted
- **Date:** 2026-07-28

#### Context

Recurring repository indexing, scheduled reviews, and cleanup require a production-ready background scheduler and
priority-based job queue abstraction.

#### Options Considered

1. **Ad-Hoc Inline Execution:** Blocks HTTP request handlers during heavy indexing tasks.
2. **Distributed Queue & Scheduler (`JobScheduler` & `DistributedJobQueue`):**
    - Decouples heavy tasks into prioritized background workers with retry policies and dead-letter queues.

#### Why This Option Was Chosen

Decouples long-running repository analysis tasks from HTTP gateway handlers.

#### Consequences

- **Positive:** Responsive HTTP gateway, reliable background task execution.
- **Negative:** Queue state must be tracked across restarts.
- **Affected Modules:** `services/api`.

---

## Decision Rules & Governance

A new Architecture Decision Record (**ADR**) **MUST** be created whenever:

1. A new primary framework or core library is introduced to the monorepo.
2. A database, storage engine, or indexing technology selection is made.
3. A core architectural layer or boundary rule is modified.
4. A security model, authentication protocol, or air-gap specification changes.
5. An AI model provider protocol or PAL interface contract is altered.
6. A breaking API change or deployment strategy shift occurs.

_Minor refactorings, internal utility function additions, and routine bug fixes do NOT warrant an ADR._
