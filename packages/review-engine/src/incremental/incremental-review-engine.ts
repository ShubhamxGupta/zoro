import type {
  AIProvider,
  ExplainableFinding,
  GitDiff,
  RetrievalPipeline,
} from '@repo-intel/shared';
import { AgentOrchestrator } from '../orchestrator/agent-orchestrator.js';
import { DeveloperContextEngine } from '../context/developer-context-engine.js';
import { DiffEngine } from '../git/diff-engine.js';

export class IncrementalReviewEngine {
  private readonly diffEngine: DiffEngine;
  private readonly devContextEngine: DeveloperContextEngine;
  private readonly orchestrator: AgentOrchestrator;

  constructor(private readonly retrievalPipeline: RetrievalPipeline) {
    this.diffEngine = new DiffEngine();
    this.devContextEngine = new DeveloperContextEngine();
    this.orchestrator = new AgentOrchestrator();
  }

  public async reviewIncremental(
    gitDiff: GitDiff,
    provider: AIProvider,
  ): Promise<{ findings: ExplainableFinding[]; changedFilesCount: number; durationMs: number }> {
    const start = Date.now();
    const structuredDiff = this.diffEngine.parse(gitDiff.rawDiff);

    // Scoped retrieval query for changed symbols/files only
    const queryText = `Incremental review for changed files: ${structuredDiff.changedFiles.join(', ')} and symbols: ${structuredDiff.addedMethods.join(', ')}`;

    const bundle = await this.retrievalPipeline.retrieve({
      text: queryText,
      maxTokens: 1500, // Scoped token budget
    });

    const devContext = this.devContextEngine.createContext(gitDiff, bundle);

    const { findings } = await this.orchestrator.executeReview(
      devContext.retrievalBundle,
      provider,
      {
        timeoutMs: 5000,
      },
    );

    return {
      findings,
      changedFilesCount: structuredDiff.changedFiles.length,
      durationMs: Date.now() - start,
    };
  }
}
