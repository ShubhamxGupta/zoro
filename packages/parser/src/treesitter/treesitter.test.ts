import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { GrammarRegistry, createDefaultGrammarRegistry } from './grammar-registry.js';
import { ParserPool } from './parser-pool.js';
import type { Poolable } from './parser-pool.js';
import { TreeSitterManager } from './tree-sitter-manager.js';
import { normalizeTree } from './ast-normalizer.js';
import type { ASTTree } from '@repo-intel/shared';

// ─── Mock Poolable for ParserPool testing ─────────────────────────────────────
class MockParser implements Poolable {
  public resetCount = 0;
  public disposed = false;
  reset(): void { this.resetCount++; }
  dispose(): void { this.disposed = true; }
}

describe('Tree-Sitter Abstraction Layer', () => {

  // ─── GrammarRegistry ─────────────────────────────────────────────────────
  describe('GrammarRegistry', () => {
    let registry: GrammarRegistry;

    beforeEach(() => {
      registry = new GrammarRegistry();
    });

    test('registers and retrieves grammar entries by id', () => {
      registry.register({
        id: 'typescript',
        languageId: 'typescript',
        displayName: 'TypeScript',
        version: '0.23.0',
        bindingType: 'placeholder',
        capabilities: { supportsRangeQuery: true, supportsNodeTypes: true, supportsIncrementalParsing: true },
        isLoaded: false,
      });

      const entry = registry.get('typescript');
      expect(entry).toBeDefined();
      expect(entry?.languageId).toBe('typescript');
      expect(entry?.isLoaded).toBe(false);
    });

    test('retrieves grammar by languageId', () => {
      registry.register({
        id: 'python',
        languageId: 'python',
        displayName: 'Python',
        version: '0.23.0',
        bindingType: 'placeholder',
        capabilities: { supportsRangeQuery: true, supportsNodeTypes: true, supportsIncrementalParsing: false },
        isLoaded: false,
      });

      const entry = registry.getByLanguageId('python');
      expect(entry?.id).toBe('python');
    });

    test('markLoaded updates isLoaded flag', () => {
      registry.register({
        id: 'go',
        languageId: 'go',
        displayName: 'Go',
        version: '0.23.0',
        bindingType: 'placeholder',
        capabilities: { supportsRangeQuery: true, supportsNodeTypes: true, supportsIncrementalParsing: false },
        isLoaded: false,
      });

      registry.markLoaded('go');
      expect(registry.get('go')?.isLoaded).toBe(true);
    });

    test('createDefaultGrammarRegistry populates 6 core language grammars', () => {
      const defaultRegistry = createDefaultGrammarRegistry();
      const grammars = defaultRegistry.listRegistered();
      expect(grammars.length).toBeGreaterThanOrEqual(6);
      const ids = grammars.map((g) => g.id);
      expect(ids).toContain('typescript');
      expect(ids).toContain('python');
      expect(ids).toContain('go');
    });
  });

  // ─── ParserPool ───────────────────────────────────────────────────────────
  describe('ParserPool', () => {
    let pool: ParserPool<MockParser>;

    beforeEach(() => {
      pool = new ParserPool<MockParser>(() => new MockParser(), { maxSize: 2 });
    });

    afterEach(() => {
      pool.disposeAll();
    });

    test('acquires parser instances from factory', () => {
      const p = pool.acquire();
      expect(p).toBeInstanceOf(MockParser);
      expect(pool.activeCount).toBe(1);
    });

    test('releases parsers back to idle pool', () => {
      const p = pool.acquire();
      pool.release(p);
      expect(pool.activeCount).toBe(0);
      expect(pool.idleCount).toBe(1);
    });

    test('resets pooled parser on re-acquire', () => {
      const p1 = pool.acquire();
      pool.release(p1);
      const p2 = pool.acquire();
      expect(p2.resetCount).toBe(1);
      pool.release(p2);
    });

    test('disposes overflow parsers when pool is full', () => {
      const p1 = pool.acquire();
      const p2 = pool.acquire();
      pool.release(p1);
      pool.release(p2);
      expect(pool.idleCount).toBe(2);
    });

    test('disposeAll clears all instances', () => {
      const p = pool.acquire();
      pool.release(p);
      pool.disposeAll();
      expect(pool.idleCount).toBe(0);
    });
  });

  // ─── TreeSitterManager ────────────────────────────────────────────────────
  describe('TreeSitterManager', () => {
    let manager: TreeSitterManager;

    beforeEach(async () => {
      manager = new TreeSitterManager({ maxPoolSize: 2 });
      await manager.initialize();
    });

    afterEach(() => {
      manager.dispose();
    });

    test('initializes and marks all grammars as loaded', () => {
      const grammars = manager.getGrammarRegistry().listRegistered();
      expect(grammars.every((g) => g.isLoaded)).toBe(true);
    });

    test('parses TypeScript source code and returns ASTTree', async () => {
      const tree = await manager.parse('const x = 1;', 'typescript');
      expect(tree).toBeDefined();
      expect(tree.languageId).toBe('typescript');
      expect(tree.rootNode.type).toBe('program');
      expect(tree.hasErrors).toBe(false);
    });

    test('detects syntax errors in source code', async () => {
      const tree = await manager.parse('const x = SYNTAX_ERROR_MARKER;', 'typescript');
      expect(tree.hasErrors).toBe(true);
      expect(tree.diagnostics.length).toBeGreaterThan(0);
    });

    test('returns empty tree for unsupported language', async () => {
      const tree = await manager.parse('code', 'csharp' as 'typescript');
      expect(tree.rootNode.type).toBe('unknown');
    });

    test('supportsLanguage reports correctly', () => {
      expect(manager.supportsLanguage('typescript')).toBe(true);
      expect(manager.supportsLanguage('python')).toBe(true);
    });

    test('reports pool stats', async () => {
      const stats = manager.getPoolStats();
      expect(stats.capacity).toBe(2);
      expect(typeof stats.active).toBe('number');
      expect(typeof stats.idle).toBe('number');
    });
  });

  // ─── AST Normalizer ───────────────────────────────────────────────────────
  describe('AST normalizer', () => {
    test('returns empty array for tree with errors', async () => {
      const manager = new TreeSitterManager();
      const tree = await manager.parse('SYNTAX_ERROR_MARKER', 'typescript');
      const symbols = normalizeTree(tree, 'typescript');
      expect(symbols).toEqual([]);
      manager.dispose();
    });

    test('returns empty array for unknown root node type', () => {
      const emptyTree: ASTTree = {
        rootNode: {
          id: -1, type: 'unknown', isNamed: false, text: '',
          range: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0, startByte: 0, endByte: 0 },
          children: [], hasError: false, isMissing: false,
        },
        languageId: 'typescript',
        sourceCode: '',
        hasErrors: false,
        diagnostics: [],
      };
      const symbols = normalizeTree(emptyTree, 'typescript');
      expect(symbols).toEqual([]);
    });
  });
});
