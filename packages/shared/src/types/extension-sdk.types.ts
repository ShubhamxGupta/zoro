import type { ExplainableFinding, AIProvider } from '@repo-intel/shared';

export type ExtensionCategory =
  'review-agent' | 'language' | 'exporter' | 'workflow' | 'ai-provider' | 'ui';

export interface ExtensionMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: ExtensionCategory;
  minPlatformVersion: string;
  capabilities: string[];
}

export interface BaseExtension {
  readonly metadata: ExtensionMetadata;
  isEnabled: boolean;
  initialize(): Promise<void>;
  dispose(): Promise<void>;
}

export interface ReviewAgentExtension extends BaseExtension {
  runAnalysis(filePath: string, sourceCode: string): Promise<ExplainableFinding[]>;
}

export interface LanguageExtension extends BaseExtension {
  readonly languageId: string;
  readonly extensions: string[];
  parseFile(filePath: string, content: string): Promise<{ symbolsCount: number }>;
}

export interface ExporterExtension extends BaseExtension {
  readonly formatId: string; // e.g. 'jira', 'confluence', 'csv', 'xml', 'sonarqube'
  exportReport(summary: any): Promise<string>;
}

export type WorkflowHookType =
  | 'beforeIndexing'
  | 'afterIndexing'
  | 'beforeReview'
  | 'afterReview'
  | 'beforePatchGeneration'
  | 'afterPatchGeneration'
  | 'beforeReportGeneration'
  | 'afterReportGeneration';

export interface WorkflowExtension extends BaseExtension {
  onHook(hookType: WorkflowHookType, payload: any): Promise<any>;
}

export interface AIProviderExtension extends BaseExtension {
  readonly provider: AIProvider;
}

export interface UIExtension extends BaseExtension {
  readonly slot: 'dashboard-widget' | 'findings-panel' | 'pr-bar';
  render(): string;
}
