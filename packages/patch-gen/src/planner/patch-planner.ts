import type {
  ExplainableFinding,
  PatchPlan,
  RetrievalBundle,
  AffectedSymbol,
  DependencyImpact,
} from '@repo-intel/shared';

export class PatchPlanner {
  public createPatchPlan(findings: ExplainableFinding[], bundle: RetrievalBundle): PatchPlan {
    const affectedFilesSet = new Set<string>();
    const affectedSymbolsMap = new Map<string, AffectedSymbol>();
    const dependencyImpacts: DependencyImpact[] = [];

    for (const f of findings) {
      if (f.filePath) {
        affectedFilesSet.add(f.filePath);
      }
    }

    for (const file of bundle.files) {
      affectedFilesSet.add(file);
    }

    for (const symName of bundle.symbols) {
      const symId = `sym::${symName}`;
      affectedSymbolsMap.set(symId, {
        symbolId: symId,
        name: symName,
        filePath: bundle.files[0] ?? 'unknown.ts',
        changeType: 'modify',
      });
    }

    // Compute dependency impact from graph relationships
    for (const rel of bundle.relationships) {
      if (rel.kind === 'CALLS' || rel.kind === 'IMPORTS' || rel.kind === 'DEPENDS_ON') {
        dependencyImpacts.push({
          dependentFilePath: rel.targetId.replace(/^.*::file::/, ''),
          dependentSymbolId: rel.targetId,
          impactLevel: rel.kind === 'DEPENDS_ON' ? 'high' : 'medium',
        });
      }
    }

    const highSeverityCount = findings.filter(
      (f) => f.severity === 'HIGH' || f.severity === 'CRITICAL',
    ).length;
    const riskScore = Number(
      Math.min(1.0, 0.3 + highSeverityCount * 0.2 + affectedFilesSet.size * 0.05).toFixed(2),
    );

    const complexity: 'low' | 'medium' | 'high' =
      affectedFilesSet.size > 5 ? 'high' : affectedFilesSet.size > 2 ? 'medium' : 'low';

    const title =
      findings.length > 0 && findings[0]?.explanation?.whatIsWrong
        ? `Patch Plan: ${findings[0].explanation.whatIsWrong}`
        : `Patch Plan for ${bundle.intent.category} query`;

    const rationale = `Structured patch plan generated for ${findings.length} review findings across ${affectedFilesSet.size} files.`;

    return {
      id: `patch-plan::${Date.now()}`,
      title,
      rationale,
      estimatedComplexity: complexity,
      riskScore,
      affectedFiles: Array.from(affectedFilesSet),
      affectedSymbols: Array.from(affectedSymbolsMap.values()),
      dependencyImpacts,
      createdAt: new Date().toISOString(),
    };
  }
}
