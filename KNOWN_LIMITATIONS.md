# Known Limitations (`v0.1.0-beta`)

1. **Local Model Hardware Requirements:** Local LLM inference via Ollama requires an 8GB+ GPU or Apple Silicon unified
   memory for sub-second response times.
2. **Context Token Window Pruning:** Context payloads for GraphRAG are pruned at 2,000 tokens per prompt budget.
3. **AST Parser Language Support:** Native Tree-sitter parsers are active for TypeScript, Python, Go, and Java.
