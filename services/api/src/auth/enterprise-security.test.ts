import { describe, it, expect } from 'vitest';
import { RBACManager } from './rbac-manager.js';
import { SecretsManager } from './secrets-manager.js';
import { AuditLogger } from '../audit/audit-logger.js';
import { CollaborationService } from '../collaboration/collaboration-service.js';
import { MetricsCollector } from '../observability/metrics-collector.js';

describe('Enterprise Platform, Security & Operations Suite', () => {
  it('enforces RBAC permission boundaries correctly', () => {
    expect(RBACManager.hasPermission('Administrator', 'admin:manage')).toBe(true);
    expect(RBACManager.hasPermission('Reviewer', 'admin:manage')).toBe(false);
    expect(RBACManager.hasPermission('Read-Only', 'review:execute')).toBe(false);
    expect(RBACManager.hasPermission('Developer', 'review:execute')).toBe(true);
  });

  it('encrypts secrets at rest and masks sensitive outputs', () => {
    const secrets = new SecretsManager();
    secrets.setSecret('OPENAI_API_KEY', 'sk-proj-secret-token-key-12345');

    const decrypted = secrets.getSecret('OPENAI_API_KEY');
    expect(decrypted).toBe('sk-proj-secret-token-key-12345');

    const masked = secrets.getMaskedSecret('OPENAI_API_KEY');
    expect(masked).toContain('...45');
  });

  it('records security audit log events', () => {
    const audit = AuditLogger.getInstance();
    audit.recordEvent('admin-user', 'provider:switch', 'OpenAI');

    const logs = audit.getLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1]?.action).toBe('provider:switch');
  });

  it('manages collaboration review threads and comments', () => {
    const collab = new CollaborationService();
    const comment = collab.addComment({
      reviewSessionId: 'sess-42',
      authorId: 'usr-1',
      authorUsername: 'lead-dev',
      content: 'Please check memory leak on line 42.',
    });

    expect(comment.id).toBeDefined();
    expect(comment.resolved).toBe(false);

    collab.resolveComment(comment.id);
    const sessionComments = collab.getCommentsForSession('sess-42');
    expect(sessionComments[0]?.resolved).toBe(true);
  });

  it('collects telemetry metrics and generates Prometheus text payload', () => {
    const metrics = MetricsCollector.getMetrics();
    expect(metrics.memoryUsageMb).toBeGreaterThan(0);

    const promText = MetricsCollector.getPrometheusFormattedMetrics();
    expect(promText).toContain('repo_intel_memory_usage_mb');
  });
});
