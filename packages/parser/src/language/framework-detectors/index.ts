import type { DetectedFramework } from '@repo-intel/shared';
import type { FrameworkDetector, DetectorContext } from './detector.types.js';
import { nextDetector } from './next.js';
import { reactDetector } from './react.js';
import { fastifyDetector } from './fastify.js';
import { expressDetector } from './express.js';

const ALL_DETECTORS: FrameworkDetector[] = [
  nextDetector,
  reactDetector,
  fastifyDetector,
  expressDetector,
];

export async function detectAllFrameworks(ctx: DetectorContext): Promise<DetectedFramework[]> {
  const results: DetectedFramework[] = [];
  for (const detector of ALL_DETECTORS) {
    try {
      const match = await detector.detect(ctx);
      if (match && match.confidence > 0.0) {
        results.push(match);
      }
    } catch {
      // Ignore individual detector errors
    }
  }
  return results;
}

export * from './detector.types.js';
