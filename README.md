# Repo Intelligence Platform (`v0.1.0-beta`)

> Enterprise-Grade, Graph-Aware, Multi-Agent AI Code Review & Repository Intelligence Platform.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#) [![Tests](https://img.shields.io/badge/tests-240%2F240%20passing-brightgreen)](#) [![License](https://img.shields.io/badge/license-MIT-blue)](#) [![Version](https://img.shields.io/badge/version-v0.1.0--beta-orange)](#)

---

## 🌟 Features

- **100% Local & Privacy-First:** Native support for local air-gapped runners via **Ollama** (`llama3`, `qwen`, `mistral`, `deepseek`, `codellama`, `phi`) with cloud **OpenAI** fallback.
- **Knowledge Graph Engine:** Construct multi-language symbol dependency graphs using KùzuDB and Tree-sitter.
- **GraphRAG Retrieval:** Multi-hop graph walk context retrieval combined with vector search.
- **Multi-Agent Review Engine:** 6 specialized AI review agents (Architecture, Security, Performance, Bug Detection, Quality, Documentation).
- **Deterministic Patch Generation:** Non-destructive in-memory AST refactoring simulation producing unified diffs and explainable risk scores.
- **Web UI & CLI Interfaces:** Full React/Next.js 14 web dashboard and `repo-intel` CLI tool.

---

## 🚀 Quickstart

### 1. Installation

```bash
# Clone repository
git clone https://github.com/Antigravity/zoro.git
cd zoro

# Install dependencies and build monorepo
pnpm install
npm run build
```

### 2. Start API Gateway & Web UI

```bash
# Start API Gateway (Port 3000)
npm run start --prefix services/api

# Start Web UI Dashboard (Port 3001)
npm run dev --prefix apps/web
```

### 3. CLI Usage (`repo-intel`)

```bash
# Scan and index current directory
node apps/cli/dist/index.js scan .

# Run AI Code Review
node apps/cli/dist/index.js review

# Ask GraphRAG Repository Questions
node apps/cli/dist/index.js chat "Explain repository architecture"

# Check AI Provider Status
node apps/cli/dist/index.js providers
```

---

## 🛠️ Architecture

```mermaid
[Web UI / CLI]
      │
      ▼
[PlatformRuntime] ──► [TypedEventBus]
      │
      ├──► [RepositoryService]
      ├──► [ReviewService] ──► [AgentOrchestrator] (6 Agents)
      ├──► [RetrievalService] ──► [GraphRAGRetrievalEngine]
      └──► [PatchService] ──► [PatchGenerationEngine]
```

---

## 📖 Documentation

- [Installation Guide](file:///d:/Coding/zoro/INSTALL.md)
- [Contributing Guidelines](file:///d:/Coding/zoro/CONTRIBUTING.md)
- [Changelog](file:///d:/Coding/zoro/CHANGELOG.md)
- [Known Limitations](file:///d:/Coding/zoro/KNOWN_LIMITATIONS.md)
- [Project Roadmap](file:///d:/Coding/zoro/ROADMAP.md)
