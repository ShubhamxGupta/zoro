/**
 * Tree-Sitter Query Registry — Loads and manages S-expression query files
 * indexed by language ID and query type.
 */

export type QueryType = 'symbols' | 'imports' | 'calls' | 'highlights';

export interface QueryEntry {
  languageId: string;
  queryType: QueryType;
  content: string;
}

export class QueryRegistry {
  private readonly queries = new Map<string, QueryEntry>();

  public registerQuery(languageId: string, queryType: QueryType, content: string): void {
    const key = this.buildKey(languageId, queryType);
    this.queries.set(key, { languageId, queryType, content });
  }

  public getQuery(languageId: string, queryType: QueryType): string | undefined {
    const key = this.buildKey(languageId, queryType);
    return this.queries.get(key)?.content;
  }

  public hasQuery(languageId: string, queryType: QueryType): boolean {
    const key = this.buildKey(languageId, queryType);
    return this.queries.has(key);
  }

  public listRegisteredQueries(): QueryEntry[] {
    return Array.from(this.queries.values());
  }

  public clear(): void {
    this.queries.clear();
  }

  private buildKey(languageId: string, queryType: QueryType): string {
    return `${languageId.toLowerCase()}::${queryType.toLowerCase()}`;
  }
}

/**
 * Creates default QueryRegistry pre-populated with standard query manifests.
 */
export function createDefaultQueryRegistry(): QueryRegistry {
  const registry = new QueryRegistry();

  const tsSymbolsQuery = `; TypeScript / JavaScript Symbol Extraction Queries
(function_declaration name: (identifier) @function.name) @function.def
(generator_function_declaration name: (identifier) @function.name) @function.def
(class_declaration name: (type_identifier) @class.name) @class.def
(interface_declaration name: (type_identifier) @interface.name) @interface.def
(type_alias_declaration name: (type_identifier) @type_alias.name) @type_alias.def
(enum_declaration name: (identifier) @enum.name) @enum.def
(import_statement) @import.statement
(export_statement) @export.statement
(comment) @comment.node
`;

  registry.registerQuery('typescript', 'symbols', tsSymbolsQuery);
  registry.registerQuery('javascript', 'symbols', tsSymbolsQuery);

  const pySymbolsQuery = `; Python Symbol Extraction S-Expression Queries
(function_definition name: (identifier) @function.name) @function.def
(class_definition name: (identifier) @class.name) @class.def
(import_statement) @import.statement
(import_from_statement) @import.from_statement
(comment) @comment.node
`;
  registry.registerQuery('python', 'symbols', pySymbolsQuery);

  const goSymbolsQuery = `; Go Symbol Extraction S-Expression Queries
(function_declaration name: (identifier) @function.name) @function.def
(method_declaration name: (field_identifier) @method.name) @method.def
(type_declaration (type_spec name: (type_identifier) @type.name)) @type.def
(import_declaration) @import.statement
(comment) @comment.node
`;
  registry.registerQuery('go', 'symbols', goSymbolsQuery);

  const javaSymbolsQuery = `; Java Symbol Extraction S-Expression Queries
(class_declaration name: (identifier) @class.name) @class.def
(interface_declaration name: (identifier) @interface.name) @interface.def
(enum_declaration name: (identifier) @enum.name) @enum.def
(method_declaration name: (identifier) @method.name) @method.def
(constructor_declaration name: (identifier) @constructor.name) @constructor.def
(import_declaration) @import.statement
(comment) @comment.node
`;
  registry.registerQuery('java', 'symbols', javaSymbolsQuery);

  return registry;
}
