export interface PatchScoreBreakdown {
    correctnessScore: number;
    confidenceScore: number;
    complexityScore: number;
    blastRadiusScore: number;
    breakingChangeLikelihood: number;
    overallScore: number;
}
export interface PatchValidationReport {
    isValid: boolean;
    astValid: boolean;
    parserValid: boolean;
    linterValid: boolean;
    typeCheckValid: boolean;
    score: PatchScoreBreakdown;
    issues: string[];
}
export interface PatchExplanation {
    problemSummary: string;
    whyThisChange: string;
    affectedFiles: string[];
    affectedSymbols: string[];
    expectedBehaviour: string;
    possibleRisks: string[];
    verificationSteps: string[];
}
export interface PatchCandidate {
    id: string;
    planId: string;
    findingId?: string;
    targetFilePath: string;
    unifiedDiff: string;
    originalCode: string;
    transformedCode: string;
    affectedSymbols: string[];
    explanation: PatchExplanation;
    validation: PatchValidationReport;
    confidence: number;
    riskScore: number;
    rollbackMetadata: {
        originalCodeHash: string;
        transformationId: string;
    };
    createdAt: string;
}
//# sourceMappingURL=patch-candidate.types.d.ts.map