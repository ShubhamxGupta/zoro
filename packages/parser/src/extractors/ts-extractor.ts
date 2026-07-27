import type { ASTNode, ASTTree, SymbolNode, ImportStatement, SymbolKind, Location } from '@repo-intel/shared';
import type { SymbolExtractor, ExtractedFileSymbols } from './extractor.interface.js';

export class TypeScriptExtractor implements SymbolExtractor {
  readonly languageId = 'typescript';
  readonly supportedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'] as const;

  extract(tree: ASTTree, filePath: string): ExtractedFileSymbols {
    const symbols: SymbolNode[] = [];
    const imports: ImportStatement[] = [];
    const exportsSet = new Set<string>();

    const lines = tree.sourceCode ? tree.sourceCode.split('\n') : [];
    const loc = Math.max(1, lines.length);

    if (!tree.rootNode) {
      return { symbols, imports, exports: [], loc };
    }

    this.traverseNode(tree.rootNode, filePath, symbols, imports, exportsSet, undefined);

    return {
      symbols,
      imports,
      exports: Array.from(exportsSet),
      loc,
    };
  }

  private traverseNode(
    node: ASTNode,
    filePath: string,
    symbols: SymbolNode[],
    imports: ImportStatement[],
    exportsSet: Set<string>,
    parentSymbolName?: string
  ): void {
    const nodeType = node.type;

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
      // Fall through to traverse child declarations inside export statement (e.g. export function ...)
    }

    // --- Process Class Declarations ---
    if (nodeType === 'class_declaration' || nodeType === 'abstract_class_declaration') {
      const nameNode = node.children.find(
        (c) => c.type === 'type_identifier' || c.type === 'identifier'
      );
      if (nameNode) {
        const isExported = this.hasExportModifier(node);
        if (isExported) exportsSet.add(nameNode.text);

        const doc = this.extractDocComment(node);
        const modifiers = this.extractModifiers(node);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        const classSymbol: SymbolNode = {
          id: `${filePath}::${fullSymbolName}#L${node.range.startLine}`,
          name: fullSymbolName,
          kind: 'class',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature: `class ${nameNode.text}`,
          documentation: doc,
          modifiers,
        };
        symbols.push(classSymbol);

        // Process class members
        const bodyNode = node.children.find((c) => c.type === 'class_body');
        if (bodyNode) {
          for (const member of bodyNode.children) {
            this.traverseNode(member, filePath, symbols, imports, exportsSet, fullSymbolName);
          }
        }
      }
      return;
    }

    // --- Process Interface Declarations ---
    if (nodeType === 'interface_declaration') {
      const nameNode = node.children.find((c) => c.type === 'type_identifier' || c.type === 'identifier');
      if (nameNode) {
        const isExported = this.hasExportModifier(node);
        if (isExported) exportsSet.add(nameNode.text);

        const doc = this.extractDocComment(node);
        const modifiers = this.extractModifiers(node);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        const interfaceSymbol: SymbolNode = {
          id: `${filePath}::${fullSymbolName}#L${node.range.startLine}`,
          name: fullSymbolName,
          kind: 'interface',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature: `interface ${nameNode.text}`,
          documentation: doc,
          modifiers,
        };
        symbols.push(interfaceSymbol);
      }
      return;
    }

    // --- Process Type Aliases ---
    if (nodeType === 'type_alias_declaration') {
      const nameNode = node.children.find((c) => c.type === 'type_identifier' || c.type === 'identifier');
      if (nameNode) {
        if (this.hasExportModifier(node)) exportsSet.add(nameNode.text);

        const doc = this.extractDocComment(node);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: `${filePath}::${fullSymbolName}#L${node.range.startLine}`,
          name: fullSymbolName,
          kind: 'type_alias',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature: `type ${nameNode.text}`,
          documentation: doc,
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

        const doc = this.extractDocComment(node);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: `${filePath}::${fullSymbolName}#L${node.range.startLine}`,
          name: fullSymbolName,
          kind: 'enum',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature: `enum ${nameNode.text}`,
          documentation: doc,
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

        const doc = this.extractDocComment(node);
        const modifiers = this.extractModifiers(node);
        const signature = this.buildFunctionSignature(node, nameNode.text);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: `${filePath}::${fullSymbolName}#L${node.range.startLine}`,
          name: fullSymbolName,
          kind: 'function',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature,
          documentation: doc,
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
        const doc = this.extractDocComment(node);
        const modifiers = this.extractModifiers(node);
        const signature = this.buildFunctionSignature(node, nameNode.text);
        const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

        symbols.push({
          id: `${filePath}::${fullSymbolName}#L${node.range.startLine}`,
          name: fullSymbolName,
          kind: 'method',
          fileId: filePath,
          location: this.nodeToLocation(node, filePath),
          signature,
          documentation: doc,
          modifiers,
        });
      }
      return;
    }

    // --- Process Variable Declarations (Const / Let / Var / Arrow functions) ---
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
            const doc = this.extractDocComment(node);
            const modifiers = this.extractModifiers(node);
            const signature = valueNode
              ? this.buildFunctionSignature(valueNode, nameNode.text)
              : `${isConst ? 'const' : 'let'} ${nameNode.text}`;
            const fullSymbolName = parentSymbolName ? `${parentSymbolName}.${nameNode.text}` : nameNode.text;

            symbols.push({
              id: `${filePath}::${fullSymbolName}#L${node.range.startLine}`,
              name: fullSymbolName,
              kind,
              fileId: filePath,
              location: this.nodeToLocation(child, filePath),
              signature,
              documentation: doc,
              modifiers,
            });
          }
        }
      }
      return;
    }

    // --- Recursive Fallthrough for general AST containers ---
    for (const child of node.children) {
      this.traverseNode(child, filePath, symbols, imports, exportsSet, parentSymbolName);
    }
  }

  private parseImportStatement(node: ASTNode): ImportStatement | null {
    // Extract module source path string (e.g. 'foo' from import { x } from 'foo')
    const stringNode = this.findDeepNode(node, 'string') || this.findDeepNode(node, 'string_fragment');
    if (!stringNode) {
      return null;
    }

    const sourcePath = stringNode.text.replace(/['"]/g, '');
    const isRelative = sourcePath.startsWith('.');
    const isWildcard = node.text.includes('* as');

    const importedSymbols: string[] = [];

    // Extract named imports
    const specifiers = this.findAllDeepNodes(node, 'import_specifier');
    for (const spec of specifiers) {
      const aliasOrName = spec.children[spec.children.length - 1];
      if (aliasOrName) {
        importedSymbols.push(aliasOrName.text);
      }
    }

    // Default import or namespace import if empty specifiers
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
    // Named export specifiers: export { a, b as c }
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

  private extractDocComment(node: ASTNode): string | undefined {
    // Check if node itself or parent contains comment
    if (node.parent) {
      const idx = node.parent.children.indexOf(node);
      if (idx > 0) {
        const prev = node.parent.children[idx - 1];
        if (prev && (prev.type === 'comment' || prev.type.includes('comment'))) {
          return this.cleanDocComment(prev.text);
        }
      }
    }
    return undefined;
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
