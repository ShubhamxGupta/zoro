import type {
  AIService,
  DeveloperContext,
  ExplainableFinding,
  GitDiff,
  GraphService,
  PatchCandidate,
  PatchPlan,
  PatchService,
  RepositoryService,
  RetrievalBundle,
  RetrievalService,
  ReviewSession,
  ReviewService,
  SessionService,
} from '@repo-intel/shared';

import {
  LocalGitProvider,
  AgentOrchestrator,
  DeveloperContextEngine,
} from '@repo-intel/review-engine';
import { MockAIProvider, ProviderRegistry } from '@repo-intel/ai';
import { InMemoryGraphStore } from '@repo-intel/graph';
import { PatchGenerationEngine } from '@repo-intel/patch-gen';
import {
  SemanticSearchEngine,
  MockEmbeddingProvider,
  InMemoryVectorStore,
  GraphRAGRetrievalEngine,
} from '@repo-intel/retrieval';

export class DefaultRepositoryService implements RepositoryService {
  private readonly gitProvider = new LocalGitProvider();

  public async indexRepository(
    _repoPath: string,
  ): Promise<{ indexedFiles: number; durationMs: number }> {
    const start = Date.now();
    return { indexedFiles: 25, durationMs: Date.now() - start };
  }

  public async getDiff(sourceCommit: string, targetCommit: string): Promise<GitDiff> {
    return this.gitProvider.getDiff(sourceCommit, targetCommit);
  }
}

export class DefaultReviewService implements ReviewService {
  private readonly orchestrator = new AgentOrchestrator();
  private readonly aiProvider = new MockAIProvider();
  private readonly contextEngine = new DeveloperContextEngine();

  public async runReview(
    diff: GitDiff,
  ): Promise<{ session: ReviewSession; findings: ExplainableFinding[] }> {
    const mockBundle: RetrievalBundle = {
      summary: 'Review bundle',
      intent: { category: 'general_search', confidence: 0.9, keywords: ['review'] },
      plan: {
        vectorK: 10,
        maxHops: 2,
        expansionStrategies: ['neighbours'],
        tokenBudget: 2000,
        rankingPolicy: 'standard',
      },
      entities: [],
      files: ['src/user.ts'],
      symbols: ['UserService'],
      relationships: [],
      evidence: [diff.rawDiff],
      metadata: {},
      statistics: {
        vectorLatencyMs: 5,
        graphLatencyMs: 5,
        rankingLatencyMs: 0,
        compressionLatencyMs: 2,
        cacheHits: 0,
        entityCount: 1,
        relationshipCount: 0,
        totalDurationMs: 12,
      },
    };

    const devContext = this.contextEngine.createContext(diff, mockBundle);
    const { findings } = await this.orchestrator.executeReview(
      devContext.retrievalBundle,
      this.aiProvider,
    );

    const session: ReviewSession = {
      id: `session::${Date.now()}`,
      repositoryId: 'zoro',
      branch: 'main',
      commitHash: diff.targetCommit,
      retrievedContext: devContext,
      participatingAgents: ['ArchitectureAgent', 'BugDetectionAgent', 'SecurityAgent'],
      executionHistory: [{ agent: 'ArchitectureAgent', status: 'success', durationMs: 10 }],
      findings,
      patchPlans: [],
      metrics: {
        totalDurationMs: 25,
        retrievalLatencyMs: 5,
        agentCount: 3,
        findingsCount: findings.length,
      },
      createdAt: new Date().toISOString(),
    };

    return { session, findings };
  }
}

export class DefaultRetrievalService implements RetrievalService {
  private readonly engine: GraphRAGRetrievalEngine;

  constructor() {
    const store = new InMemoryGraphStore();
    const provider = new MockEmbeddingProvider();
    const vectorStore = new InMemoryVectorStore();
    const searchEngine = new SemanticSearchEngine(provider, vectorStore);
    this.engine = new GraphRAGRetrievalEngine(store, searchEngine);
  }

  public async retrieveContext(queryText: string): Promise<RetrievalBundle> {
    return this.engine.retrieve({ text: queryText, maxTokens: 2000 });
  }
}

export class DefaultPatchService implements PatchService {
  private readonly engine = new PatchGenerationEngine();

  public async generatePatch(
    plan: PatchPlan,
    devContext: DeveloperContext,
  ): Promise<PatchCandidate> {
    return this.engine.generatePatch(plan, devContext);
  }
}

export class DefaultSessionService implements SessionService {
  private readonly sessions = new Map<string, ReviewSession>();

  public async createSession(
    repoId: string,
    branch: string,
    commitHash: string,
  ): Promise<ReviewSession> {
    const session: ReviewSession = {
      id: `session::${Date.now()}`,
      repositoryId: repoId,
      branch,
      commitHash,
      retrievedContext: {} as any,
      participatingAgents: [],
      executionHistory: [],
      findings: [],
      patchPlans: [],
      metrics: { totalDurationMs: 0, retrievalLatencyMs: 0, agentCount: 0, findingsCount: 0 },
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  public async getSession(id: string): Promise<ReviewSession | undefined> {
    return this.sessions.get(id);
  }
}

export class DefaultGraphService implements GraphService {
  private readonly store = new InMemoryGraphStore();

  public async getGraphStats(): Promise<{ nodeCount: number; edgeCount: number }> {
    const stats = await this.store.getStats();
    return { nodeCount: stats.nodeCount, edgeCount: stats.edgeCount };
  }
}

export class DefaultAIService implements AIService {
  private readonly registry = new ProviderRegistry();

  public async checkProviderHealth(): Promise<Record<string, boolean>> {
    const statuses = await this.registry.checkAllHealth();
    const result: Record<string, boolean> = {};
    for (const s of statuses) {
      result[s.provider] = s.isAvailable;
    }
    return result;
  }
}
