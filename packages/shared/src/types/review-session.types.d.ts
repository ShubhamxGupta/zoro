import type { ExplainableFinding } from './finding.types.js';
import type { PatchPlan } from './patch-plan.types.js';
import type { DeveloperContext } from './developer-context.types.js';
export interface SessionMetrics {
    totalDurationMs: number;
    retrievalLatencyMs: number;
    agentCount: number;
    findingsCount: number;
}
export interface ReviewSession {
    id: string;
    repositoryId: string;
    branch: string;
    commitHash: string;
    userPrompt?: string;
    retrievedContext: DeveloperContext;
    participatingAgents: string[];
    executionHistory: Array<{
        agent: string;
        status: 'success' | 'failed' | 'timeout';
        durationMs: number;
    }>;
    findings: ExplainableFinding[];
    patchPlans: PatchPlan[];
    metrics: SessionMetrics;
    createdAt: string;
}
export interface ReviewSessionStore {
    save(session: ReviewSession): Promise<void>;
    get(id: string): Promise<ReviewSession | undefined>;
    list(repositoryId?: string): Promise<ReviewSession[]>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=review-session.types.d.ts.map