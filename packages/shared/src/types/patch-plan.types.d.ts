/**
 * Patch Planning Domain Models
 */
export interface AffectedSymbol {
    symbolId: string;
    name: string;
    filePath: string;
    changeType: 'modify' | 'add' | 'delete';
}
export interface DependencyImpact {
    dependentFilePath: string;
    dependentSymbolId?: string;
    impactLevel: 'high' | 'medium' | 'low';
}
export interface PatchPlan {
    id: string;
    title: string;
    rationale: string;
    estimatedComplexity: 'low' | 'medium' | 'high';
    riskScore: number;
    affectedFiles: string[];
    affectedSymbols: AffectedSymbol[];
    dependencyImpacts: DependencyImpact[];
    createdAt: string;
}
//# sourceMappingURL=patch-plan.types.d.ts.map