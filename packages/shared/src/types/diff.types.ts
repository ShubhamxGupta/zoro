/**
 * Git Diff & Change Payload Domain Models
 */

export type FileChangeType = 'added' | 'modified' | 'deleted' | 'renamed';

export interface HunkHeader {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
}

export interface DiffHunk {
  header: HunkHeader;
  lines: string[];
}

export interface GitDiffFile {
  oldPath?: string;
  newPath: string;
  changeType: FileChangeType;
  hunks: DiffHunk[];
  addedLinesCount: number;
  deletedLinesCount: number;
}

export interface GitDiffPayload {
  repositoryId: string;
  commitHash: string;
  baseHash?: string;
  branchName: string;
  changedFiles: GitDiffFile[];
}
