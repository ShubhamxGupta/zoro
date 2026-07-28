import { BaseReviewAgent } from './base-agent.js';
import type { PromptCategory } from '@repo-intel/ai';

export class ArchitectureAgent extends BaseReviewAgent {
  readonly name = 'ArchitectureAgent';
  readonly category: PromptCategory = 'architecture';
}

export class BugDetectionAgent extends BaseReviewAgent {
  readonly name = 'BugDetectionAgent';
  readonly category: PromptCategory = 'bug';
}

export class PerformanceAgent extends BaseReviewAgent {
  readonly name = 'PerformanceAgent';
  readonly category: PromptCategory = 'performance';
}

export { SyntaxAgent } from './syntax-agent.js';
export { LogicAgent } from './logic-agent.js';
export { SecurityAgent } from './security-agent.js';

export class CodeQualityAgent extends BaseReviewAgent {
  readonly name = 'CodeQualityAgent';
  readonly category: PromptCategory = 'code_quality';
}

export class DocumentationAgent extends BaseReviewAgent {
  readonly name = 'DocumentationAgent';
  readonly category: PromptCategory = 'documentation';
}
