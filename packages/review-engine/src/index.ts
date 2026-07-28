/**
 * Multi-Agent Review Engine & Git Intelligence Entry Point
 */

export * from './agents/agent.interface.js';
export * from './agents/base-agent.js';
export * from './agents/specialized-agents.js';
export * from './orchestrator/agent-orchestrator.js';
export * from './git/local-git-provider.js';
export * from './git/diff-engine.js';
export * from './context/developer-context-engine.js';
export * from './prompts/prompt-context-builder.js';
export * from './session/review-session-store.js';
export * from './incremental/incremental-review-engine.js';
export * from './github/github-client.js';
export * from './reports/report-generator.js';
export * from './memory/repository-memory-store.js';
export * from './memory/adaptive-context-engine.js';
export * from './memory/trend-analytics-engine.js';
export * from './extensions/extension-manager.js';
export * from './extensions/workflow-hook-bus.js';
export * from './extensions/exporter-registry.js';
export * from './extensions/sample-extension.js';
export * from './aggregator/finding-deduplicator.js';
export * from './aggregator/finding-aggregator.js';
export * from './risk/risk-calculator.js';
