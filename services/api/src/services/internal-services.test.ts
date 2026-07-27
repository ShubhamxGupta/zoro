import { describe, it, expect } from 'vitest';
import {
  DefaultRepositoryService,
  DefaultReviewService,
  DefaultRetrievalService,
  DefaultAIService,
} from './internal-services.js';

describe('Internal Services', () => {
  it('orchestrates domain services with stable contracts', async () => {
    const repoService = new DefaultRepositoryService();
    const diff = await repoService.getDiff('c1', 'c2');
    expect(diff.rawDiff).toBeDefined();

    const reviewService = new DefaultReviewService();
    const { session, findings } = await reviewService.runReview(diff);
    expect(session.id).toBeDefined();
    expect(findings.length).toBeGreaterThan(0);

    const retrievalService = new DefaultRetrievalService();
    const bundle = await retrievalService.retrieveContext('UserService');
    expect(bundle.summary).toBeDefined();

    const aiService = new DefaultAIService();
    const health = await aiService.checkProviderHealth();
    expect(health['mock']).toBe(true);
  });
});
