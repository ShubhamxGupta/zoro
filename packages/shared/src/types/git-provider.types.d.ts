/**
 * Git Intelligence Layer Domain Models & Abstraction
 */
export interface GitRepository {
    name: string;
    rootPath: string;
    currentBranch: string;
    headCommit: string;
    remoteUrl?: string;
}
export interface GitBranch {
    name: string;
    commitHash: string;
    isRemote: boolean;
}
export interface GitCommit {
    hash: string;
    author: string;
    email: string;
    message: string;
    timestamp: string;
}
export interface GitDiff {
    rawDiff: string;
    sourceCommit: string;
    targetCommit: string;
    changedFilesCount: number;
}
export interface StructuredDiffSymbolChange {
    symbolName: string;
    kind: 'function' | 'class' | 'interface' | 'module' | 'variable';
    changeType: 'added' | 'removed' | 'modified' | 'renamed';
    filePath: string;
    oldFilePath?: string;
    oldName?: string;
}
export interface StructuredDiff {
    rawDiff: string;
    changedFiles: string[];
    changedSymbols: StructuredDiffSymbolChange[];
    addedMethods: string[];
    removedMethods: string[];
    renamedSymbols: StructuredDiffSymbolChange[];
    movedFiles: Array<{
        oldPath: string;
        newPath: string;
    }>;
}
export interface GitPullRequest {
    id: string;
    number: number;
    title: string;
    author: string;
    sourceBranch: string;
    targetBranch: string;
    headCommit: string;
}
export interface GitProvider {
    getRepository(): Promise<GitRepository>;
    getBranches(): Promise<GitBranch[]>;
    getCommit(hash: string): Promise<GitCommit>;
    getDiff(sourceCommit: string, targetCommit: string): Promise<GitDiff>;
    getPullRequest(prNumber: number): Promise<GitPullRequest>;
    getChangedFiles(sourceCommit: string, targetCommit: string): Promise<string[]>;
    getChangedSymbols(sourceCommit: string, targetCommit: string): Promise<StructuredDiffSymbolChange[]>;
}
//# sourceMappingURL=git-provider.types.d.ts.map