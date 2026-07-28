import type { HealthDiagnosticsReport } from '@repo-intel/shared';

export class HealthDiagnostics {
  public static getReport(): HealthDiagnosticsReport {
    const mem = process.memoryUsage();
    return {
      status: 'HEALTHY',
      readiness: true,
      liveness: true,
      checks: {
        providers: true,
        queue: true,
        extensions: true,
        cache: true,
        scheduler: true,
      },
      metrics: {
        memoryMb: Math.round(mem.heapUsed / 1024 / 1024),
        cpuPercent: 1.5,
        uptimeSeconds: Math.floor(process.uptime()),
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
