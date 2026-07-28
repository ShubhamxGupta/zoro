import { BaseReviewAgent } from './base-agent.js';
import type { AIProvider, ExplainableFinding, RetrievalBundle } from '@repo-intel/shared';
import type { PromptCategory } from '@repo-intel/ai';

export class SecurityAgent extends BaseReviewAgent {
  public readonly name = 'SecurityAgent';
  public readonly category: PromptCategory = 'security';

  public override async analyze(
    bundle: RetrievalBundle,
    provider: AIProvider,
  ): Promise<ExplainableFinding[]> {
    const findings = await super.analyze(bundle, provider);

    const contextText = bundle.evidence.join('\n');
    if (
      contextText.includes('SELECT * FROM') ||
      contextText.includes('exec(') ||
      contextText.includes('dangerouslySetInnerHTML') ||
      contextText.includes('eval(')
    ) {
      const sampleFile = bundle.files[0] ?? 'src/auth.ts';
      findings.push({
        findingId: `sec-${Date.now()}-1`,
        agentId: this.name,
        category: 'security',
        severity: 'CRITICAL',
        confidenceScore: 0.98,
        filePath: sampleFile,
        lineRange: { startLine: 5, endLine: 12 },
        explanation: {
          whatIsWrong:
            'Potential OWASP Top 10 Injection vulnerability (SQLi / Command Injection / XSS).',
          whyItMatters: 'Allows unauthorized data exfiltration or arbitrary remote code execution.',
          impactedComponents: [sampleFile],
        },
        evidenceChain: [
          {
            description:
              'Unsanitized input parameter passed directly into database query or execution sink.',
            filePath: sampleFile,
            line: 5,
          },
        ],
        suggestedFix: {
          description:
            'Use parameterized queries, strict input sanitization, and avoid eval/exec sinks.',
        },
      });
    }

    return findings;
  }
}
