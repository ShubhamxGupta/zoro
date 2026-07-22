export type GrammarBindingType = 'wasm' | 'native' | 'placeholder';

export interface GrammarCapabilities {
  supportsRangeQuery: boolean;
  supportsNodeTypes: boolean;
  supportsIncrementalParsing: boolean;
}

export interface GrammarEntry {
  id: string;
  languageId: string;
  displayName: string;
  version: string;
  bindingType: GrammarBindingType;
  wasmPath?: string;
  nativeBindingPath?: string;
  capabilities: GrammarCapabilities;
  isLoaded: boolean;
}

export class GrammarRegistry {
  private grammars = new Map<string, GrammarEntry>();

  public register(entry: GrammarEntry): void {
    this.grammars.set(entry.id, entry);
  }

  public get(grammarId: string): GrammarEntry | undefined {
    return this.grammars.get(grammarId);
  }

  public getByLanguageId(languageId: string): GrammarEntry | undefined {
    for (const entry of this.grammars.values()) {
      if (entry.languageId === languageId) return entry;
    }
    return undefined;
  }

  public has(grammarId: string): boolean {
    return this.grammars.has(grammarId);
  }

  public markLoaded(grammarId: string): void {
    const entry = this.grammars.get(grammarId);
    if (entry) {
      this.grammars.set(grammarId, { ...entry, isLoaded: true });
    }
  }

  public listRegistered(): GrammarEntry[] {
    return Array.from(this.grammars.values());
  }

  public clear(): void {
    this.grammars.clear();
  }
}

// Default grammar registry pre-populated with known grammars (WASM paths TBD)
export function createDefaultGrammarRegistry(): GrammarRegistry {
  const registry = new GrammarRegistry();
  const defaultGrammars: Array<Omit<GrammarEntry, 'isLoaded'>> = [
    {
      id: 'typescript',
      languageId: 'typescript',
      displayName: 'TypeScript / TSX',
      version: '0.23.0',
      bindingType: 'placeholder',
      capabilities: { supportsRangeQuery: true, supportsNodeTypes: true, supportsIncrementalParsing: true },
    },
    {
      id: 'javascript',
      languageId: 'javascript',
      displayName: 'JavaScript / JSX',
      version: '0.23.0',
      bindingType: 'placeholder',
      capabilities: { supportsRangeQuery: true, supportsNodeTypes: true, supportsIncrementalParsing: true },
    },
    {
      id: 'python',
      languageId: 'python',
      displayName: 'Python',
      version: '0.23.0',
      bindingType: 'placeholder',
      capabilities: { supportsRangeQuery: true, supportsNodeTypes: true, supportsIncrementalParsing: false },
    },
    {
      id: 'go',
      languageId: 'go',
      displayName: 'Go',
      version: '0.23.0',
      bindingType: 'placeholder',
      capabilities: { supportsRangeQuery: true, supportsNodeTypes: true, supportsIncrementalParsing: false },
    },
    {
      id: 'rust',
      languageId: 'rust',
      displayName: 'Rust',
      version: '0.23.0',
      bindingType: 'placeholder',
      capabilities: { supportsRangeQuery: true, supportsNodeTypes: true, supportsIncrementalParsing: false },
    },
    {
      id: 'java',
      languageId: 'java',
      displayName: 'Java',
      version: '0.23.0',
      bindingType: 'placeholder',
      capabilities: { supportsRangeQuery: true, supportsNodeTypes: true, supportsIncrementalParsing: false },
    },
  ];

  for (const grammar of defaultGrammars) {
    registry.register({ ...grammar, isLoaded: false });
  }

  return registry;
}
