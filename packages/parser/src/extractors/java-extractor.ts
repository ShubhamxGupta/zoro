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

export class JavaExtractor implements SymbolExtractor {
  readonly languageId = 'java';
  readonly supportedExtensions = ['.java'] as const;

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
        message: `Tree-Sitter parsing encountered error nodes in Java file: ${filePath}`,
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
        message: `Skipped invalid Java node of type '${nodeType}'`,
        range: node.range,
        isSyntaxError: true,
        isMissingNode: false,
      });
    }

    // --- Process Imports ---
    if (nodeType === 'import_declaration') {
      const imp = this.parseImportDeclaration(node);
      if (imp) {
        imports.push(imp);
      }
      return;
    }

    // --- Process Class Declarations ---
    if (nodeType === 'class_declaration') {
      const nameNode = node.children.find((c) => c.type === 'identifier');
      if (nameNode) {
        const modifiers = this.extractModifiers(node);
        if (modifiers.includes('public') || modifiers.includes('protected')) {
          exportsSet.add(nameNode.text);
        }

        const doc = this.extractDocComment(node);
        const signature = `class ${nameNode.text}`;
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
          modifiers,
        };
        symbols.push(classSymbol);

        const bodyNode = node.children.find((c) => c.type === 'class_body');
        if (bodyNode) {
          for (const member of bodyNode.children) {
            this.traverseNode(member, filePath, repoId, symbols, imports, exportsSet, diagnostics, fullSymbolName);
          }
        }
      }
      return;
    }

    // --- Process Interface & Enum Declarations ---
    if (nodeType === 'interface_declaration' || nodeType === 'enum_declaration') {
      const nameNode = node.children.find((c) => c.type === 'identifier');
      if (nameNode) {
        const modifiers = this.extractModifiers(node);
        if (modifiers.includes('public') || modifiers.includes('protected')) {
          exportsSet.add(nameNode.text);
        }

        const isInterface = nodeType === 'interface_declaration';
        const kind = isInterface ? 'interface' : 'enum';
        const doc = this.extractDocComment(node);
        const signature = `${isInterface ? 'interface' : 'enum'} ${nameNode.text}`;
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
          modifiers,
        });
      }
      return;
    }

    // --- Process Methods & Constructors ---
    if (nodeType === 'method_declaration' || nodeType === 'constructor_declaration') {
      const nameNode = node.children.find((c) => c.type === 'identifier');
      if (nameNode) {
        const modifiers = this.extractModifiers(node);
        const doc = this.extractDocComment(node);
        const signature = this.buildMethodSignature(node, nameNode.text);
        const symbolId = buildSymbolId(repoId, filePath, nameNode.text, parentSymbolName, signature);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: symbolId,
          symbolId,
          name: fullSymbolName,
          kind: 'method',
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

  private parseImportDeclaration(node: ASTNode): ImportStatement | null {
    const nameNode = this.findDeepNode(node, 'scoped_identifier') || this.findDeepNode(node, 'identifier');
    if (!nameNode) return null;

    const sourcePath = nameNode.text;
    const isWildcard = node.text.includes('*');

    return {
      sourcePath,
      importedSymbols: [sourcePath],
      isRelative: false,
      isWildcard,
    };
  }

  private buildMethodSignature(node: ASTNode, name: string): string {
    const paramsNode = node.children.find((c) => c.type === 'formal_parameters');
    const returnTypeNode = node.children.find(
      (c) => c.type === 'type_identifier' || c.type === 'void_type' || c.type === 'integral_type'
    );

    const paramsText = paramsNode ? paramsNode.text : '()';
    const returnTypeText = returnTypeNode ? `${returnTypeNode.text} ` : '';

    return `${returnTypeText}${name}${paramsText}`;
  }

  private extractDocComment(node: ASTNode): { raw?: string; model?: SymbolDoc } {
    if (node.parent) {
      const idx = node.parent.children.indexOf(node);
      if (idx > 0) {
        const prev = node.parent.children[idx - 1];
        if (prev && (prev.type === 'comment' || prev.type.includes('comment'))) {
          const raw = this.cleanDocComment(prev.text);
          return { raw, model: { summary: raw } };
        }
      }
    }
    return {};
  }

  private cleanDocComment(text: string): string {
    return text
      .replace(/^\/\*\*?/, '')
      .replace(/\*\/$/, '')
      .split('\n')
      .map((line) => line.replace(/^\s*\*?\s?/, '').trim())
      .filter(Boolean)
      .join(' ');
  }

  private extractModifiers(node: ASTNode): string[] {
    const modifiers: string[] = [];
    const text = node.text;

    if (text.includes('public ')) modifiers.push('public');
    if (text.includes('private ')) modifiers.push('private');
    if (text.includes('protected ')) modifiers.push('protected');
    if (text.includes('static ')) modifiers.push('static');
    if (text.includes('final ')) modifiers.push('final');
    if (text.includes('abstract ')) modifiers.push('abstract');

    return Array.from(new Set(modifiers));
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
}
