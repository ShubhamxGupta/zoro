import type { ExplainableFinding, PatchExplanation, PatchPlan } from '@repo-intel/shared';

export class PatchExplanationEngine {
  public generateExplanation(
    plan: PatchPlan,
    finding?: ExplainableFinding,
    targetFile = 'unknown.ts',
    affectedSymbols: string[] = [],
  ): PatchExplanation {
    const problemSummary = finding?.explanation?.whatIsWrong ?? plan.title;
    const whyThisChange = finding?.explanation?.whyItMatters ?? plan.rationale;
    const expectedBehaviour =
      'Code is refactored deterministically without introducing breaking syntax or runtime errors.';

    const possibleRisks = [
      'Downstream callers may require parameter signature alignment.',
      'Unit test assertions should be re-executed after patch application.',
    ];

    const verificationSteps = [
      'Run `npm run build` (`tsc -b`) to verify composite type safety.',
      'Execute `npx vitest run` to verify zero test regressions.',
    ];

    return {
      problemSummary,
      whyThisChange,
      affectedFiles: plan.affectedFiles.length > 0 ? plan.affectedFiles : [targetFile],
      affectedSymbols: affectedSymbols.length > 0 ? affectedSymbols : [targetFile],
      expectedBehaviour,
      possibleRisks,
      verificationSteps,
    };
  }
}
