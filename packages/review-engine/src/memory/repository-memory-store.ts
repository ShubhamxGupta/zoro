import fs from 'node:fs';
import path from 'node:path';
import type {
  RepositoryMemory,
  FindingFeedback,
  AcceptedPatchRecord,
  RepositoryHotspot,
} from '@repo-intel/shared';

export class RepositoryMemoryStore {
  private readonly filePath: string;
  private memory: RepositoryMemory;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(process.cwd(), '.repo-intel-memory.json');
    this.memory = this.loadMemory();
  }

  public getMemory(): RepositoryMemory {
    return { ...this.memory };
  }

  public recordCompletedReview(): void {
    this.memory.completedReviewsCount += 1;
    this.memory.lastUpdated = new Date().toISOString();
    this.saveMemory();
  }

  public addFeedback(feedback: FindingFeedback): void {
    this.memory.feedbacks.push(feedback);
    this.memory.lastUpdated = new Date().toISOString();
    this.saveMemory();
  }

  public addAcceptedPatch(record: AcceptedPatchRecord): void {
    this.memory.acceptedPatches.push(record);
    this.memory.lastUpdated = new Date().toISOString();
    this.saveMemory();
  }

  public recordRejectedPatch(): void {
    this.memory.rejectedPatchesCount += 1;
    this.memory.lastUpdated = new Date().toISOString();
    this.saveMemory();
  }

  public addHotspot(hotspot: RepositoryHotspot): void {
    const idx = this.memory.hotspots.findIndex((h) => h.filePath === hotspot.filePath);
    if (idx >= 0) {
      this.memory.hotspots[idx] = hotspot;
    } else {
      this.memory.hotspots.push(hotspot);
    }
    this.saveMemory();
  }

  public addUserNote(note: string): void {
    this.memory.userNotes.push(note);
    this.saveMemory();
  }

  private loadMemory(): RepositoryMemory {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }

    return {
      repositoryId: 'default-repo',
      completedReviewsCount: 0,
      feedbacks: [],
      acceptedPatches: [],
      rejectedPatchesCount: 0,
      userNotes: [],
      hotspots: [
        {
          filePath: 'src/user.ts',
          findingCount: 3,
          unstableScore: 0.75,
          lastModifiedAt: new Date().toISOString(),
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  private saveMemory(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.memory, null, 2), 'utf-8');
    } catch {
      // Ignore write errors in sandbox
    }
  }
}
