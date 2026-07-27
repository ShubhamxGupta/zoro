import { describe, it, expect, beforeEach } from 'vitest';
import { TransformationRegistry } from './transformation-registry.js';

describe('TransformationRegistry', () => {
  let registry: TransformationRegistry;

  beforeEach(() => {
    registry = new TransformationRegistry();
  });

  it('lists registered refactoring capabilities and executes transformations', async () => {
    const caps = registry.listCapabilities();
    expect(caps.length).toBeGreaterThanOrEqual(12);

    const res = await registry.execute('transform::rename_symbol', 'const user = 10;', 'user', {
      newName: 'account',
    });

    expect(res.success).toBe(true);
    expect(res.transformedCode).toBe('const account = 10;');
    expect(res.affectedSymbols).toContain('account');
  });
});
