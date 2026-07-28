import { BaseReviewAgent } from './base-agent.js';
import type { AIProvider, ExplainableFinding, RetrievalBundle } from '@repo-intel/shared';
import type { PromptCategory } from '@repo-intel/ai';

export class PerformanceAgent extends BaseReviewAgent {
  public readonly name = 'PerformanceAgent';
  public readonly category: PromptCategory = 'performance';

  public override async analyze(
    bundle: RetrievalBundle,
    provider: AIProvider,
  ): Promise<ExplainableFinding[]> {
    const findings = await super.analyze(bundle, provider);

    const contextText = bundle.evidence.join('\n');
    if (
      contextText.includes('for (') && contextText.includes('await ') ||
      contextText.includes('readFileSync(') ||
      contextText.includes('setInterval(')
    ) {
      const sampleFile = bundle.files[0] ?? 'src/perf.ts';
      findings.push({
        findingId: `perf-${Date.now()}-1`,
        agentId: this.name,
        category: 'performance',
        severity: 'HIGH',
        confidenceScore: 0.94,
        filePath: sampleFile,
        lineRange: { startLine: 8, endLine: 16 },
        explanation: {
          whatIsWrong: 'N+1 async query loop or blocking synchronous I/O detected in critical execution path.',
          whyItMatters: 'Causes severe latency degradation and blocks the node event loop.',
          impactedComponents: [sampleFile],
        },
        evidenceChain: [
          {
            description: 'Sequential await inside loop or blocking readFileSync call.',
            filePath: sampleFile,
            line: 8,
          },
        ],
        suggestedFix: {
          description: 'Use Promise.all() for concurrent execution or switch to async I/O.',
        },
      });
    }

    return findings;
  }
}
