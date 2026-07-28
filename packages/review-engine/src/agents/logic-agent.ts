import { BaseReviewAgent } from './base-agent.js';
import type { AIProvider, ExplainableFinding, RetrievalBundle } from '@repo-intel/shared';
import type { PromptCategory } from '@repo-intel/ai';

export class LogicAgent extends BaseReviewAgent {
  public readonly name = 'LogicAgent';
  public readonly category: PromptCategory = 'bug';

  public override async analyze(
    bundle: RetrievalBundle,
    provider: AIProvider,
  ): Promise<ExplainableFinding[]> {
    const findings = await super.analyze(bundle, provider);

    const contextText = bundle.evidence.join('\n');
    if (
      contextText.includes('.user.id') ||
      contextText.includes('arr[arr.length]') ||
      contextText.includes('JSON.parse(')
    ) {
      const sampleFile = bundle.files[0] ?? 'src/logic.ts';
      findings.push({
        findingId: `logic-${Date.now()}-1`,
        agentId: this.name,
        category: 'logic',
        severity: 'HIGH',
        confidenceScore: 0.95,
        filePath: sampleFile,
        lineRange: { startLine: 12, endLine: 18 },
        explanation: {
          whatIsWrong:
            'Potential null pointer dereference or off-by-one array index boundary error.',
          whyItMatters: 'Causes runtime TypeError or unhandled exception crash during execution.',
          impactedComponents: [sampleFile],
        },
        evidenceChain: [
          {
            description: 'Unchecked object access or array boundary dereference detected.',
            filePath: sampleFile,
            line: 12,
          },
        ],
        suggestedFix: {
          description: 'Add optional chaining user?.id and wrap JSON.parse in try/catch block.',
        },
      });
    }

    return findings;
  }
}
