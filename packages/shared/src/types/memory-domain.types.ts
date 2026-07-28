export type FindingFeedbackRating =
  'USEFUL' | 'INCORRECT' | 'IGNORED' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface FindingFeedback {
  id: string;
  findingId: string;
  agentId: string;
  rating: FindingFeedbackRating;
  comment?: string;
  submittedAt: string;
}

export interface AcceptedPatchRecord {
  id: string;
  findingId: string;
  filePath: string;
  patchString: string;
  appliedAt: string;
}

export interface RepositoryHotspot {
  filePath: string;
  findingCount: number;
  unstableScore: number;
  lastModifiedAt: string;
}

export interface TrendMetrics {
  totalReviews: number;
  avgFindingsPerReview: number;
  patchAcceptanceRate: number;
  falsePositiveRate: number;
  severityBreakdown: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  avgReviewDurationMs: number;
}

export interface RepositoryInsight {
  recurringSecurityIssues: number;
  recurringPerformanceIssues: number;
  hotspots: RepositoryHotspot[];
  trends: TrendMetrics;
  topFeedbackRatings: Record<FindingFeedbackRating, number>;
  generatedAt: string;
}

export interface RepositoryMemory {
  repositoryId: string;
  completedReviewsCount: number;
  feedbacks: FindingFeedback[];
  acceptedPatches: AcceptedPatchRecord[];
  rejectedPatchesCount: number;
  userNotes: string[];
  hotspots: RepositoryHotspot[];
  lastUpdated: string;
}
