import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { RepositoryMemoryStore } from './repository-memory-store.js';
import { AdaptiveContextEngine } from './adaptive-context-engine.js';
import { TrendAnalyticsEngine } from './trend-analytics-engine.js';

describe('Repository Memory & Intelligence Suite', () => {
  const testMemFile = path.join(process.cwd(), '.test-repo-memory.json');

  beforeEach(() => {
    if (fs.existsSync(testMemFile)) fs.unlinkSync(testMemFile);
  });

  afterEach(() => {
    if (fs.existsSync(testMemFile)) fs.unlinkSync(testMemFile);
  });

  it('persists review memory and feedback across store reloads', () => {
    const store1 = new RepositoryMemoryStore(testMemFile);
    store1.recordCompletedReview();
    store1.addFeedback({
      id: 'fb-1',
      findingId: 'finding-101',
      agentId: 'SecurityAgent',
      rating: 'USEFUL',
      submittedAt: new Date().toISOString(),
    });

    const store2 = new RepositoryMemoryStore(testMemFile);
    const mem = store2.getMemory();

    expect(mem.completedReviewsCount).toBe(1);
    expect(mem.feedbacks.length).toBe(1);
    expect(mem.feedbacks[0]?.findingId).toBe('finding-101');
  });

  it('constructs adaptive context incorporating memory and feedback', () => {
    const store = new RepositoryMemoryStore(testMemFile);
    store.addHotspot({
      filePath: 'services/api/server.ts',
      findingCount: 5,
      unstableScore: 0.9,
      lastModifiedAt: new Date().toISOString(),
    });
    store.addUserNote('Always validate auth tokens before executing command handlers.');

    const engine = new AdaptiveContextEngine(store);
    const ctx = engine.getAdaptiveContext();

    expect(ctx).toContain('HISTORICAL MEMORY');
    expect(ctx).toContain('services/api/server.ts');
    expect(ctx).toContain('Always validate auth tokens');
  });

  it('generates repository insight reports and trend metrics', () => {
    const store = new RepositoryMemoryStore(testMemFile);
    store.addFeedback({
      id: 'fb-2',
      findingId: 'finding-102',
      agentId: 'BugDetectionAgent',
      rating: 'FALSE_POSITIVE',
      submittedAt: new Date().toISOString(),
    });

    const analytics = new TrendAnalyticsEngine(store);
    const report = analytics.getInsightReport();

    expect(report.trends.totalReviews).toBeGreaterThan(0);
    expect(report.topFeedbackRatings.FALSE_POSITIVE).toBe(1);
    expect(report.trends.falsePositiveRate).toBeGreaterThan(0);
  });
});
