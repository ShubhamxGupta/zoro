# Known Issues & Edge Cases

1. **Ollama Initial Cold Start:** The first request to Ollama may experience a 1-2 second latency while the LLM model
   weights are loaded into GPU/VRAM memory.
2. **Very Large Repositories:** Repositories exceeding 50,000 files will benefit from increasing Node.js max heap
   allocation (`--max-old-space-size=8192`).
