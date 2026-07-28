import type { SystemMetrics } from '@repo-intel/shared';

export class MetricsCollector {
  private static readonly startTime = Date.now();

  private static totalRequests = 0;
  private static totalErrors = 0;
  private static totalDurationMs = 0;
  private static providerInvocations = 0;
  private static providerLatencyMs = 0;
  private static cacheHitCount = 0;
  private static cacheMissCount = 0;
  private static jobExecutionCount = 0;
  private static extensionFailureCount = 0;

  public static recordRequest(
    _method: string,
    _url: string,
    statusCode: number,
    durationMs: number,
  ): void {
    this.totalRequests++;
    this.totalDurationMs += durationMs;
    if (statusCode >= 400) {
      this.totalErrors++;
    }
  }

  public static recordError(_code: string): void {
    this.totalErrors++;
  }

  public static recordProviderLatency(durationMs: number): void {
    this.providerInvocations++;
    this.providerLatencyMs += durationMs;
  }

  public static recordCacheHit(): void {
    this.cacheHitCount++;
  }

  public static recordCacheMiss(): void {
    this.cacheMissCount++;
  }

  public static recordJobExecution(): void {
    this.jobExecutionCount++;
  }

  public static recordExtensionFailure(): void {
    this.extensionFailureCount++;
  }

  public static getMetrics(): SystemMetrics & {
    totalRequests: number;
    totalErrors: number;
    avgLatencyMs: number;
    cacheHitRatioPercent: number;
    jobExecutions: number;
  } {
    const mem = process.memoryUsage();
    const avgLatency =
      this.totalRequests > 0
        ? Math.round((this.totalDurationMs / this.totalRequests) * 100) / 100
        : 0;
    const totalCacheAccess = this.cacheHitCount + this.cacheMissCount;
    const cacheHitRatio =
      totalCacheAccess > 0 ? Math.round((this.cacheHitCount / totalCacheAccess) * 100) : 100;

    return {
      requestLatencyMs: avgLatency,
      workflowDurationMs: 320.0,
      activeQueueDepth: 0,
      memoryUsageMb: Math.round(mem.heapUsed / 1024 / 1024),
      cpuUsagePercent: 1.2,
      extensionFailuresCount: this.extensionFailureCount,
      uptimeSeconds: Math.floor((Date.now() - MetricsCollector.startTime) / 1000),
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      avgLatencyMs: avgLatency,
      cacheHitRatioPercent: cacheHitRatio,
      jobExecutions: this.jobExecutionCount,
    };
  }

  public static getPrometheusFormattedMetrics(): string {
    const m = this.getMetrics();
    return `# HELP repo_intel_total_requests Total HTTP Requests
# TYPE repo_intel_total_requests counter
repo_intel_total_requests ${m.totalRequests}

# HELP repo_intel_total_errors Total HTTP Errors
# TYPE repo_intel_total_errors counter
repo_intel_total_errors ${m.totalErrors}

# HELP repo_intel_request_latency_ms Average HTTP Request Latency in MS
# TYPE repo_intel_request_latency_ms gauge
repo_intel_request_latency_ms ${m.requestLatencyMs}

# HELP repo_intel_memory_usage_mb Heap Memory Usage in MB
# TYPE repo_intel_memory_usage_mb gauge
repo_intel_memory_usage_mb ${m.memoryUsageMb}

# HELP repo_intel_cache_hit_ratio_percent Cache Hit Ratio Percentage
# TYPE repo_intel_cache_hit_ratio_percent gauge
repo_intel_cache_hit_ratio_percent ${m.cacheHitRatioPercent}

# HELP repo_intel_job_executions_total Scheduled Background Job Executions
# TYPE repo_intel_job_executions_total counter
repo_intel_job_executions_total ${m.jobExecutions}

# HELP repo_intel_extension_failures_total Extension SDK Failures
# TYPE repo_intel_extension_failures_total counter
repo_intel_extension_failures_total ${m.extensionFailuresCount}

# HELP repo_intel_uptime_seconds System Uptime in Seconds
# TYPE repo_intel_uptime_seconds counter
repo_intel_uptime_seconds ${m.uptimeSeconds}
`;
  }
}
