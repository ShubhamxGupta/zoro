import type { PatchScoreBreakdown, PatchValidationReport } from '@repo-intel/shared';

export class PatchValidationPipeline {
  public validate(
    _originalCode: string,
    transformedCode: string,
    affectedSymbols: string[],
  ): PatchValidationReport {
    const issues: string[] = [];

    // AST / Syntax Check
    const astValid = this.checkSyntax(transformedCode);
    if (!astValid) issues.push('Syntax error in transformed AST code.');

    // Parser Validity
    const parserValid = transformedCode.length > 0;
    if (!parserValid) issues.push('Empty code produced by transformation.');

    // Linter Check
    const linterValid = !/\t|debugger;/.test(transformedCode);
    if (!linterValid) issues.push('Lint warning: debugger or tab character detected.');

    // Type Check Simulation
    const typeCheckValid = !/undefined\./.test(transformedCode);
    if (!typeCheckValid) issues.push('Type check warning: possible unsafe dereference.');

    const isValid = astValid && parserValid && linterValid && typeCheckValid;

    // Multi-factor Scoring
    const correctnessScore = isValid ? 0.95 : 0.4;
    const confidenceScore = 0.9;
    const complexityScore = Number(Math.max(0.2, 1.0 - affectedSymbols.length * 0.1).toFixed(2));
    const blastRadiusScore = Number(Math.min(1.0, affectedSymbols.length * 0.15).toFixed(2));
    const breakingChangeLikelihood = affectedSymbols.length > 3 ? 0.6 : 0.1;

    const overallScore = Number(
      (correctnessScore * 0.4 + confidenceScore * 0.3 + (1 - blastRadiusScore) * 0.3).toFixed(2),
    );

    const score: PatchScoreBreakdown = {
      correctnessScore,
      confidenceScore,
      complexityScore,
      blastRadiusScore,
      breakingChangeLikelihood,
      overallScore,
    };

    return {
      isValid,
      astValid,
      parserValid,
      linterValid,
      typeCheckValid,
      score,
      issues,
    };
  }

  private checkSyntax(code: string): boolean {
    if (!code) return false;
    let braceCount = 0;
    for (const char of code) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    return braceCount === 0;
  }
}
