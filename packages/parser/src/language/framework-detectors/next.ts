import type { FrameworkDetector, DetectorContext } from './detector.types.js';
import type { DetectedFramework } from '@repo-intel/shared';
import path from 'node:path';

export const nextDetector: FrameworkDetector = {
  id: 'next',
  name: 'Next.js App/Pages Router Framework',
  async detect(ctx: DetectorContext): Promise<DetectedFramework | null> {
    const hasNextConfig = ctx.files.some((f) => {
      const base = path.basename(f.relativePath);
      return base === 'next.config.js' || base === 'next.config.mjs' || base === 'next.config.ts';
    });

    const deps = { ...ctx.packageJson?.dependencies, ...ctx.packageJson?.devDependencies };
    const hasNextDep = Boolean(deps['next']);

    if (hasNextConfig && hasNextDep) {
      return {
        name: 'next',
        confidence: 1.0,
        reason: 'Detected next.config file and next dependency in package.json',
      };
    }

    if (hasNextConfig || hasNextDep) {
      return {
        name: 'next',
        confidence: 0.85,
        reason: hasNextConfig ? 'Detected next.config file' : 'Detected next dependency in package.json',
      };
    }

    return null;
  },
};
