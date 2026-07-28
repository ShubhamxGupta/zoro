import { BaseReviewAgent } from './base-agent.js';
import type { AIProvider, ExplainableFinding, RetrievalBundle } from '@repo-intel/shared';
import type { PromptCategory } from '@repo-intel/ai';

export class ArchitectureAgent extends BaseReviewAgent {
  public readonly name = 'ArchitectureAgent';
  public readonly category: PromptCategory = 'architecture';

  public override async analyze(
    bundle: RetrievalBundle,
    provider: AIProvider,
  ): Promise<ExplainableFinding[]> {
    const findings = await super.analyze(bundle, provider);

    const contextText = bundle.evidence.join('\n');
    if (
      contextText.includes('import {') && contextText.includes('from \'../../') ||
      contextText.includes('circular')
    ) {
      const sampleFile = bundle.files[0] ?? 'src/arch.ts';
      findings.push({
        findingId: `arch-${Date.now()}-1`,
        agentId: this.name,
        category: 'architecture',
        severity: 'MEDIUM',
        confidenceScore: 0.9,
        filePath: sampleFile,
        lineRange: { startLine: 1, endLine: 5 },
        explanation: {
          whatIsWrong: 'Potential architectural layer violation or tight coupling across modules.',
          whyItMatters: 'Breaks modular boundary separation and increases regression risk during refactoring.',
          impactedComponents: [sampleFile],
        },
        evidenceChain: [
          {
            description: 'Deep relative import bypassing layer interface boundary.',
            filePath: sampleFile,
            line: 1,
          },
        ],
        suggestedFix: {
          description: 'Invert dependency using public package interface contract.',
        },
      });
    }

    return findings;
  }
}
