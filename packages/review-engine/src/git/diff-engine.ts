import type { StructuredDiff, StructuredDiffSymbolChange } from '@repo-intel/shared';

export class DiffEngine {
  public parse(rawDiff: string): StructuredDiff {
    const lines = rawDiff.split('\n');
    const changedFilesSet = new Set<string>();
    const symbolChanges: StructuredDiffSymbolChange[] = [];
    const addedMethods: string[] = [];
    const removedMethods: string[] = [];
    const movedFiles: Array<{ oldPath: string; newPath: string }> = [];

    let currentFile = '';

    for (const line of lines) {
      if (line.startsWith('diff --git')) {
        const parts = line.split(' ');
        const bPath = parts[3];
        if (bPath) {
          currentFile = bPath.replace(/^b\//, '');
          changedFilesSet.add(currentFile);
        }
      } else if (line.startsWith('rename from')) {
        const oldPath = line.replace('rename from ', '').trim();
        const nextLineIndex = lines.indexOf(line) + 1;
        const nextLine = lines[nextLineIndex] ?? '';
        const newPath = nextLine.startsWith('rename to')
          ? nextLine.replace('rename to ', '').trim()
          : currentFile;
        movedFiles.push({ oldPath, newPath });
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        const content = line.substring(1).trim();
        const funcMatch = content.match(
          /(?:function|class|interface|async\s+function|public\s+|private\s+)?([a-zA-Z0-9_$]+)\s*\(|\s*class\s+([a-zA-Z0-9_$]+)/,
        );
        if (funcMatch) {
          const name = funcMatch[1] ?? funcMatch[2];
          if (name && !['if', 'for', 'while', 'switch', 'catch'].includes(name)) {
            addedMethods.push(name);
            symbolChanges.push({
              symbolName: name,
              kind: content.includes('class') ? 'class' : 'function',
              changeType: 'added',
              filePath: currentFile,
            });
          }
        }
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        const content = line.substring(1).trim();
        const funcMatch = content.match(
          /(?:function|class|interface|async\s+function|public\s+|private\s+)?([a-zA-Z0-9_$]+)\s*\(/,
        );
        if (funcMatch) {
          const name = funcMatch[1];
          if (name && !['if', 'for', 'while', 'switch', 'catch'].includes(name)) {
            removedMethods.push(name);
            symbolChanges.push({
              symbolName: name,
              kind: 'function',
              changeType: 'removed',
              filePath: currentFile,
            });
          }
        }
      }
    }

    return {
      rawDiff,
      changedFiles: Array.from(changedFilesSet),
      changedSymbols: symbolChanges,
      addedMethods,
      removedMethods,
      renamedSymbols: [],
      movedFiles,
    };
  }
}
