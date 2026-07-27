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

export class GoExtractor implements SymbolExtractor {
  readonly languageId = 'go';
  readonly supportedExtensions = ['.go'] as const;

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
        message: `Tree-Sitter parsing encountered error nodes in Go file: ${filePath}`,
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
        message: `Skipped invalid Go node of type '${nodeType}'`,
        range: node.range,
        isSyntaxError: true,
        isMissingNode: false,
      });
    }

    // --- Process Imports ---
    if (nodeType === 'import_declaration') {
      const parsedImports = this.parseImportDeclaration(node);
      imports.push(...parsedImports);
      return;
    }

    // --- Process Functions & Receiver Methods ---
    if (nodeType === 'function_declaration' || nodeType === 'method_declaration') {
      const nameNode = node.children.find(
        (c) => c.type === 'identifier' || c.type === 'field_identifier'
      );
      if (nameNode) {
        const isExported = this.isGoExported(nameNode.text);
        if (isExported) exportsSet.add(nameNode.text);
        const receiverType = nodeType === 'method_declaration' ? this.extractReceiverType(node) : undefined;
        const kind = receiverType ? 'method' : 'function';

        const fullSymbolName = receiverType ? `${receiverType}.${nameNode.text}` : nameNode.text;
        const doc = this.extractDocComment(node);
        const signature = this.buildFunctionSignature(node, nameNode.text, receiverType);
        const symbolId = buildSymbolId(repoId, filePath, nameNode.text, receiverType, signature);

        const modifiers: string[] = [];
        if (isExported) modifiers.push('export');

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
          modifiers,
        });
      }
      return;
    }

    // --- Process Struct & Interface Types ---
    if (nodeType === 'type_declaration' || nodeType === 'type_spec') {
      const nameNode = this.findDeepNode(node, 'type_identifier');
      if (nameNode) {
        const isExported = this.isGoExported(nameNode.text);
        if (isExported) exportsSet.add(nameNode.text);

        const isInterface = node.text.includes('interface');
        const kind = isInterface ? 'interface' : 'class';
        const doc = this.extractDocComment(node);
        const signature = `${isInterface ? 'interface' : 'struct'} ${nameNode.text}`;
        const symbolId = buildSymbolId(repoId, filePath, nameNode.text, parentSymbolName, signature);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        const modifiers: string[] = [];
        if (isExported) modifiers.push('export');

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
          modifiers,
        });
      }
      return;
    }

    // --- Fallthrough Traversal ---
    for (const child of node.children) {
      this.traverseNode(child, filePath, repoId, symbols, imports, exportsSet, diagnostics, parentSymbolName);
    }
  }

  private parseImportDeclaration(node: ASTNode): ImportStatement[] {
    const results: ImportStatement[] = [];
    const stringNodes = this.findAllDeepNodes(node, 'interpreted_string_literal');

    for (const strNode of stringNodes) {
      const sourcePath = strNode.text.replace(/"/g, '');
      const isRelative = sourcePath.startsWith('.');
      results.push({
        sourcePath,
        importedSymbols: [sourcePath],
        isRelative,
        isWildcard: false,
      });
    }

    return results;
  }

  private extractReceiverType(node: ASTNode): string | undefined {
    const receiverList = node.children.find((c) => c.type === 'parameter_list');
    if (receiverList) {
      const typeNode = this.findDeepNode(receiverList, 'type_identifier');
      if (typeNode) return typeNode.text;
    }
    return undefined;
  }

  private buildFunctionSignature(node: ASTNode, name: string, receiver?: string): string {
    const paramLists = node.children.filter((c) => c.type === 'parameter_list');
    const paramsNode = receiver && paramLists.length > 1 ? paramLists[1] : paramLists[0];
    const resultNode = node.children.find(
      (c) => (c.type === 'type_identifier' || c.type === 'parameter_list') && c !== paramsNode && (!receiver || c !== paramLists[0])
    );

    const recStr = receiver ? `(${receiver}) ` : '';
    const paramsText = paramsNode ? paramsNode.text : '()';
    const resultText = resultNode ? ` ${resultNode.text}` : '';

    return `func ${recStr}${name}${paramsText}${resultText}`;
  }

  private extractDocComment(node: ASTNode): { raw?: string; model?: SymbolDoc } {
    if (node.parent) {
      const idx = node.parent.children.indexOf(node);
      if (idx > 0) {
        const prev = node.parent.children[idx - 1];
        if (prev && prev.type === 'comment') {
          const raw = prev.text.replace(/^\/\/\s*/, '').trim();
          return { raw, model: { summary: raw } };
        }
      }
    }
    return {};
  }

  private isGoExported(name: string): boolean {
    return /^[A-Z]/.test(name);
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
