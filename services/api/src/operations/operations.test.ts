import { describe, it, expect } from 'vitest';
import { JobScheduler } from './job-scheduler.js';
import { DistributedJobQueue } from './distributed-job-queue.js';
import { PlatformCache } from './platform-cache.js';
import { ResilienceCircuitBreaker } from './resilience-circuit-breaker.js';
import { PerformanceProfiler } from './performance-profiler.js';
import { HealthDiagnostics } from './health-diagnostics.js';

describe('Production Operations & Resilience Suite', () => {
  it('manages background job scheduler execution history and retries', () => {
    const scheduler = new JobScheduler();
    const jobs = scheduler.getJobs();

    expect(jobs.length).toBeGreaterThan(0);
    const triggered = scheduler.triggerJob('job-1');
    expect(triggered).toBe(true);
  });

  it('enqueues and processes tasks in DistributedJobQueue', () => {
    const queue = new DistributedJobQueue();
    const task = queue.enqueueTask('repository-index', { repo: 'zoro' }, 10);

    expect(task.priority).toBe(10);
    expect(queue.getPendingTasks().length).toBe(1);
  });

  it('stores and retrieves cache entries with TTL invalidation in PlatformCache', () => {
    const cache = new PlatformCache();
    cache.set('repo:meta', { name: 'zoro' });

    const val = cache.get<{ name: string }>('repo:meta');
    expect(val?.name).toBe('zoro');

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.keysCount).toBe(1);
  });

  it('opens circuit breaker on repeated failures and uses fallback function', async () => {
    const breaker = new ResilienceCircuitBreaker('MockAIProvider');

    const failingFn = async () => {
      throw new Error('AI Provider Unavailable');
    };
    const fallbackFn = () => 'fallback-response';

    // Trigger 3 failures to trip breaker to OPEN state
    for (let i = 0; i < 3; i++) {
      await breaker.execute(failingFn, fallbackFn);
    }

    expect(breaker.getState().state).toBe('OPEN');
    const fallbackRes = await breaker.execute(failingFn, fallbackFn);
    expect(fallbackRes).toBe('fallback-response');
  });

  it('records performance profiling metrics and identifies bottlenecks', () => {
    const profiler = new PerformanceProfiler();
    const bm = profiler.recordBenchmark('GraphRAG Search', 350);

    expect(bm.isBottleneck).toBe(true);
    expect(profiler.getBenchmarks().length).toBeGreaterThan(0);
  });

  it('generates deep system readiness and liveness diagnostics report', () => {
    const report = HealthDiagnostics.getReport();
    expect(report.status).toBe('HEALTHY');
    expect(report.readiness).toBe(true);
    expect(report.liveness).toBe(true);
  });
});
