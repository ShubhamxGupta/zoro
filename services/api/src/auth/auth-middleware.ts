import type { FastifyRequest, FastifyReply } from 'fastify';
import { RBACManager } from './rbac-manager.js';
import type { RoleName, Permission } from '@repo-intel/shared';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: RoleName;
  workspaceId: string;
}

export function extractAuthUser(request: FastifyRequest): AuthenticatedUser {
  const authHeader = request.headers.authorization;
  const workspaceId = (request.headers['x-workspace-id'] as string) || 'default-workspace';
  const roleHeader = (request.headers['x-user-role'] as RoleName) || 'Administrator';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return {
      id: `usr-${token.slice(0, 8)}`,
      username: token.includes('reviewer') ? 'reviewer-user' : 'admin-user',
      role: roleHeader,
      workspaceId,
    };
  }

  // Development fallback user
  return {
    id: 'usr-dev-admin',
    username: 'dev-admin',
    role: 'Administrator',
    workspaceId,
  };
}

export function requirePermission(permission: Permission) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = extractAuthUser(request);
    const hasAccess = RBACManager.hasPermission(user.role, permission);

    if (!hasAccess) {
      void reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `User with role '${user.role}' lacks required permission '${permission}'.`,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
}

export function requireWorkspaceIsolation() {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = extractAuthUser(request);
    const requestWorkspaceId = (request.headers['x-workspace-id'] as string) || null;

    if (requestWorkspaceId && requestWorkspaceId !== user.workspaceId) {
      void reply.status(403).send({
        success: false,
        error: {
          code: 'MULTI_TENANT_ACCESS_DENIED',
          message: `Cross-tenant access violation: Cannot access workspace '${requestWorkspaceId}'.`,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
}
