/**
 * Declarative Language Capabilities Model
 */
export class LanguageCapabilityRegistry {
    capabilities = new Map();
    constructor() {
        this.registerDefaults();
    }
    register(cap) {
        this.capabilities.set(cap.languageId.toLowerCase(), cap);
    }
    get(languageId) {
        return this.capabilities.get(languageId.toLowerCase());
    }
    registerDefaults() {
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
//# sourceMappingURL=language-capabilities.types.js.map