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
export declare class LanguageCapabilityRegistry {
    private readonly capabilities;
    constructor();
    register(cap: LanguageCapabilities): void;
    get(languageId: string): LanguageCapabilities | undefined;
    private registerDefaults;
}
//# sourceMappingURL=language-capabilities.types.d.ts.map