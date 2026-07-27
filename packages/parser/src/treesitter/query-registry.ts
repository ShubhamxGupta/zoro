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

  return registry;
}
