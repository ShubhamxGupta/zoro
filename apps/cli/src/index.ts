#!/usr/bin/env node

import { DefaultPlatformRuntime } from '@repo-intel/api/dist/runtime/platform-runtime.js';

async function runCLI(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] ?? 'help';

  const runtime = new DefaultPlatformRuntime();
  await runtime.initialize();

  try {
    switch (command) {
      case 'scan': {
        const repoPath = args[1] ?? '.';
        console.log(`🔍 Scanning repository at: ${repoPath}...`);
        const res = await runtime.execute<{ indexedFiles: number; durationMs: number }>(
          'indexRepository',
          { repoPath },
        );
        console.log(`✅ Indexed ${res.indexedFiles} files in ${res.durationMs}ms.`);
        break;
      }

      case 'review': {
        console.log('🤖 Running AI Code Review...');
        const diff = await runtime.repositoryService.getDiff('HEAD~1', 'HEAD');
        const res = await runtime.reviewService.runReview(diff);
        console.log(`✅ Review Session ID: ${res.session.id}`);
        console.log(`🔍 Findings Count: ${res.findings.length}`);
        for (const f of res.findings) {
          console.log(`   - [${f.severity}] ${f.category}: ${f.explanation.whatIsWrong}`);
        }
        break;
      }

      case 'chat': {
        const question = args.slice(1).join(' ') || 'Explain repository architecture';
        console.log(`💬 Querying GraphRAG Chat: "${question}"...`);
        const bundle = await runtime.retrievalService.retrieveContext(question);
        console.log(`💡 Context Summary: ${bundle.summary}`);
        break;
      }

      case 'patch': {
        console.log('🛠️ Generating patch candidate for UserService...');
        const plan = {
          id: 'cli-plan-1',
          title: 'CLI Refactor',
          rationale: 'CLI command trigger',
          estimatedComplexity: 'low' as const,
          riskScore: 0.1,
          affectedFiles: ['src/user.ts'],
          affectedSymbols: ['UserService' as any],
          dependencyImpacts: [],
          createdAt: new Date().toISOString(),
        };
        const devContext = {
          diff: {
            rawDiff: '',
            changedFiles: ['src/user.ts'],
            changedSymbols: ['UserService' as any],
            addedMethods: [],
            removedMethods: [],
            renamedSymbols: [],
            movedFiles: [],
          },
          changedSymbols: ['UserService' as any],
          impactedSymbols: [],
          dependencies: [],
          affectedArchitecture: [],
          historicalContext: [],
          relatedDocumentation: [],
          relatedTests: [],
          retrievalBundle: {} as any,
          generatedAt: new Date().toISOString(),
        };
        const candidate = await runtime.patchService.generatePatch(plan, devContext);
        console.log(`✅ Patch ID: ${candidate.id}`);
        console.log(`📄 Diff Preview:\n${candidate.unifiedDiff}`);
        break;
      }

      case 'graph': {
        console.log('📊 Knowledge Graph Statistics:');
        const stats = await runtime.graphService.getGraphStats();
        console.log(`   - Node Count: ${stats.nodeCount}`);
        console.log(`   - Edge Count: ${stats.edgeCount}`);
        break;
      }

      case 'providers': {
        console.log('🤖 AI Providers Health & Status:');
        const health = await runtime.aiService.checkProviderHealth();
        for (const [provider, status] of Object.entries(health)) {
          console.log(`   - ${provider}: ${status ? '🟢 Available' : '🔴 Unavailable'}`);
        }
        break;
      }

      default:
        console.log(`
Repo Intelligence Platform CLI (repo-intel)

Usage:
  repo-intel scan [path]        Scan & index local repository
  repo-intel review             Run AI Code Review
  repo-intel chat <question>    GraphRAG repository chat
  repo-intel patch              Generate AI patch preview
  repo-intel graph              View knowledge graph stats
  repo-intel providers          Check AI provider health
`);
    }
  } finally {
    await runtime.shutdown();
  }
}

runCLI().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
