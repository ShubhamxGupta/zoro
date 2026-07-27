import type { FileNode, DeltaResult } from '@repo-intel/shared';
import type { SymbolExtractor } from '../extractors/extractor.interface.js';
import type { TreeSitterManager } from '../treesitter/tree-sitter-manager.js';

export interface IncrementalExtractionResult {
  fileNodes: Map<string, FileNode>;
  reparsedCount: number;
  cachedCount: number;
  durationMs: number;
}

export class IncrementalExtractor {
  private readonly fileCache = new Map<string, FileNode>();

  constructor(
    private readonly treeSitterManager: TreeSitterManager,
    private readonly extractors: Map<string, SymbolExtractor>
  ) {}

  public async processDelta(
    delta: DeltaResult,
    fileContents: Map<string, string>,
    repoId = 'local-repo'
  ): Promise<IncrementalExtractionResult> {
    const startTime = Date.now();
    let reparsedCount = 0;
    let cachedCount = 0;

    // Purge deleted files from cache
    for (const deletedPath of delta.deleted) {
      this.fileCache.delete(deletedPath);
    }

    const filesToProcess = [...delta.added, ...delta.modified];

    for (const record of filesToProcess) {
      const filePath = record.relativePath;
      const source = fileContents.get(filePath) ?? '';
      const languageId = this.detectLanguageId(filePath);
      const extractor = this.extractors.get(languageId);

      if (!extractor) {
        continue;
      }

      const tree = await this.treeSitterManager.parse(source, languageId as any);
      const extracted = extractor.extract(tree, filePath, repoId);

      const fileNode: FileNode = {
        id: `${repoId}::file::${filePath}`,
        path: filePath,
        sha256: record.sha256 ?? '',
        language: languageId,
        loc: extracted.loc,
        symbols: extracted.symbols,
        imports: extracted.imports,
        exports: extracted.exports,
      };

      this.fileCache.set(filePath, fileNode);
      reparsedCount++;
    }

    // Count unchanged files served from cache
    for (const record of delta.unchanged) {
      if (this.fileCache.has(record.relativePath)) {
        cachedCount++;
      }
    }

    return {
      fileNodes: new Map(this.fileCache),
      reparsedCount,
      cachedCount,
      durationMs: Date.now() - startTime,
    };
  }

  public getCachedFileNode(filePath: string): FileNode | undefined {
    return this.fileCache.get(filePath);
  }

  public clearCache(): void {
    this.fileCache.clear();
  }

  private detectLanguageId(filePath: string): string {
    if (/\.(ts|tsx)$/.test(filePath)) return 'typescript';
    if (/\.(js|jsx|mjs|cjs)$/.test(filePath)) return 'javascript';
    if (/\.py$/.test(filePath)) return 'python';
    if (/\.go$/.test(filePath)) return 'go';
    return 'unknown';
  }
}
