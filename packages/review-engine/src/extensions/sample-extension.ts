import type {
  ReviewAgentExtension,
  ExtensionMetadata,
  ExplainableFinding,
} from '@repo-intel/shared';

export class SampleSecurityReviewAgentExtension implements ReviewAgentExtension {
  public readonly metadata: ExtensionMetadata = {
    id: 'org.example.custom-security-agent',
    name: 'Sample Third-Party Security Agent',
    version: '1.0.0',
    author: 'SecurityTeam',
    description: 'Custom extension detecting hardcoded credentials and token leaks.',
    category: 'review-agent',
    minPlatformVersion: '0.6.0',
    capabilities: ['security-audit', 'credential-leak-detection'],
  };

  public isEnabled = true;

  public async initialize(): Promise<void> {
    // Setup resources
  }

  public async dispose(): Promise<void> {
    // Cleanup resources
  }

  public async runAnalysis(filePath: string, sourceCode: string): Promise<ExplainableFinding[]> {
    const findings: ExplainableFinding[] = [];

    if (sourceCode.includes('AWS_SECRET_KEY') || sourceCode.includes('api_secret_key')) {
      findings.push({
        findingId: `ext-find-${Date.now()}`,
        agentId: this.metadata.id,
        category: 'security',
        severity: 'CRITICAL',
        confidenceScore: 0.99,
        filePath,
        lineRange: { startLine: 1, endLine: 10 },
        explanation: {
          whatIsWrong: 'Hardcoded secret API key detected.',
          whyItMatters: 'Presents critical credential exposure vulnerability.',
          impactedComponents: [filePath],
        },
        evidenceChain: [],
        suggestedFix: {
          description: 'Move hardcoded secrets to environment variables.',
        },
      });
    }

    return findings;
  }
}
