import { describe, it, expect } from 'vitest';
import { PatchValidationPipeline } from './patch-validation-pipeline.js';

describe('PatchValidationPipeline', () => {
  it('validates syntax and computes multi-factor patch scores', () => {
    const validator = new PatchValidationPipeline();

    const report = validator.validate('function test() {}', 'function testRenamed() {}\n', [
      'testRenamed',
    ]);

    expect(report.isValid).toBe(true);
    expect(report.score.overallScore).toBeGreaterThan(0.5);
    expect(report.score.correctnessScore).toBe(0.95);
  });
});
