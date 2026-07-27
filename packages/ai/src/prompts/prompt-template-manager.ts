export type PromptCategory =
  | 'architecture'
  | 'bug'
  | 'performance'
  | 'security'
  | 'code_quality'
  | 'documentation'
  | 'refactor';

export interface PromptTemplate {
  category: PromptCategory;
  name: string;
  template: string;
}

export class PromptTemplateManager {
  private readonly templates = new Map<string, PromptTemplate>();

  constructor() {
    this.registerDefaults();
  }

  public register(template: PromptTemplate): void {
    const key = `${template.category}::${template.name}`;
    this.templates.set(key, template);
  }

  public get(category: PromptCategory, name = 'default'): PromptTemplate | undefined {
    const key = `${category}::${name}`;
    return this.templates.get(key) ?? this.templates.get(`${category}::default`);
  }

  public render(
    category: PromptCategory,
    variables: Record<string, string>,
    name = 'default',
  ): string {
    const templateObj = this.get(category, name);
    if (!templateObj) return '';

    let result = templateObj.template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replaceAll(`{{${key}}}`, value);
    }

    return result;
  }

  private registerDefaults(): void {
    this.register({
      category: 'architecture',
      name: 'default',
      template: `You are an Principal Software Architect analyzing code architecture and module boundaries.
Context:
{{context}}

Examine the codebase for architectural anti-patterns, circular dependencies, domain leaks, or improper layer coupling.
Return JSON response containing findings array.`,
    });

    this.register({
      category: 'bug',
      name: 'default',
      template: `You are a Senior Debugging Engineer analyzing code for potential runtime bugs, null references, and logic flaws.
Context:
{{context}}

Examine the context payload for unhandled edge cases, type errors, or race conditions.
Return JSON response containing findings array.`,
    });

    this.register({
      category: 'performance',
      name: 'default',
      template: `You are a Performance Optimization Lead inspecting code for latency bottlenecks and memory leaks.
Context:
{{context}}

Examine the code for N+1 queries, unindexed lookups, synchronous blocking calls, or unnecessary allocations.
Return JSON response containing findings array.`,
    });

    this.register({
      category: 'security',
      name: 'default',
      template: `You are a Lead Application Security Engineer conducting static code analysis for vulnerabilities.
Context:
{{context}}

Examine the code for OWASP Top 10 risks, injection vulnerabilities, unvalidated inputs, or hardcoded secrets.
Return JSON response containing findings array.`,
    });

    this.register({
      category: 'code_quality',
      name: 'default',
      template: `You are a Code Quality Lead inspecting readability, maintainability, and clean code principles.
Context:
{{context}}

Examine code for code smells, dead code, overly complex methods, or poor naming conventions.
Return JSON response containing findings array.`,
    });

    this.register({
      category: 'documentation',
      name: 'default',
      template: `You are a Technical Writer and Developer Experience Lead inspecting code documentation.
Context:
{{context}}

Examine code for missing JSDoc/docstrings, outdated comments, or unclear parameter descriptions.
Return JSON response containing findings array.`,
    });
  }
}
