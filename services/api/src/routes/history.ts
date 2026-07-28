import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';
import { RepositoryMemoryStore, TrendAnalyticsEngine } from '@repo-intel/review-engine';
import type { FindingFeedbackRating } from '@repo-intel/shared';

const memoryStore = new RepositoryMemoryStore();
const trendEngine = new TrendAnalyticsEngine(memoryStore);

export async function historyRoutes(
  fastify: FastifyInstance,
  _runtime: DefaultPlatformRuntime,
): Promise<void> {
  // GET /api/v1/history
  fastify.get('/api/v1/history', async (_request, reply) => {
    const memory = memoryStore.getMemory();
    return reply.send({
      success: true,
      data: {
        completedReviewsCount: memory.completedReviewsCount,
        reviews: [
          {
            id: 'rev-sess-101',
            repositoryId: memory.repositoryId,
            branch: 'main',
            commitHash: 'a1b2c3d4',
            findingsCount: 4,
            reviewedAt: memory.lastUpdated,
          },
          {
            id: 'rev-sess-100',
            repositoryId: memory.repositoryId,
            branch: 'feature/auth',
            commitHash: 'e5f6g7h8',
            findingsCount: 2,
            reviewedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
      },
    });
  });

  // GET /api/v1/history/:id
  fastify.get('/api/v1/history/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const memory = memoryStore.getMemory();
    return reply.send({
      success: true,
      data: {
        review: {
          id,
          repositoryId: memory.repositoryId,
          branch: 'main',
          commitHash: 'a1b2c3d4',
          findingsCount: 4,
          reviewedAt: memory.lastUpdated,
          userNotes: memory.userNotes,
        },
      },
    });
  });

  // GET /api/v1/trends
  fastify.get('/api/v1/trends', async (_request, reply) => {
    const insights = trendEngine.getInsightReport();
    return reply.send({
      success: true,
      data: { trends: insights.trends },
    });
  });

  // GET /api/v1/repository/intelligence
  fastify.get('/api/v1/repository/intelligence', async (_request, reply) => {
    const insights = trendEngine.getInsightReport();
    return reply.send({
      success: true,
      data: { intelligence: insights },
    });
  });

  // POST /api/v1/feedback
  fastify.post('/api/v1/feedback', async (request, reply) => {
    const body =
      (request.body as {
        findingId?: string;
        agentId?: string;
        rating?: FindingFeedbackRating;
        comment?: string;
      }) ?? {};
    const feedback = {
      id: `fb-${Date.now()}`,
      findingId: body.findingId ?? 'finding-1',
      agentId: body.agentId ?? 'BugDetectionAgent',
      rating: body.rating ?? 'USEFUL',
      comment: body.comment,
      submittedAt: new Date().toISOString(),
    };

    memoryStore.addFeedback(feedback);

    return reply.send({
      success: true,
      data: { feedback, message: 'Feedback recorded successfully.' },
    });
  });

  // GET /api/v1/repository/hotspots
  fastify.get('/api/v1/repository/hotspots', async (_request, reply) => {
    const insights = trendEngine.getInsightReport();
    return reply.send({
      success: true,
      data: { hotspots: insights.hotspots },
    });
  });
}
