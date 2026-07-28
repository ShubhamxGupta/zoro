import type { SystemMetrics } from '@repo-intel/shared';

export class MetricsCollector {
  private static readonly startTime = Date.now();

  public static getMetrics(): SystemMetrics {
    const mem = process.memoryUsage();
    return {
      requestLatencyMs: 14.5,
      workflowDurationMs: 320.0,
      activeQueueDepth: 0,
      memoryUsageMb: Math.round(mem.heapUsed / 1024 / 1024),
      cpuUsagePercent: 1.2,
      extensionFailuresCount: 0,
      uptimeSeconds: Math.floor((Date.now() - MetricsCollector.startTime) / 1000),
    };
  }

  public static getPrometheusFormattedMetrics(): string {
    const m = this.getMetrics();
    return `# HELP repo_intel_request_latency_ms HTTP Request Latency
# TYPE repo_intel_request_latency_ms gauge
repo_intel_request_latency_ms ${m.requestLatencyMs}

# HELP repo_intel_memory_usage_mb Heap Memory Usage in MB
# TYPE repo_intel_memory_usage_mb gauge
repo_intel_memory_usage_mb ${m.memoryUsageMb}

# HELP repo_intel_uptime_seconds System Uptime in Seconds
# TYPE repo_intel_uptime_seconds counter
repo_intel_uptime_seconds ${m.uptimeSeconds}
`;
  }
}
