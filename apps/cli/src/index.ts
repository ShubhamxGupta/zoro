#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { DefaultPlatformRuntime } from '@repo-intel/api/dist/runtime/platform-runtime.js';

interface ParsedFlags {
  staged: boolean;
  provider?: string;
  format: 'text' | 'json' | 'table';
  output?: string;
}

function parseFlags(args: string[]): { command: string; positional: string[]; flags: ParsedFlags } {
  const command = args[0] ?? 'help';
  const positional: string[] = [];
  const flags: ParsedFlags = {
    staged: false,
    format: 'text',
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--staged') {
      flags.staged = true;
    } else if (arg.startsWith('--provider=')) {
      flags.provider = arg.split('=')[1];
    } else if (arg === '--provider' && i + 1 < args.length) {
      flags.provider = args[++i];
    } else if (arg.startsWith('--format=')) {
      flags.format = arg.split('=')[1] as any;
    } else if (arg === '--format' && i + 1 < args.length) {
      flags.format = args[++i] as any;
    } else if (arg.startsWith('--output=')) {
      flags.output = arg.split('=')[1];
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  return { command, positional, flags };
}

async function runCLI(): Promise<void> {
  const { command, positional, flags } = parseFlags(process.argv.slice(2));

  const runtime = new DefaultPlatformRuntime();
  await runtime.initialize();

  try {
    switch (command) {
      case 'init': {
        const configPath = path.resolve(process.cwd(), '.repo-intel.json');
        const defaultConfig = {
          $schema: 'https://repo-intel.dev/schema/config.json',
          name: path.basename(process.cwd()),
          version: '0.6.0',
          aiProviderPreference: flags.provider ? [flags.provider, 'ollama', 'openai'] : ['ollama', 'openai', 'claude'],
          logLevel: 'info',
          maxParallelJobs: 5,
          ignorePaths: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.next/**'],
          createdAt: new Date().toISOString(),
        };

        await fs.promises.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf-8');
        console.log('✅ Initialized Repository Intelligence configuration file at:');
        console.log(`   📄 ${configPath}`);
        break;
      }

      case 'scan': {
        const repoPath = positional[0] ?? '.';
        console.log(`🔍 Scanning repository at: ${path.resolve(repoPath)}...`);
        const res = await runtime.execute<{ indexedFiles: number; durationMs: number }>(
          'indexRepository',
          { repoPath },
        );
        console.log(`✅ Indexed ${res.indexedFiles} files in ${res.durationMs}ms.`);
        break;
      }

      case 'review': {
        console.log(`🤖 Running AI Code Review Pipeline (Staged: ${flags.staged ? 'YES' : 'NO'}, Provider: ${flags.provider || 'Auto'})...`);
        const diff = await runtime.repositoryService.getDiff(flags.staged ? 'STAGED' : 'HEAD~1', 'HEAD');
        const res = await runtime.reviewService.runReview(diff);

        if (flags.format === 'json') {
          console.log(JSON.stringify(res, null, 2));
        } else {
          console.log(`\n✅ Review Execution Finished: Session ID [${res.session.id}]`);
          console.log(`📊 Total Findings Detected: ${res.findings.length}\n`);
          console.log('┌──────────┬──────────┬──────────────────────────────────────────────────────────────────────────┐');
          console.log('│ Severity │ Category │ Finding Summary                                                          │');
          console.log('├──────────┼──────────┼──────────────────────────────────────────────────────────────────────────┤');
          for (const f of res.findings) {
            const sev = f.severity.padEnd(8);
            const cat = f.category.padEnd(8);
            const summary = f.explanation.whatIsWrong.substring(0, 72).padEnd(72);
            console.log(`│ ${sev} │ ${cat} │ ${summary} │`);
          }
          console.log('└──────────┴──────────┴──────────────────────────────────────────────────────────────────────────┘');
        }
        break;
      }

      case 'chat': {
        const question = positional.join(' ') || 'Explain repository architecture and data flow';
        console.log(`💬 Querying GraphRAG Context Engine: "${question}"...`);
        const bundle = await runtime.retrievalService.retrieveContext(question);

        if (flags.format === 'json') {
          console.log(JSON.stringify(bundle, null, 2));
        } else {
          console.log(`\n💡 Context Summary:\n${bundle.summary}`);
          console.log(`\n📂 Related Files (${bundle.files.length}):`);
          bundle.files.forEach((file) => console.log(`   - ${file}`));
        }
        break;
      }

      case 'patch': {
        const targetSymbol = positional[0] ?? 'UserService';
        console.log(`🛠️ Generating AST Refactoring Patch Candidate for [${targetSymbol}]...`);

        const plan = {
          id: `cli-plan-${Date.now()}`,
          title: `CLI Refactor ${targetSymbol}`,
          rationale: 'CLI command trigger',
          estimatedComplexity: 'low' as const,
          riskScore: 0.1,
          affectedFiles: ['src/user.ts'],
          affectedSymbols: [targetSymbol as any],
          dependencyImpacts: [],
          createdAt: new Date().toISOString(),
        };

        const devContext = {
          diff: {
            rawDiff: '',
            changedFiles: ['src/user.ts'],
            changedSymbols: [targetSymbol as any],
            addedMethods: [],
            removedMethods: [],
            renamedSymbols: [],
            movedFiles: [],
          },
          changedSymbols: [targetSymbol as any],
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

        if (flags.format === 'json') {
          console.log(JSON.stringify(candidate, null, 2));
        } else {
          console.log(`\n✅ Generated Patch Candidate ID: ${candidate.id}`);
          console.log(`🎯 Confidence Score: ${(candidate.confidence * 100).toFixed(0)}%`);
          console.log(`📄 Unified Diff Preview:\n${candidate.unifiedDiff}`);
        }
        break;
      }

      case 'graph': {
        console.log('📊 Knowledge Graph KùzuDB Statistics:');
        const stats = await runtime.graphService.getGraphStats();
        console.log(`   - Node Count (AST Symbols & Files): ${stats.nodeCount}`);
        console.log(`   - Edge Count (Call Graph & Imports): ${stats.edgeCount}`);
        break;
      }

      case 'providers': {
        const subCommand = positional[0] ?? 'list';
        const { ProviderManager } = await import('@repo-intel/ai');
        const manager = new ProviderManager();
        await manager.initializeAll();

        switch (subCommand) {
          case 'list': {
            console.log('🤖 Installed AI Provider Plugins:');
            const models = manager.getAllModels();
            for (const item of models) {
              const active = manager.getActivePlugin().name === item.provider ? ' (Active)' : '';
              console.log(
                `   - ${item.provider.toUpperCase()}${active}: ${item.models.join(', ')}`,
              );
            }
            break;
          }

          case 'health': {
            console.log('🩺 Provider Health Check Report:');
            const healthList = await manager.checkAllHealth();
            for (const h of healthList) {
              const statusPill = h.isAvailable ? '🟢 Online' : '🔴 Offline';
              console.log(
                `   - ${h.provider.toUpperCase()}: ${statusPill} (${h.latencyMs}ms latency)`,
              );
            }
            break;
          }

          case 'switch': {
            const target = positional[1] ?? 'ollama';
            const model = positional[2];
            const ok = await manager.switchProvider(target, model);
            if (ok) {
              console.log(
                `✅ Switched active provider to ${manager.getActivePlugin().name} (${manager.getActiveModel()}).`,
              );
            } else {
              console.log(`❌ Failed to switch to provider "${target}".`);
            }
            break;
          }

          default: {
            console.log('🤖 AI Providers Health & Status:');
            const healthList = await manager.checkAllHealth();
            for (const h of healthList) {
              console.log(
                `   - ${h.provider}: ${h.isAvailable ? '🟢 Available' : '🔴 Unavailable'}`,
              );
            }
          }
        }
        break;
      }

      default:
        console.log(`
Repo Intelligence Platform CLI (repo-intel v0.6.0)

Usage:
  repo-intel init               Initialize local .repo-intel.json configuration
  repo-intel scan [path]        Scan & index local repository into Knowledge Graph
  repo-intel review [--staged]  Run AI Multi-Agent Code Review
  repo-intel chat <question>    Query GraphRAG repository assistant
  repo-intel patch [symbol]     Generate AI AST refactoring patch diff
  repo-intel graph              View knowledge graph node & edge statistics
  repo-intel providers          Check & switch AI model providers (ollama/openai/claude)
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
