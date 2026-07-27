import { describe, it, expect } from 'vitest';
import type { DeveloperContext } from '@repo-intel/shared';
import { PromptContextBuilder } from './prompt-context-builder.js';

describe('PromptContextBuilder', () => {
  it('builds formatted prompt context payload within token budget', () => {
    const builder = new PromptContextBuilder();

    const devContext: DeveloperContext = {
      diff: {
        rawDiff: '+ function test() {}',
        changedFiles: ['src/test.ts'],
        changedSymbols: [],
        addedMethods: ['test'],
        removedMethods: [],
        renamedSymbols: [],
        movedFiles: [],
      },
      changedSymbols: [],
      impactedSymbols: [],
      dependencies: ['src/util.ts'],
      affectedArchitecture: ['TestModule'],
      historicalContext: [],
      relatedDocumentation: [],
      relatedTests: [],
      retrievalBundle: {} as any,
      generatedAt: new Date().toISOString(),
    };

    const result = builder.buildPromptContext(devContext, [], 1000);

    expect(result).toContain('Files Changed: src/test.ts');
    expect(result).toContain('TestModule');
    expect(result).toContain('src/util.ts');
  });
});
