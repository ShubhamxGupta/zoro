import { RepositoryMemoryStore } from './repository-memory-store.js';

export class AdaptiveContextEngine {
  private readonly memoryStore: RepositoryMemoryStore;

  constructor(memoryStore?: RepositoryMemoryStore) {
    this.memoryStore = memoryStore ?? new RepositoryMemoryStore();
  }

  public getAdaptiveContext(_filePath?: string): string {
    const memory = this.memoryStore.getMemory();
    const lines: string[] = [];

    lines.push(`HISTORICAL MEMORY (Completed Reviews: ${memory.completedReviewsCount}):`);

    if (memory.hotspots.length > 0) {
      lines.push(`Known Unstable Hotspots:`);
      for (const h of memory.hotspots) {
        lines.push(
          `  - File: ${h.filePath} (Findings Count: ${h.findingCount}, Unstable Score: ${h.unstableScore})`,
        );
      }
    }

    if (memory.feedbacks.length > 0) {
      const falsePositives = memory.feedbacks.filter(
        (f) => f.rating === 'FALSE_POSITIVE' || f.rating === 'INCORRECT',
      );
      if (falsePositives.length > 0) {
        lines.push(`User Feedback Constraints (Avoid Repeat False Positives):`);
        for (const fp of falsePositives.slice(-3)) {
          lines.push(`  - Agent ${fp.agentId} finding ${fp.findingId} marked as ${fp.rating}`);
        }
      }
    }

    if (memory.userNotes.length > 0) {
      lines.push(`Repository Architectural Decisions / Notes:`);
      for (const note of memory.userNotes.slice(-3)) {
        lines.push(`  - ${note}`);
      }
    }

    return lines.join('\n');
  }
}
