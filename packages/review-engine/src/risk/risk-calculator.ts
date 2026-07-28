import type { RiskScore, RiskLevel } from '@repo-intel/shared';

export class RiskCalculator {
  public static calculateRisk(
    downstreamCallersCount: number,
    criticalityRating: number,
    testCoveragePercentage: number,
  ): RiskScore {
    // callerImpactScore: 0.0 - 0.4
    const callerImpactScore = Math.min(0.4, (downstreamCallersCount / 25) * 0.4);

    // criticalityScore: 0.0 - 0.3
    const criticalityScore = Math.min(0.3, (criticalityRating / 10) * 0.3);

    // untestedPathScore: 0.0 - 0.3
    const untestedPathScore = Math.min(0.3, ((100 - testCoveragePercentage) / 100) * 0.3);

    const overallScore = Math.min(1.0, Math.max(0.0, callerImpactScore + criticalityScore + untestedPathScore));

    let riskLevel: RiskLevel = 'LOW';
    if (overallScore >= 0.75 || (downstreamCallersCount > 10 && testCoveragePercentage < 10)) {
      riskLevel = 'CRITICAL';
    } else if (overallScore >= 0.5) {
      riskLevel = 'HIGH';
    } else if (overallScore >= 0.25) {
      riskLevel = 'MEDIUM';
    }

    return {
      overallScore: Number(overallScore.toFixed(2)),
      riskLevel,
      downstreamCallersCount,
      criticalityRating,
      testCoveragePercentage,
      breakdown: {
        callerImpactScore: Number(callerImpactScore.toFixed(2)),
        criticalityScore: Number(criticalityScore.toFixed(2)),
        untestedPathScore: Number(untestedPathScore.toFixed(2)),
      },
    };
  }
}
