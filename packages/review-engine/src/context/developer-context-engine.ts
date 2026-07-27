import type { DeveloperContext, GitDiff, RetrievalBundle } from '@repo-intel/shared';
import { DiffEngine } from '../git/diff-engine.js';

export class DeveloperContextEngine {
  private readonly diffEngine: DiffEngine;

  constructor() {
    this.diffEngine = new DiffEngine();
  }

  public createContext(gitDiff: GitDiff, bundle: RetrievalBundle): DeveloperContext {
    const structuredDiff = this.diffEngine.parse(gitDiff.rawDiff);

    const dependencies = bundle.relationships
      .filter((r) => r.kind === 'IMPORTS' || r.kind === 'DEPENDS_ON')
      .map((r) => r.targetId);

    const affectedArchitecture = bundle.entities
      .filter((e) => e.kind === 'Module' || e.kind === 'Directory')
      .map((e) => e.label);

    const relatedDocumentation = bundle.evidence.filter((ev) => ev.toLowerCase().includes('doc'));
    const relatedTests = bundle.files.filter((f) => f.includes('test') || f.includes('spec'));

    return {
      diff: structuredDiff,
      changedSymbols: structuredDiff.changedSymbols,
      impactedSymbols: bundle.entities,
      dependencies: Array.from(new Set(dependencies)),
      affectedArchitecture: Array.from(new Set(affectedArchitecture)),
      historicalContext: [`Commit ${gitDiff.sourceCommit} -> ${gitDiff.targetCommit}`],
      relatedDocumentation,
      relatedTests,
      retrievalBundle: bundle,
      generatedAt: new Date().toISOString(),
    };
  }
}
