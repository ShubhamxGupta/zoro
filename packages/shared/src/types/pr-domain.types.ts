import type { ExplainableFinding } from './finding.types.js';

export type ReviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  author: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'OPEN' | 'CLOSED' | 'MERGED';
  repositoryUrl: string;
  createdAt: string;
  updatedAt: string;
  commitsCount: number;
  changedFilesCount: number;
  additions: number;
  deletions: number;
}

export interface ReviewComment {
  id: string;
  filePath: string;
  line?: number;
  side?: 'LEFT' | 'RIGHT';
  body: string;
  findingId?: string;
  severity?: string;
  category?: string;
  createdAt: string;
}

export interface ReviewThread {
  id: string;
  filePath: string;
  comments: ReviewComment[];
  isResolved: boolean;
}

export interface ReviewSummary {
  prId: string;
  prNumber: number;
  status: ReviewStatus;
  executiveSummary: string;
  findingsCount: number;
  severityDistribution: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  findings: ExplainableFinding[];
  suggestedPatchesCount: number;
  confidenceScore: number;
  riskAssessment: string;
  reviewedAt: string;
}

export interface SARIFRule {
  id: string;
  shortDescription: { text: string };
  fullDescription?: { text: string };
  defaultConfiguration?: { level: 'error' | 'warning' | 'note' };
}

export interface SARIFResult {
  ruleId: string;
  message: { text: string };
  locations: Array<{
    physicalLocation: {
      artifactLocation: { uri: string };
      region?: { startLine?: number; startColumn?: number };
    };
  }>;
}

export interface SARIFReport {
  $schema: string;
  version: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        rules: SARIFRule[];
      };
    };
    results: SARIFResult[];
  }>;
}
