# Repo Intelligence Platform — User Guide

Welcome to the **Repo Intelligence Platform** (`v0.1.0-beta`) User Guide!

---

## 🚀 Getting Started

### 1. Opening a Repository & Running the Setup Wizard

Upon opening the Web UI (`http://localhost:3001`), navigate to **Setup Wizard** in the sidebar. The wizard will automatically detect:

- Local **Git** installation
- **Ollama** AI runner status (`http://localhost:11434`)
- Installed local models (`llama3`, `qwen`, `mistral`, `deepseek`, `codellama`, `phi`)

Select your local target repository path (e.g. `.`) and click **Finish & Index** to run initial AST symbol extraction and Knowledge Graph construction.

---

## 🔍 Running AI Code Reviews

1. Navigate to **Review & Findings** in the sidebar.
2. Click **Start Review**.
3. The platform will:
   - Extract raw Git diffs.
   - Execute GraphRAG context retrieval.
   - Run 6 specialized AI review agents in parallel (Architecture, Security, Performance, Bug Detection, Quality, Documentation).
4. Explore findings in the **Findings Explorer** below with filter options for category and severity.

---

## 🛠️ Simulating AST Patches

1. Navigate to **Patch Preview** in the sidebar.
2. View the generated unified diff, rationale, confidence score, and risk breakdown.
3. Click **Accept Patch** to apply changes or **Reject** to discard.

---

## 💬 GraphRAG Repository Chat

1. Navigate to **GraphRAG Chat** in the sidebar.
2. Type any repository question (e.g., _"Explain UserService null pointer safety"_).
3. The engine performs multi-hop graph expansion + vector retrieval and streams tokens back to the chat feed.
