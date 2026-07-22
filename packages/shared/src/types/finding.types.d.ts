/**
 * Explainable Finding & Risk Rating Domain Models
 */
export type FindingCategory = 'syntax' | 'logic' | 'security' | 'performance' | 'architecture' | 'naming' | 'documentation' | 'testing' | 'complexity';
export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface FindingExplanation {
    whatIsWrong: string;
    whyItMatters: string;
    impactedComponents: string[];
}
export interface EvidenceStep {
    description: string;
    symbolId?: string;
    filePath?: string;
    line?: number;
}
export interface SuggestedFix {
    description: string;
    replacementCode?: string;
    patchString?: string;
}
export interface ExplainableFinding {
    findingId: string;
    agentId: string;
    category: FindingCategory;
    severity: FindingSeverity;
    confidenceScore: number;
    filePath: string;
    lineRange: {
        startLine: number;
        endLine: number;
    };
    explanation: FindingExplanation;
    evidenceChain: EvidenceStep[];
    suggestedFix?: SuggestedFix;
}
export interface RiskScore {
    overallScore: number;
    riskLevel: RiskLevel;
    downstreamCallersCount: number;
    criticalityRating: number;
    testCoveragePercentage: number;
    breakdown: {
        callerImpactScore: number;
        criticalityScore: number;
        untestedPathScore: number;
    };
}
//# sourceMappingURL=finding.types.d.ts.map