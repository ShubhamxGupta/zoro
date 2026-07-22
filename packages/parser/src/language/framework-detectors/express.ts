import type { FrameworkDetector, DetectorContext } from './detector.types.js';
import type { DetectedFramework } from '@repo-intel/shared';

export const expressDetector: FrameworkDetector = {
  id: 'express',
  name: 'Express Web Framework',
  async detect(ctx: DetectorContext): Promise<DetectedFramework | null> {
    const deps = { ...ctx.packageJson?.dependencies, ...ctx.packageJson?.devDependencies };
    if (deps['express']) {
      return {
        name: 'express',
        confidence: 0.95,
        reason: 'Detected express dependency in package.json',
      };
    }
    return null;
  },
};
