import type { FrameworkDetector, DetectorContext } from './detector.types.js';
import type { DetectedFramework } from '@repo-intel/shared';

export const fastifyDetector: FrameworkDetector = {
  id: 'fastify',
  name: 'Fastify Web Framework',
  async detect(ctx: DetectorContext): Promise<DetectedFramework | null> {
    const deps = { ...ctx.packageJson?.dependencies, ...ctx.packageJson?.devDependencies };
    if (deps['fastify']) {
      return {
        name: 'fastify',
        confidence: 0.95,
        reason: 'Detected fastify dependency in package.json',
      };
    }
    return null;
  },
};
