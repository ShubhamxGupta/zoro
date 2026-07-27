import type {
  ASTNode,
  ASTTree,
  SymbolNode,
  ImportStatement,
  Location,
  SymbolDoc,
  ParseDiagnostic,
} from '@repo-intel/shared';
import { buildSymbolId } from '@repo-intel/shared';
import type { SymbolExtractor, ExtractedFileSymbols } from './extractor.interface.js';

export class PythonExtractor implements SymbolExtractor {
  readonly languageId = 'python';
  readonly supportedExtensions = ['.py', '.pyi'] as const;

  extract(tree: ASTTree, filePath: string, repoId = 'local-repo'): ExtractedFileSymbols {
    const symbols: SymbolNode[] = [];
    const imports: ImportStatement[] = [];
    const exportsSet = new Set<string>();
    const diagnostics: ParseDiagnostic[] = [...(tree.diagnostics ?? [])];

    const lines = tree.sourceCode ? tree.sourceCode.split('\n') : [];
    const loc = Math.max(1, lines.length);

    if (!tree.rootNode) {
      return { symbols, imports, exports: [], loc, diagnostics };
    }

    if (tree.hasErrors) {
      diagnostics.push({
        severity: 'warning',
        message: `Tree-Sitter parsing encountered error nodes in Python file: ${filePath}`,
        range: tree.rootNode.range,
        isSyntaxError: true,
        isMissingNode: false,
      });
    }

    this.traverseNode(tree.rootNode, filePath, repoId, symbols, imports, exportsSet, diagnostics, undefined);

    return {
      symbols,
      imports,
      exports: Array.from(exportsSet),
      loc,
      diagnostics,
    };
  }

