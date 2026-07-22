import type { LanguageId, FrameworkHint, PackageManagerId } from './language.types.js';

export type ProjectScale = 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

export interface DetectedFramework {
  name: FrameworkHint;
  confidence: number; // 0.0 to 1.0
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface RepositoryFacts {
  primaryLanguage: LanguageId;
  secondaryLanguages: LanguageId[];
  frameworks: DetectedFramework[];
  packageManager: PackageManagerId;
  buildSystem: string;
  testFramework: string;
  ciProvider: string;
  hasDocker: boolean;
  isMonorepo: boolean;
  isGitRepo: boolean;
  totalSizeBytes: number;
  estimatedProjectScale: ProjectScale;
}
