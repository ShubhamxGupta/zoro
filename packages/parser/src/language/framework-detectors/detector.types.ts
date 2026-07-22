import type { FrameworkHint, DetectedFramework } from '@repo-intel/shared';

export interface DetectorContext {
  rootPath: string;
  files: Array<{ relativePath: string }>;
  packageJson?: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

export interface FrameworkDetector {
  id: FrameworkHint;
  name: string;
  detect(ctx: DetectorContext): Promise<DetectedFramework | null>;
}
