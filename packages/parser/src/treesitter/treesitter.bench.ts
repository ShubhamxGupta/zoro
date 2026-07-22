import { bench, describe } from 'vitest';
import { TreeSitterManager } from './tree-sitter-manager.js';
import { ParserPool } from './parser-pool.js';
import type { Poolable } from './parser-pool.js';

const SAMPLE_SOURCE = `
const greeting = (name: string): string => \`Hello, \${name}!\`;

class Calculator {
  add(a: number, b: number): number { return a + b; }
  subtract(a: number, b: number): number { return a - b; }
}

function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`.trim();

// ─── Simple Poolable for Pool Benchmarks ─────────────────────────────────────
class BenchParser implements Poolable {
  reset() { /* noop */ }
  dispose() { /* noop */ }
}

describe('Parser Creation vs. Pool Reuse', () => {
  bench('new BenchParser() (no pool)', () => {
    const p = new BenchParser();
    p.reset();
    p.dispose();
  });

  bench('ParserPool acquire → release', () => {
    const pool = new ParserPool<BenchParser>(() => new BenchParser(), { maxSize: 1 });
    const p = pool.acquire();
    pool.release(p);
  });
});

describe('TreeSitterManager.parse() throughput', () => {
  let manager: TreeSitterManager;

  beforeAll(async () => {
    manager = new TreeSitterManager({ maxPoolSize: 4 });
    await manager.initialize();
  });

  afterAll(() => {
    manager.dispose();
  });

  bench('parse TypeScript source (single parse)', async () => {
    await manager.parse(SAMPLE_SOURCE, 'typescript');
  });

  bench('parse Python source (single parse)', async () => {
    await manager.parse(SAMPLE_SOURCE, 'python');
  });
});

function beforeAll(fn: () => Promise<void>): void { void fn(); }
function afterAll(fn: () => void): void { void fn(); }
