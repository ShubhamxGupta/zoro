import type { CollaborationComment } from '@repo-intel/shared';

export class CollaborationService {
  private readonly comments: CollaborationComment[] = [];

  public addComment(comment: Omit<CollaborationComment, 'id' | 'createdAt' | 'resolved'>): CollaborationComment {
    const fullComment: CollaborationComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    this.comments.push(fullComment);
    return fullComment;
  }

  public getCommentsForSession(sessionId: string): CollaborationComment[] {
    return this.comments.filter((c) => c.reviewSessionId === sessionId);
  }

  public resolveComment(commentId: string): boolean {
    const c = this.comments.find((item) => item.id === commentId);
    if (c) {
      c.resolved = true;
      return true;
    }
    return false;
  }
}
