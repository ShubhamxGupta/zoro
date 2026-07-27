import type {
  ASTNode,
  ASTTree,
  SymbolNode,
  ImportStatement,
  SymbolKind,
  Location,
  SymbolDoc,
  ParseDiagnostic,
} from '@repo-intel/shared';
import { buildSymbolId } from '@repo-intel/shared';
import type { SymbolExtractor, ExtractedFileSymbols } from './extractor.interface.js';

export class TypeScriptExtractor implements SymbolExtractor {
  readonly languageId = 'typescript';
  readonly supportedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'] as const;

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
        message: `Tree-Sitter parsing encountered error nodes in file: ${filePath}`,
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
        message: `Skipped invalid node of type '${nodeType}'`,
        range: node.range,
        isSyntaxError: true,
        isMissingNode: false,
      });
    }

    // --- Process Imports ---
    if (nodeType === 'import_statement') {
      const imp = this.parseImportStatement(node);
      if (imp) {
        imports.push(imp);
      }
      return;
    }

    // --- Process Exports ---
    if (nodeType === 'export_statement') {
      this.parseExportStatement(node, exportsSet);
    }

    // --- Process Class Declarations ---
    if (nodeType === 'class_declaration' || nodeType === 'abstract_class_declaration') {
      const nameNode = node.children.find(
        (c) => c.type === 'type_identifier' || c.type === 'identifier'
      );
      if (nameNode) {
        const isExported = this.hasExportModifier(node);
        if (isExported) exportsSet.add(nameNode.text);

        const { raw: rawDoc, model: docModel } = this.extractDocComment(node);
        const modifiers = this.extractModifiers(node);
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
          documentation: rawDoc,
          docModel,
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

    // --- Process Interface Declarations ---
    if (nodeType === 'interface_declaration') {
      const nameNode = node.children.find((c) => c.type === 'type_identifier' || c.type === 'identifier');
      if (nameNode) {
        if (this.hasExportModifier(node)) exportsSet.add(nameNode.text);

        const { raw: rawDoc, model: docModel } = this.extractDocComment(node);
        const modifiers = this.extractModifiers(node);
        const signature = `interface ${nameNode.text}`;
        const symbolId = buildSymbolId(repoId, filePath, nameNode.text, parentSymbolName, signature);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: symbolId,
          symbolId,
          name: fullSymbolName,
          kind: 'interface',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature,
          documentation: rawDoc,
          docModel,
          modifiers,
        });
      }
      return;
    }

    // --- Process Type Aliases ---
    if (nodeType === 'type_alias_declaration') {
      const nameNode = node.children.find((c) => c.type === 'type_identifier' || c.type === 'identifier');
      if (nameNode) {
        if (this.hasExportModifier(node)) exportsSet.add(nameNode.text);

        const { raw: rawDoc, model: docModel } = this.extractDocComment(node);
        const signature = `type ${nameNode.text}`;
        const symbolId = buildSymbolId(repoId, filePath, nameNode.text, parentSymbolName, signature);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: symbolId,
          symbolId,
          name: fullSymbolName,
          kind: 'type_alias',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature,
          documentation: rawDoc,
          docModel,
          modifiers: this.extractModifiers(node),
        });
      }
      return;
    }

    // --- Process Enums ---
    if (nodeType === 'enum_declaration') {
      const nameNode = node.children.find((c) => c.type === 'identifier' || c.type === 'type_identifier');
      if (nameNode) {
        if (this.hasExportModifier(node)) exportsSet.add(nameNode.text);

        const { raw: rawDoc, model: docModel } = this.extractDocComment(node);
        const signature = `enum ${nameNode.text}`;
        const symbolId = buildSymbolId(repoId, filePath, nameNode.text, parentSymbolName, signature);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: symbolId,
          symbolId,
          name: fullSymbolName,
          kind: 'enum',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature,
          documentation: rawDoc,
          docModel,
          modifiers: this.extractModifiers(node),
        });
      }
      return;
    }

    // --- Process Functions ---
    if (nodeType === 'function_declaration' || nodeType === 'generator_function_declaration') {
      const nameNode = node.children.find((c) => c.type === 'identifier');
      if (nameNode) {
        if (this.hasExportModifier(node)) exportsSet.add(nameNode.text);

        const { raw: rawDoc, model: docModel } = this.extractDocComment(node);
        const modifiers = this.extractModifiers(node);
        const signature = this.buildFunctionSignature(node, nameNode.text);
        const symbolId = buildSymbolId(repoId, filePath, nameNode.text, parentSymbolName, signature);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: symbolId,
          symbolId,
          name: fullSymbolName,
          kind: 'function',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature,
          documentation: rawDoc,
          docModel,
          modifiers,
        });
      }
      return;
    }

    // --- Process Methods ---
    if (nodeType === 'method_definition' || nodeType === 'abstract_method_signature') {
      const nameNode = node.children.find(
        (c) => c.type === 'property_identifier' || c.type === 'identifier'
      );
      if (nameNode) {
        const { raw: rawDoc, model: docModel } = this.extractDocComment(node);
        const modifiers = this.extractModifiers(node);
        const signature = this.buildFunctionSignature(node, nameNode.text);
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
          documentation: rawDoc,
          docModel,
          modifiers,
        });
      }
      return;
    }

    // --- Process Variable Declarations ---
    if (nodeType === 'lexical_declaration' || nodeType === 'variable_declaration') {
      const isConst = node.text.startsWith('const');
      const isExported = this.hasExportModifier(node);

      for (const child of node.children) {
        if (child.type === 'variable_declarator') {
          const nameNode = child.children.find((c) => c.type === 'identifier');
          if (nameNode) {
            if (isExported) exportsSet.add(nameNode.text);

            const valueNode = child.children.find(
              (c) => c.type === 'arrow_function' || c.type === 'function_expression'
            );
            const kind: SymbolKind = valueNode ? 'function' : isConst ? 'constant' : 'variable';
            const { raw: rawDoc, model: docModel } = this.extractDocComment(node);
            const modifiers = this.extractModifiers(node);
            const signature = valueNode
              ? this.buildFunctionSignature(valueNode, nameNode.text)
              : `${isConst ? 'const' : 'let'} ${nameNode.text}`;
            const symbolId = buildSymbolId(repoId, filePath, nameNode.text, parentSymbolName, signature);
            const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

            symbols.push({
              id: symbolId,
              symbolId,
              name: fullSymbolName,
              kind,
              fileId: filePath,
              location: this.nodeToLocation(child, filePath),
              signature,
              documentation: rawDoc,
              docModel,
              modifiers,
            });
          }
        }
      }
      return;
    }

    // --- Fallthrough Traversal ---
    for (const child of node.children) {
      this.traverseNode(child, filePath, repoId, symbols, imports, exportsSet, diagnostics, parentSymbolName);
    }
  }

  private parseImportStatement(node: ASTNode): ImportStatement | null {
    const stringNode = this.findDeepNode(node, 'string') || this.findDeepNode(node, 'string_fragment');
    if (!stringNode) return null;

    const sourcePath = stringNode.text.replace(/['"]/g, '');
    const isRelative = sourcePath.startsWith('.');
    const isWildcard = node.text.includes('* as');

    const importedSymbols: string[] = [];
    const specifiers = this.findAllDeepNodes(node, 'import_specifier');
    for (const spec of specifiers) {
      const aliasOrName = spec.children[spec.children.length - 1];
      if (aliasOrName) {
        importedSymbols.push(aliasOrName.text);
      }
    }

    if (importedSymbols.length === 0) {
      const clause = node.children.find((c) => c.type === 'import_clause');
      if (clause) {
        const idNode = clause.children.find((c) => c.type === 'identifier');
        if (idNode) {
          importedSymbols.push(idNode.text);
        }
      }
    }

    return {
      sourcePath,
      importedSymbols,
      isRelative,
      isWildcard,
    };
  }

  private parseExportStatement(node: ASTNode, exportsSet: Set<string>): void {
    const specifiers = this.findAllDeepNodes(node, 'export_specifier');
    for (const spec of specifiers) {
      const nameNode = spec.children[spec.children.length - 1];
      if (nameNode) {
        exportsSet.add(nameNode.text);
      }
    }

    if (node.text.includes('export default')) {
      exportsSet.add('default');
    }
  }

  private buildFunctionSignature(node: ASTNode, name: string): string {
    const paramsNode = node.children.find(
      (c) => c.type === 'formal_parameters' || c.type === 'parameters'
    );
    const returnTypeNode = node.children.find(
      (c) => c.type === 'type_annotation' || c.type === 'type_identifier'
    );

    const paramsText = paramsNode ? paramsNode.text : '()';
    const returnTypeText = returnTypeNode ? `: ${returnTypeNode.text.replace(/^:\s*/, '')}` : '';

    return `${name}${paramsText}${returnTypeText}`;
  }

  private extractDocComment(node: ASTNode): { raw?: string; model?: SymbolDoc } {
    let commentText: string | undefined;

    if (node.parent) {
      const idx = node.parent.children.indexOf(node);
      if (idx > 0) {
        const prev = node.parent.children[idx - 1];
        if (prev && (prev.type === 'comment' || prev.type.includes('comment'))) {
          commentText = prev.text;
        }
      }
    }

    if (!commentText) {
      return {};
    }

    const raw = this.cleanDocComment(commentText);
    const model = this.parseDocModel(raw);

    return { raw, model };
  }

  private parseDocModel(rawDoc: string): SymbolDoc {
    const lines = rawDoc.split('\n').map((l) => l.trim()).filter(Boolean);
    const summaryLines: string[] = [];
    const params: Array<{ name: string; description: string }> = [];
    let returns: string | undefined;
    const examples: string[] = [];
    const throws: string[] = [];
    let deprecated: boolean | string | undefined;

    for (const line of lines) {
      if (line.startsWith('@param')) {
        const parts = line.replace('@param', '').trim().split(/\s+/);
        const name = parts[0] || 'param';
        const description = parts.slice(1).join(' ');
        params.push({ name, description });
      } else if (line.startsWith('@returns') || line.startsWith('@return')) {
        returns = line.replace(/@returns?/, '').trim();
      } else if (line.startsWith('@example')) {
        examples.push(line.replace('@example', '').trim());
      } else if (line.startsWith('@throws')) {
        throws.push(line.replace('@throws', '').trim());
      } else if (line.startsWith('@deprecated')) {
        const depReason = line.replace('@deprecated', '').trim();
        deprecated = depReason.length > 0 ? depReason : true;
      } else {
        summaryLines.push(line);
      }
    }

    return {
      summary: summaryLines.join(' '),
      parameters: params.length > 0 ? params : undefined,
      returns,
      examples: examples.length > 0 ? examples : undefined,
      throws: throws.length > 0 ? throws : undefined,
      deprecated,
    };
  }

  private cleanDocComment(text: string): string {
    return text
      .replace(/^\/\*\*?/, '')
      .replace(/\*\/$/, '')
      .split('\n')
      .map((line) => line.replace(/^\s*\*?\s?/, '').trim())
      .filter(Boolean)
      .join('\n');
  }

  private extractModifiers(node: ASTNode): string[] {
    const modifiers: string[] = [];
    const text = node.text;

    if (text.includes('export ')) modifiers.push('export');
    if (text.includes('async ')) modifiers.push('async');
    if (text.includes('static ')) modifiers.push('static');
    if (text.includes('readonly ')) modifiers.push('readonly');
    if (text.includes('private ')) modifiers.push('private');
    if (text.includes('protected ')) modifiers.push('protected');
    if (text.includes('public ')) modifiers.push('public');
    if (text.includes('abstract ')) modifiers.push('abstract');

    return Array.from(new Set(modifiers));
  }

  private hasExportModifier(node: ASTNode): boolean {
    if (node.text.startsWith('export ') || node.text.includes(' export ')) {
      return true;
    }
    if (node.parent && node.parent.type === 'export_statement') {
      return true;
    }
    return false;
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
