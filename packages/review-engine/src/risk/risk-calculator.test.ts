import { describe, it, expect } from 'vitest';
import { RiskCalculator } from './risk-calculator.js';

describe('RiskCalculator Suite', () => {
  it('calculates numerical risk score and risk level correctly', () => {
    const lowRisk = RiskCalculator.calculateRisk(1, 2, 95);
    expect(lowRisk.riskLevel).toBe('LOW');
    expect(lowRisk.overallScore).toBeLessThan(0.3);

    const criticalRisk = RiskCalculator.calculateRisk(15, 9, 0);
    expect(criticalRisk.riskLevel).toBe('CRITICAL');
    expect(criticalRisk.overallScore).toBeGreaterThanOrEqual(0.75);
  });
});
