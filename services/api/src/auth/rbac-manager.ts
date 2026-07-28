import type { RoleName, Permission } from '@repo-intel/shared';

const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  Administrator: [
    'repo:read',
    'repo:write',
    'review:execute',
    'provider:configure',
    'extension:manage',
    'settings:manage',
    'report:export',
    'admin:manage',
  ],
  Maintainer: ['repo:read', 'repo:write', 'review:execute', 'provider:configure', 'extension:manage', 'report:export'],
  Reviewer: ['repo:read', 'review:execute', 'report:export'],
  Developer: ['repo:read', 'review:execute'],
  'Read-Only': ['repo:read'],
};

export class RBACManager {
  public static hasPermission(role: RoleName, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  public static getPermissionsForRole(role: RoleName): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}
