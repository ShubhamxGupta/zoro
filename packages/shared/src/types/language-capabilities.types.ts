/**
 * Declarative Language Capabilities Model
 */

export interface LanguageCapabilities {
  readonly languageId: string;
  readonly supportsClasses: boolean;
  readonly supportsInterfaces: boolean;
  readonly supportsInheritance: boolean;
  readonly supportsGenerics: boolean;
  readonly supportsAnnotations: boolean;
  readonly supportsAsync: boolean;
  readonly supportsModules: boolean;
  readonly supportsNamespaces: boolean;
  readonly supportsStructs: boolean;
  readonly supportsDecorators: boolean;
}

export class LanguageCapabilityRegistry {
  private readonly capabilities = new Map<string, LanguageCapabilities>();

  constructor() {
    this.registerDefaults();
  }

  public register(cap: LanguageCapabilities): void {
    this.capabilities.set(cap.languageId.toLowerCase(), cap);
  }

  public get(languageId: string): LanguageCapabilities | undefined {
    return this.capabilities.get(languageId.toLowerCase());
  }

  private registerDefaults(): void {
    this.register({
      languageId: 'typescript',
      supportsClasses: true,
      supportsInterfaces: true,
      supportsInheritance: true,
      supportsGenerics: true,
      supportsAnnotations: true,
      supportsAsync: true,
      supportsModules: true,
      supportsNamespaces: true,
      supportsStructs: false,
      supportsDecorators: true,
    });

    this.register({
      languageId: 'javascript',
      supportsClasses: true,
      supportsInterfaces: false,
      supportsInheritance: true,
      supportsGenerics: false,
      supportsAnnotations: false,
      supportsAsync: true,
      supportsModules: true,
      supportsNamespaces: false,
      supportsStructs: false,
      supportsDecorators: true,
    });

    this.register({
      languageId: 'python',
      supportsClasses: true,
      supportsInterfaces: false,
      supportsInheritance: true,
      supportsGenerics: true,
      supportsAnnotations: true,
      supportsAsync: true,
      supportsModules: true,
      supportsNamespaces: true,
      supportsStructs: false,
      supportsDecorators: true,
    });

    this.register({
      languageId: 'go',
      supportsClasses: false,
      supportsInterfaces: true,
      supportsInheritance: false,
      supportsGenerics: true,
      supportsAnnotations: false,
      supportsAsync: false,
      supportsModules: true,
      supportsNamespaces: false,
      supportsStructs: true,
      supportsDecorators: false,
    });

    this.register({
      languageId: 'java',
      supportsClasses: true,
      supportsInterfaces: true,
      supportsInheritance: true,
      supportsGenerics: true,
      supportsAnnotations: true,
      supportsAsync: false,
      supportsModules: true,
      supportsNamespaces: true,
      supportsStructs: false,
      supportsDecorators: false,
    });
  }
}
