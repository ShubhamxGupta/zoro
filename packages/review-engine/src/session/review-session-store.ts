import type { ReviewSession, ReviewSessionStore } from '@repo-intel/shared';

export class InMemoryReviewSessionStore implements ReviewSessionStore {
  private readonly sessions = new Map<string, ReviewSession>();

  public async save(session: ReviewSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  public async get(id: string): Promise<ReviewSession | undefined> {
    return this.sessions.get(id);
  }

  public async list(repositoryId?: string): Promise<ReviewSession[]> {
    const all = Array.from(this.sessions.values());
    if (!repositoryId) return all;
    return all.filter((s) => s.repositoryId === repositoryId);
  }

  public async delete(id: string): Promise<boolean> {
    return this.sessions.delete(id);
  }
}
