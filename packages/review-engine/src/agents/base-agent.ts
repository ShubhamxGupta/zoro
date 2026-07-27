import type {
  AIProvider,
  ExplainableFinding,
  FindingCategory,
  FindingSeverity,
  RetrievalBundle,
} from '@repo-intel/shared';
import { PromptTemplateManager } from '@repo-intel/ai';
import type { PromptCategory } from '@repo-intel/ai';
import type { ReviewAgent } from './agent.interface.js';

export abstract class BaseReviewAgent implements ReviewAgent {
  abstract readonly name: string;
  abstract readonly category: PromptCategory;

  constructor(
    protected readonly promptManager: PromptTemplateManager = new PromptTemplateManager(),
  ) {}

  public async analyze(
    bundle: RetrievalBundle,
    provider: AIProvider,
  ): Promise<ExplainableFinding[]> {
    const contextText = bundle.evidence.join('\n');
    const prompt = this.promptManager.render(this.category, { context: contextText });

    try {
      const response = await provider.chat(prompt, { responseFormat: 'json' });
      return this.parseFindings(response.content, bundle);
    } catch {
      return [];
    }
  }

  protected parseFindings(rawContent: string, bundle: RetrievalBundle): ExplainableFinding[] {
    const findings: ExplainableFinding[] = [];
    const sampleFile = bundle.files[0] ?? 'unknown.ts';
    const findingCategory: FindingCategory = this.mapToFindingCategory(this.category);

    try {
      const parsed = JSON.parse(rawContent);
      const items = Array.isArray(parsed) ? parsed : (parsed.findings ?? []);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const line = typeof item.line === 'number' ? item.line : 1;

        findings.push({
          findingId: `finding::${this.name}::${i + 1}`,
          agentId: this.name,
          category: findingCategory,
          severity: this.mapSeverity(item.severity),
          confidenceScore: typeof item.confidence === 'number' ? item.confidence : 0.8,
          filePath: item.file ?? sampleFile,
          lineRange: { startLine: line, endLine: line },
          explanation: {
            whatIsWrong: item.title ?? item.description ?? `${this.name} issue detected`,
            whyItMatters: item.explanation ?? 'May impact system reliability or code quality.',
            impactedComponents: [sampleFile],
          },
          evidenceChain: [
            {
              description: item.description ?? 'Detected during AI multi-agent code analysis.',
              filePath: item.file ?? sampleFile,
              line,
            },
          ],
          suggestedFix: item.recommendation ? { description: item.recommendation } : undefined,
        });
      }
    } catch {
      // Fallback finding if JSON parsing fails
      findings.push({
        findingId: `finding::${this.name}::raw-1`,
        agentId: this.name,
        category: findingCategory,
        severity: 'MEDIUM',
        confidenceScore: 0.7,
        filePath: sampleFile,
        lineRange: { startLine: 1, endLine: 1 },
        explanation: {
          whatIsWrong: `${this.name} Review Observation`,
          whyItMatters: rawContent.substring(0, 150),
          impactedComponents: [sampleFile],
        },
        evidenceChain: [
          { description: 'Raw agent output payload.', filePath: sampleFile, line: 1 },
        ],
      });
    }

    return findings;
  }

  private mapSeverity(input?: string): FindingSeverity {
    if (!input) return 'MEDIUM';
    const lower = input.toLowerCase();
    if (lower === 'critical') return 'CRITICAL';
    if (lower === 'high') return 'HIGH';
    if (lower === 'low') return 'LOW';
    return 'MEDIUM';
  }

  private mapToFindingCategory(cat: PromptCategory): FindingCategory {
    switch (cat) {
      case 'architecture':
        return 'architecture';
      case 'bug':
        return 'logic';
      case 'performance':
        return 'performance';
      case 'security':
        return 'security';
      case 'code_quality':
        return 'complexity';
      case 'documentation':
        return 'documentation';
      default:
        return 'logic';
    }
  }
}