  private traverseNode(
    node: ASTNode,
    filePath: string,
    repoId: string,
    symbols: SymbolNode[],
    imports: ImportStatement[],
    exportsSet: Set<string>,
    diagnostics: ParseDiagnostic[],
    parentSymbolName?: string
  ): void {
    const nodeType = node.type;

    if (node.hasError) {
      diagnostics.push({
        severity: 'info',
        message: `Skipped invalid Python node of type '${nodeType}'`,
        range: node.range,
        isSyntaxError: true,
        isMissingNode: false,
      });
    }

    // --- Process Imports ---
    if (nodeType === 'import_statement' || nodeType === 'import_from_statement') {
      const imp = this.parseImportStatement(node);
      if (imp) {
        imports.push(imp);
      }
      return;
    }

    // --- Process Class Definitions ---
    if (nodeType === 'class_definition') {
      const nameNode = node.children.find((c) => c.type === 'identifier');
      if (nameNode) {
        if (!nameNode.text.startsWith('_')) {
          exportsSet.add(nameNode.text);
        }

        const doc = this.extractDocstring(node);
        const signature = this.buildClassSignature(node, nameNode.text);
        const symbolId = buildSymbolId(repoId, filePath, nameNode.text, parentSymbolName, signature);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        const classSymbol: SymbolNode = {
          id: symbolId,
          symbolId,
          name: fullSymbolName,
          kind: 'class',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature,
          documentation: doc.raw,
          docModel: doc.model,
          modifiers: this.extractModifiers(node),
        };
        symbols.push(classSymbol);

        const bodyNode = node.children.find((c) => c.type === 'block');
        if (bodyNode) {
          for (const member of bodyNode.children) {
            this.traverseNode(member, filePath, repoId, symbols, imports, exportsSet, diagnostics, fullSymbolName);
          }
        }
      }
      return;
    }

    // --- Process Function Definitions ---
    if (nodeType === 'function_definition') {
      const nameNode = node.children.find((c) => c.type === 'identifier');
      if (nameNode) {
        if (!nameNode.text.startsWith('_')) {
          exportsSet.add(nameNode.text);
        }

        const isMethod = parentSymbolName !== undefined;
        const kind = isMethod ? 'method' : 'function';
        const doc = this.extractDocstring(node);
        const signature = this.buildFunctionSignature(node, nameNode.text);
        const symbolId = buildSymbolId(repoId, filePath, nameNode.text, parentSymbolName, signature);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: symbolId,
          symbolId,
          name: fullSymbolName,
          kind,
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature,
          documentation: doc.raw,
          docModel: doc.model,
          modifiers: this.extractModifiers(node),
        });
      }
      return;
    }

    // --- Fallthrough Traversal ---
    for (const child of node.children) {
      this.traverseNode(child, filePath, repoId, symbols, imports, exportsSet, diagnostics, parentSymbolName);
    }
  }

  private parseImportStatement(node: ASTNode): ImportStatement | null {
    if (node.type === 'import_statement') {
      const dottedName = this.findDeepNode(node, 'dotted_name') || this.findDeepNode(node, 'identifier');
      if (!dottedName) return null;
      const sourcePath = dottedName.text;
      return {
        sourcePath,
        importedSymbols: [sourcePath],
        isRelative: sourcePath.startsWith('.'),
        isWildcard: false,
      };
    }

    if (node.type === 'import_from_statement') {
      const moduleNode = this.findDeepNode(node, 'relative_import') || this.findDeepNode(node, 'dotted_name');
      const sourcePath = moduleNode ? moduleNode.text : '.';
      const isRelative = sourcePath.startsWith('.');

      const importedSymbols: string[] = [];
      const names = this.findAllDeepNodes(node, 'identifier');
      for (const name of names) {
        if (moduleNode && name.text === moduleNode.text) continue;
        importedSymbols.push(name.text);
      }

      const isWildcard = node.text.includes('*');

      return {
        sourcePath,
        importedSymbols,
        isRelative,
        isWildcard,
      };
    }

    return null;
  }

  private buildClassSignature(node: ASTNode, name: string): string {
    const superclasses = node.children.find((c) => c.type === 'argument_list');
    const heritage = superclasses ? superclasses.text : '';
    return `class ${name}${heritage}`;
  }

  private buildFunctionSignature(node: ASTNode, name: string): string {
    const params = node.children.find((c) => c.type === 'parameters');
    const returnType = node.children.find((c) => c.type === 'type');

    const paramsText = params ? params.text : '()';
    const returnTypeText = returnType ? ` -> ${returnType.text}` : '';
    const asyncPrefix = node.text.startsWith('async ') ? 'async ' : '';

    return `${asyncPrefix}def ${name}${paramsText}${returnTypeText}`;
  }

  private extractDocstring(node: ASTNode): { raw?: string; model?: SymbolDoc } {
    const bodyNode = node.children.find((c) => c.type === 'block');
    if (!bodyNode) return {};

    const firstExpr = bodyNode.children.find((c) => c.type === 'expression_statement');
    if (!firstExpr) return {};

    const strNode = firstExpr.children.find((c) => c.type === 'string');
    if (!strNode) return {};

    const raw = strNode.text.replace(/^("""|'''|"|')/, '').replace(/("""|'''|"|')$/, '').trim();
    const model = this.parsePythonDocModel(raw);

    return { raw, model };
  }

  private parsePythonDocModel(rawDoc: string): SymbolDoc {
    const lines = rawDoc.split('\n').map((l) => l.trim()).filter(Boolean);
    const summary = lines[0] || '';
    const params: Array<{ name: string; description: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.includes(':param') || line.startsWith(':')) {
        const parts = line.replace(/^:\s*/, '').split(/\s*:\s*/);
        if (parts.length >= 2) {
          params.push({ name: parts[0]!.replace(/^param\s+/, ''), description: parts[1]! });
        }
      }
    }

    return {
      summary,
      parameters: params.length > 0 ? params : undefined,
    };
  }

  private extractModifiers(node: ASTNode): string[] {
    const modifiers: string[] = [];
    if (node.text.startsWith('async ')) modifiers.push('async');
    if (node.text.includes('@classmethod')) modifiers.push('classmethod');
    if (node.text.includes('@staticmethod')) modifiers.push('staticmethod');
    return modifiers;
  }

  private nodeToLocation(node: ASTNode, filePath: string): Location {
    return {
      filePath,
      startLine: node.range.startLine,
      startColumn: node.range.startColumn,
      endLine: node.range.endLine,
      endColumn: node.range.endColumn,
      startByte: node.range.startByte,
      endByte: node.range.endByte,
    };
  }

  private findDeepNode(node: ASTNode, typeName: string): ASTNode | undefined {
    if (node.type === typeName) return node;
    for (const child of node.children) {
      const found = this.findDeepNode(child, typeName);
      if (found) return found;
    }
    return undefined;
  }

  private findAllDeepNodes(node: ASTNode, typeName: string): ASTNode[] {
    const results: ASTNode[] = [];
    if (node.type === typeName) results.push(node);
    for (const child of node.children) {
      results.push(...this.findAllDeepNodes(child, typeName));
    }
    return results;
  }
}
