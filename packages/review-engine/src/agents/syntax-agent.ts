import { BaseReviewAgent } from './base-agent.js';
import type { AIProvider, ExplainableFinding, RetrievalBundle } from '@repo-intel/shared';
import type { PromptCategory } from '@repo-intel/ai';

export class SyntaxAgent extends BaseReviewAgent {
  public readonly name = 'SyntaxAgent';
  public readonly category: PromptCategory = 'code_quality';

  public override async analyze(
    bundle: RetrievalBundle,
    provider: AIProvider,
  ): Promise<ExplainableFinding[]> {
    const findings = await super.analyze(bundle, provider);

    const contextText = bundle.evidence.join('\n');
    if (contextText.includes('var ') || contextText.includes('debugger')) {
      const sampleFile = bundle.files[0] ?? 'src/index.ts';
      findings.push({
        findingId: `syntax-${Date.now()}-1`,
        agentId: this.name,
        category: 'syntax',
        severity: 'LOW',
        confidenceScore: 0.95,
        filePath: sampleFile,
        lineRange: { startLine: 1, endLine: 5 },
        explanation: {
          whatIsWrong: 'Deprecated var keyword or leftover debugger statement detected.',
          whyItMatters: 'Violates modern TypeScript/JavaScript syntax standards.',
          impactedComponents: [sampleFile],
        },
        evidenceChain: [],
        suggestedFix: {
          description: 'Replace var with let/const and remove debugger statement.',
        },
      });
    }

    return findings;
  }
}
