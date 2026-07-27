import type {
  DeveloperContext,
  ExplainableFinding,
  GitDiff,
  PatchCandidate,
  PatchPlan,
  RetrievalBundle,
  ReviewSession,
} from './index.js';

export interface RepositoryService {
  indexRepository(repoPath: string): Promise<{ indexedFiles: number; durationMs: number }>;
  getDiff(sourceCommit: string, targetCommit: string): Promise<GitDiff>;
}

export interface ReviewService {
  runReview(diff: GitDiff): Promise<{ session: ReviewSession; findings: ExplainableFinding[] }>;
}

export interface RetrievalService {
  retrieveContext(queryText: string): Promise<RetrievalBundle>;
}

export interface PatchService {
  generatePatch(plan: PatchPlan, devContext: DeveloperContext): Promise<PatchCandidate>;
}

export interface SessionService {
  createSession(repoId: string, branch: string, commitHash: string): Promise<ReviewSession>;
  getSession(id: string): Promise<ReviewSession | undefined>;
}

export interface GraphService {
  getGraphStats(): Promise<{ nodeCount: number; edgeCount: number }>;
}

export interface AIService {
  checkProviderHealth(): Promise<Record<string, boolean>>;
}
