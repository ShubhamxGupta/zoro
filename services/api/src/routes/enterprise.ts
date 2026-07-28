import type { FastifyInstance } from 'fastify';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { CollaborationService } from '../collaboration/collaboration-service.js';
import { MetricsCollector } from '../observability/metrics-collector.js';
import { RBACManager } from '../auth/rbac-manager.js';
import type { RoleName } from '@repo-intel/shared';

const auditLogger = AuditLogger.getInstance();
const collabService = new CollaborationService();

export async function enterpriseRoutes(
  fastify: FastifyInstance,
  _runtime: DefaultPlatformRuntime,
): Promise<void> {
  // GET /api/v1/auth/providers
  fastify.get('/api/v1/auth/providers', async (_request, reply) => {
    return reply.send({
      success: true,
      data: {
        providers: [
          { id: 'local', name: 'Local Account', type: 'local' },
          { id: 'github', name: 'GitHub OAuth2', type: 'oauth2' },
          { id: 'google', name: 'Google OpenID Connect', type: 'oidc' },
        ],
      },
    });
  });

  // POST /api/v1/auth/login
  fastify.post('/api/v1/auth/login', async (request, reply) => {
    const body = (request.body as { username?: string; role?: RoleName }) ?? {};
    const username = body.username ?? 'admin';
    const role: RoleName = body.role ?? 'Administrator';

    auditLogger.recordEvent(username, 'auth:login', 'system', { role });

    return reply.send({
      success: true,
      data: {
        token: `mock-jwt-token-for-${username}`,
        user: {
          id: `usr-${Date.now()}`,
          username,
          role,
          authProvider: 'local',
        },
      },
    });
  });

  // POST /api/v1/auth/logout
  fastify.post('/api/v1/auth/logout', async (_request, reply) => {
    auditLogger.recordEvent('admin', 'auth:logout', 'system');
    return reply.send({ success: true, data: { message: 'Logged out successfully.' } });
  });

  // GET /api/v1/audit
  fastify.get('/api/v1/audit', async (_request, reply) => {
    return reply.send({ success: true, data: { auditLogs: auditLogger.getLogs() } });
  });

  // GET /api/v1/users
  fastify.get('/api/v1/users', async (_request, reply) => {
    return reply.send({
      success: true,
      data: {
        users: [
          { id: 'usr-1', username: 'admin', email: 'admin@repo-intel.io', role: 'Administrator' },
          {
            id: 'usr-2',
            username: 'reviewer-dev',
            email: 'reviewer@repo-intel.io',
            role: 'Reviewer',
          },
        ],
      },
    });
  });

  // GET /api/v1/roles
  fastify.get('/api/v1/roles', async (_request, reply) => {
    const roles: RoleName[] = ['Administrator', 'Maintainer', 'Reviewer', 'Developer', 'Read-Only'];
    const roleDetails = roles.map((r) => ({
      name: r,
      permissions: RBACManager.getPermissionsForRole(r),
    }));
    return reply.send({ success: true, data: { roles: roleDetails } });
  });

  // POST /api/v1/collaboration/comments
  fastify.post('/api/v1/collaboration/comments', async (request, reply) => {
    const body = (request.body as any) ?? {};
    const comment = collabService.addComment({
      reviewSessionId: body.reviewSessionId ?? 'sess-101',
      findingId: body.findingId,
      authorId: body.authorId ?? 'usr-1',
      authorUsername: body.authorUsername ?? 'admin',
      content: body.content ?? 'Review comment',
    });

    auditLogger.recordEvent('admin', 'collaboration:comment', comment.reviewSessionId);

    return reply.send({ success: true, data: { comment } });
  });

  // GET /api/v1/metrics
  fastify.get('/api/v1/metrics', async (request, reply) => {
    const acceptHeader = request.headers.accept ?? '';
    if (acceptHeader.includes('text/plain')) {
      return reply.type('text/plain').send(MetricsCollector.getPrometheusFormattedMetrics());
    }
    return reply.send({ success: true, data: { metrics: MetricsCollector.getMetrics() } });
  });
}
