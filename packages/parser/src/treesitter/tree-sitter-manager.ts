import type { ASTTree, ASTNode, ASTRange, ParseDiagnostic } from '@repo-intel/shared';
import type { LanguageId } from '@repo-intel/shared';
import { GrammarRegistry, createDefaultGrammarRegistry } from './grammar-registry.js';
import { ParserPool } from './parser-pool.js';
import type { Poolable } from './parser-pool.js';

// ─── Placeholder Parser Instance ─────────────────────────────────────────────
// This is a stub parser that creates a synthetic AST until real Tree-Sitter
// WASM/native bindings are wired in Phase 12.
class PlaceholderParser implements Poolable {
  public languageId: string = 'unknown';

  public parse(source: string, languageId: string): ASTTree {
    this.languageId = languageId;
    const hasErrors = source.includes('SYNTAX_ERROR_MARKER');

    const diagnostics: ParseDiagnostic[] = hasErrors
      ? [
          {
            severity: 'error',
            message: 'Syntax error detected in source code',
            range: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0, startByte: 0, endByte: 0 },
            code: 'PARSE_ERROR',
            isSyntaxError: true,
            isMissingNode: false,
          },
        ]
      : [];

    const rootNode: ASTNode = {
      id: 0,
      type: 'program',
      isNamed: true,
      text: source,
      range: this.buildRange(source),
      children: [],
      hasError: hasErrors,
      isMissing: false,
    };

    return {
      rootNode,
      languageId,
      sourceCode: source,
      hasErrors,
      diagnostics,
    };
  }

  public reset(): void {
    this.languageId = 'unknown';
  }

  public dispose(): void {
    // No-op for placeholder
  }

  private buildRange(source: string): ASTRange {
    const lines = source.split('\n');
    const lastLine = lines[lines.length - 1] ?? '';
    return {
      startLine: 0,
      startColumn: 0,
      endLine: lines.length - 1,
      endColumn: lastLine.length,
      startByte: 0,
      endByte: Buffer.byteLength(source, 'utf8'),
    };
  }
}

// ─── TreeSitterManager ────────────────────────────────────────────────────────

export interface TreeSitterManagerOptions {
  maxPoolSize?: number;
  idleTimeoutMs?: number;
  grammarRegistry?: GrammarRegistry;
}

export class TreeSitterManager {
  private readonly grammarRegistry: GrammarRegistry;
  private readonly pool: ParserPool<PlaceholderParser>;
  private isInitialized = false;

  constructor(options: TreeSitterManagerOptions = {}) {
    this.grammarRegistry = options.grammarRegistry ?? createDefaultGrammarRegistry();
    this.pool = new ParserPool<PlaceholderParser>(
      () => new PlaceholderParser(),
      {
        maxSize: options.maxPoolSize ?? 4,
        idleTimeoutMs: options.idleTimeoutMs ?? 30_000,
      },
    );
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // In Phase 12+: load WASM grammar binaries here.
    // For now, mark all registered grammars as loaded with placeholder binding.
    for (const grammar of this.grammarRegistry.listRegistered()) {
      this.grammarRegistry.markLoaded(grammar.id);
    }

    this.isInitialized = true;
  }

  public async parse(source: string, languageId: LanguageId): Promise<ASTTree> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const grammar = this.grammarRegistry.getByLanguageId(languageId);
    if (!grammar) {
      // Return empty tree for unsupported languages
      return this.buildEmptyTree(source, languageId);
    }

    const parser = this.pool.acquire();
    try {
      const startTime = Date.now();
      const tree = parser.parse(source, languageId);
      void startTime; // Reserved for performance tracking in Phase 12
      return tree;
    } finally {
      this.pool.release(parser);
    }
  }

  public supportsLanguage(languageId: LanguageId): boolean {
    return this.grammarRegistry.getByLanguageId(languageId) !== undefined;
  }

  public getGrammarRegistry(): GrammarRegistry {
    return this.grammarRegistry;
  }

  public getPoolStats(): { active: number; idle: number; capacity: number } {
    return {
      active: this.pool.activeCount,
      idle: this.pool.idleCount,
      capacity: this.pool.totalCapacity,
    };
  }

  public dispose(): void {
    this.pool.disposeAll();
    this.isInitialized = false;
  }

  private buildEmptyTree(source: string, languageId: string): ASTTree {
    return {
      rootNode: {
        id: -1,
        type: 'unknown',
        isNamed: false,
        text: '',
        range: { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0, startByte: 0, endByte: 0 },
        children: [],
        hasError: false,
        isMissing: false,
      },
      languageId,
      sourceCode: source,
      hasErrors: false,
      diagnostics: [],
    };
  }
}
