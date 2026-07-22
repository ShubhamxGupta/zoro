/**
 * Language & Repository Classification Types
 */

export type LanguageId =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'json'
  | 'yaml'
  | 'markdown'
  | 'html'
  | 'css'
  | 'unknown';

export type FileCategory =
  | 'source'
  | 'test'
  | 'config'
  | 'documentation'
  | 'generated'
  | 'binary'
  | 'asset'
  | 'unknown';

export type FrameworkHint =
  | 'next'
  | 'react'
  | 'express'
  | 'fastify'
  | 'django'
  | 'flask'
  | 'gin'
  | 'spring'
  | 'unknown';

export type PackageManagerId =
  | 'pnpm'
  | 'npm'
  | 'yarn'
  | 'pip'
  | 'poetry'
  | 'gomod'
  | 'cargo'
  | 'unknown';

export interface ClassifiedFile {
  relativePath: string;
  absolutePath: string;
  languageId: LanguageId;
  category: FileCategory;
  treeSitterGrammar?: string;
  isSupportedByParser: boolean;
  sizeInBytes: number;
  mtimeMs: number;
  isBinary: boolean;
  sha256?: string;
}

export interface LanguageStat {
  fileCount: number;
  totalBytes: number;
  percentage: number;
}

export interface RepoMetadata {
  rootPath: string;
  primaryLanguage: LanguageId;
  packageManager: PackageManagerId;
  detectedFrameworks: FrameworkHint[];
  languageDistribution: Record<string, LanguageStat>;
  fileCategoryBreakdown: Record<FileCategory, number>;
  totalFiles: number;
  totalSourceFiles: number;
  totalTestFiles: number;
  totalBytes: number;
}
