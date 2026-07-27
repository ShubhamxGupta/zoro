import type { DeveloperContext, ExplainableFinding } from '@repo-intel/shared';

export class PromptContextBuilder {
  public buildPromptContext(
    devContext: DeveloperContext,
    previousFindings: ExplainableFinding[] = [],
    tokenBudget = 2000,
  ): string {
    const sections: string[] = [];

    // Section 1: Repository & Diff Summary
    sections.push(`## Repository & Changed Files
Files Changed: ${devContext.diff.changedFiles.join(', ') || 'None'}
Methods Added: ${devContext.diff.addedMethods.join(', ') || 'None'}
Methods Removed: ${devContext.diff.removedMethods.join(', ') || 'None'}`);

    // Section 2: Raw Code Diff
    sections.push(`## Diff Patch
\`\`\`diff
${devContext.diff.rawDiff}
\`\`\``);

    // Section 3: Impacted Architecture & Dependencies
    if (devContext.affectedArchitecture.length > 0) {
      sections.push(`## Affected Architecture Components
${devContext.affectedArchitecture.map((a) => `- ${a}`).join('\n')}`);
    }

    if (devContext.dependencies.length > 0) {
      sections.push(`## Graph Dependencies
${devContext.dependencies.map((d) => `- ${d}`).join('\n')}`);
    }

    // Section 4: Previous Agent Findings
    if (previousFindings.length > 0) {
      sections.push(`## Prior Agent Findings
${previousFindings.map((f) => `- [${f.agentId}] ${f.explanation.whatIsWrong} (${f.severity})`).join('\n')}`);
    }

    let result = sections.join('\n\n');
    const maxChars = tokenBudget * 4;

    if (result.length > maxChars) {
      result = result.substring(0, maxChars) + '\n\n[Truncated context to fit token budget...]';
    }

    return result;
  }
}
