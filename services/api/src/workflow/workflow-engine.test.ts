import { describe, it, expect } from 'vitest';
import { DefaultWorkflowEngine } from './workflow-engine.js';

describe('DefaultWorkflowEngine', () => {
  it('executes Review and Patch workflows through deterministic stages', async () => {
    const engine = new DefaultWorkflowEngine();

    const reviewWf = await engine.executeWorkflow('review', { repoPath: '.' });
    expect(reviewWf.status).toBe('completed');
    expect(reviewWf.stagesCompleted).toHaveLength(3);

    const patchWf = await engine.executeWorkflow('patch', { planId: 'p1' });
    expect(patchWf.status).toBe('completed');
    expect(patchWf.stagesCompleted).toHaveLength(3);
  });
});
