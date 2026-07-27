import { describe, it, expect } from 'vitest';
import { generateSymbolFingerprint } from './symbol-fingerprint.js';
import type { SymbolNode } from '../types/ast.types.js';

describe('symbolFingerprint', () => {
  it('generates deterministic fingerprint for identical symbol input', () => {
    const sym1: Partial<SymbolNode> = {
      kind: 'function',
      name: 'calculateTotal',
      signature: 'calculateTotal(a: number): number',
      modifiers: ['export', 'async'],
      docModel: { summary: 'Calculates total value' },
    };

    const sym2: Partial<SymbolNode> = {
      kind: 'function',
      name: 'calculateTotal',
      signature: 'calculateTotal(a: number): number',
      modifiers: ['async', 'export'],
      docModel: { summary: 'Calculates total value' },
    };

    const fp1 = generateSymbolFingerprint(sym1);
    const fp2 = generateSymbolFingerprint(sym2);

    expect(fp1).toBe(fp2);
    expect(fp1).toMatch(/^fp::function::[a-f0-9]{8}$/);
  });

  it('generates different fingerprints for changed signatures', () => {
    const sym1: Partial<SymbolNode> = {
      kind: 'function',
      name: 'foo',
      signature: 'foo(a: string)',
    };
    const sym2: Partial<SymbolNode> = {
      kind: 'function',
      name: 'foo',
      signature: 'foo(a: number)',
    };

    expect(generateSymbolFingerprint(sym1)).not.toBe(generateSymbolFingerprint(sym2));
  });
});
