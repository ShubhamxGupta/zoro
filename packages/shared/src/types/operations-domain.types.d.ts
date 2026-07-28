export type OpsJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export interface ScheduledJob {
    id: string;
    name: string;
    schedulePattern: string;
    lastRunAt?: string;
    nextRunAt?: string;
    status: OpsJobStatus;
    retryCount: number;
}
export interface JobQueueTask {
    id: string;
    taskType: string;
    payload: Record<string, any>;
    priority: number;
    status: OpsJobStatus;
    createdAt: string;
}
export interface CacheStats {
    hits: number;
    misses: number;
    keysCount: number;
    memoryUsageMb: number;
    hitRatioPercent: number;
}
export interface CircuitBreakerState {
    serviceName: string;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failuresCount: number;
    lastFailureAt?: string;
}
export interface PerformanceBenchmark {
    operationName: string;
    durationMs: number;
    timestamp: string;
    isBottleneck: boolean;
}
export interface HealthDiagnosticsReport {
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    readiness: boolean;
    liveness: boolean;
    checks: {
        providers: boolean;
        queue: boolean;
        extensions: boolean;
        cache: boolean;
        scheduler: boolean;
    };
    metrics: {
        memoryMb: number;
        cpuPercent: number;
        uptimeSeconds: number;
    };
    generatedAt: string;
}
//# sourceMappingURL=operations-domain.types.d.ts.map