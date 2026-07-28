import { describe, it, expect } from 'vitest';
import { SecurityAgent } from './security-agent.js';
import { MockAIProvider } from '@repo-intel/ai';
import type { RetrievalBundle } from '@repo-intel/shared';

describe('SecurityAgent Suite', () => {
  it('detects OWASP Top 10 security vulnerabilities and injection risks', async () => {
    const agent = new SecurityAgent();
    const mockProvider = new MockAIProvider();
    const bundle: RetrievalBundle = {
      summary: 'security check',
      intent: {} as any,
      plan: {} as any,
      entities: [],
      files: ['src/db.ts'],
      symbols: [],
      relationships: [],
      evidence: ['+ const query = "SELECT * FROM users WHERE id = " + req.query.id;', '+ eval(req.body);'],
      metadata: {},
      statistics: {} as any,
    };

    const findings = await agent.analyze(bundle, mockProvider);
    expect(agent.name).toBe('SecurityAgent');
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.category === 'security' && f.severity === 'CRITICAL')).toBe(true);
  });
});
