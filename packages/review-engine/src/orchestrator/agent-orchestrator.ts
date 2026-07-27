import type { AIProvider, ExplainableFinding, RetrievalBundle } from '@repo-intel/shared';
import type { ReviewAgent } from '../agents/agent.interface.js';
import {
  ArchitectureAgent,
  BugDetectionAgent,
  PerformanceAgent,
  SecurityAgent,
  CodeQualityAgent,
  DocumentationAgent,
} from '../agents/specialized-agents.js';

export interface OrchestrationOptions {
  timeoutMs?: number;
  maxRetries?: number;
  fallbackProvider?: AIProvider;
}

export class AgentOrchestrator {
  private readonly agents: ReviewAgent[];

  constructor(customAgents?: ReviewAgent[]) {
    this.agents = customAgents ?? [
      new ArchitectureAgent(),
      new BugDetectionAgent(),
      new PerformanceAgent(),
      new SecurityAgent(),
      new CodeQualityAgent(),
      new DocumentationAgent(),
    ];
  }

  public async executeReview(
    bundle: RetrievalBundle,
    provider: AIProvider,
    options: OrchestrationOptions = {},
  ): Promise<{
    findings: ExplainableFinding[];
    metrics: { durationMs: number; agentCount: number };
  }> {
    const start = Date.now();
    const timeoutMs = options.timeoutMs ?? 10000;
    const maxRetries = options.maxRetries ?? 1;

    const agentPromises = this.agents.map((agent) =>
      this.runAgentWithTimeoutAndRetry(
        agent,
        bundle,
        provider,
        timeoutMs,
        maxRetries,
        options.fallbackProvider,
      ),
    );

    const results = await Promise.all(agentPromises);
    const findings = results.flat();

    return {
      findings,
      metrics: {
        durationMs: Date.now() - start,
        agentCount: this.agents.length,
      },
    };
  }

  private async runAgentWithTimeoutAndRetry(
    agent: ReviewAgent,
    bundle: RetrievalBundle,
    provider: AIProvider,
    timeoutMs: number,
    retries: number,
    fallbackProvider?: AIProvider,
  ): Promise<ExplainableFinding[]> {
    let attempt = 0;
    let activeProvider = provider;

    while (attempt <= retries) {
      try {
        const timeoutPromise = new Promise<ExplainableFinding[]>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Agent ${agent.name} timed out after ${timeoutMs}ms`)),
            timeoutMs,
          ),
        );

        return await Promise.race([agent.analyze(bundle, activeProvider), timeoutPromise]);
      } catch {
        attempt++;
        if (fallbackProvider) {
          activeProvider = fallbackProvider;
        }
      }
    }

    return [];
  }
}
