export type RoleName = 'Administrator' | 'Maintainer' | 'Reviewer' | 'Developer' | 'Read-Only';
export type Permission = 'repo:read' | 'repo:write' | 'review:execute' | 'provider:configure' | 'extension:manage' | 'settings:manage' | 'report:export' | 'admin:manage';
export interface User {
    id: string;
    username: string;
    email: string;
    role: RoleName;
    authProvider: 'local' | 'oauth2' | 'oidc' | 'github' | 'google';
    createdAt: string;
}
export interface AuditLogEntry {
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: string;
    details?: Record<string, any>;
}
export interface CollaborationComment {
    id: string;
    reviewSessionId: string;
    findingId?: string;
    authorId: string;
    authorUsername: string;
    content: string;
    createdAt: string;
    resolved: boolean;
}
export interface SystemMetrics {
    requestLatencyMs: number;
    workflowDurationMs: number;
    activeQueueDepth: number;
    memoryUsageMb: number;
    cpuUsagePercent: number;
    extensionFailuresCount: number;
    uptimeSeconds: number;
}
//# sourceMappingURL=auth-domain.types.d.ts.map