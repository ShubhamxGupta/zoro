import type { FrameworkDetector, DetectorContext } from './detector.types.js';
import type { DetectedFramework } from '@repo-intel/shared';

export const reactDetector: FrameworkDetector = {
  id: 'react',
  name: 'React Library',
  async detect(ctx: DetectorContext): Promise<DetectedFramework | null> {
    const deps = { ...ctx.packageJson?.dependencies, ...ctx.packageJson?.devDependencies };
    if (deps['react']) {
      return {
        name: 'react',
        confidence: 0.95,
        reason: 'Detected react dependency in package.json',
      };
    }
    return null;
  },
};
