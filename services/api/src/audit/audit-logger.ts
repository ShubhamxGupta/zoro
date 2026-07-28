import type { AuditLogEntry } from '@repo-intel/shared';

export class AuditLogger {
  private static instance: AuditLogger;
  private readonly logs: AuditLogEntry[] = [];

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public recordEvent(userId: string, action: string, resource: string, details?: Record<string, any>): void {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      action,
      resource,
      timestamp: new Date().toISOString(),
      details,
    };
    this.logs.push(entry);
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }
}
