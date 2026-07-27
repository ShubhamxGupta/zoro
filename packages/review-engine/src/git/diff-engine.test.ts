import { describe, it, expect } from 'vitest';
import { DiffEngine } from './diff-engine.js';

describe('DiffEngine', () => {
  it('parses raw git diff into structured diff model with changed symbols', () => {
    const diffEngine = new DiffEngine();

    const rawDiff = `diff --git a/src/user.ts b/src/user.ts
index 123..456 100644
--- a/src/user.ts
+++ b/src/user.ts
@@ -10,3 +10,4 @@
+  public async getUser(id: string) {}
-  public removeUser(id: string) {}
`;

    const structured = diffEngine.parse(rawDiff);

    expect(structured.changedFiles).toContain('src/user.ts');
    expect(structured.addedMethods).toContain('getUser');
    expect(structured.removedMethods).toContain('removeUser');
  });
});
