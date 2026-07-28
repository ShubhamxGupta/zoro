import type { ScheduledJob } from '@repo-intel/shared';
import { logger } from '@repo-intel/shared';
import { MetricsCollector } from '../observability/metrics-collector.js';

export class JobScheduler {
  private readonly jobs: ScheduledJob[] = [
    {
      id: 'job-1',
      name: 'Recurring Repository Indexing',
      schedulePattern: '0 */6 * * *',
      lastRunAt: new Date(Date.now() - 3600000).toISOString(),
      nextRunAt: new Date(Date.now() + 18000000).toISOString(),
      status: 'COMPLETED',
      retryCount: 0,
    },
    {
      id: 'job-2',
      name: 'Scheduled Metrics Aggregation',
      schedulePattern: '*/15 * * * *',
      lastRunAt: new Date().toISOString(),
      nextRunAt: new Date(Date.now() + 900000).toISOString(),
      status: 'RUNNING',
      retryCount: 0,
    },
  ];

  public getJobs(): ScheduledJob[] {
    return [...this.jobs];
  }

  public triggerJob(jobId: string): boolean {
    const startTime = Date.now();
    const j = this.jobs.find((job) => job.id === jobId);
    if (j) {
      const startIso = new Date().toISOString();
      j.status = 'RUNNING';
      j.lastRunAt = startIso;

      // Simulate execution completion
      setTimeout(() => {
        const finishIso = new Date().toISOString();
        const durationMs = Date.now() - startTime;
        j.status = 'COMPLETED';

        // Part 7 & Part 8: Structured Job Logging and Metrics Integration
        logger.info({
          msg: 'Scheduled Background Job Completed',
          jobId: j.id,
          jobType: j.name,
          queue: 'main-operations-queue',
          startTime: startIso,
          finishTime: finishIso,
          durationMs,
          retryCount: j.retryCount,
          workerId: `worker-${process.pid}`,
          status: j.status,
          service: 'repo-intel-service',
          component: 'Job-Scheduler',
        });

        MetricsCollector.recordJobExecution();
      }, 50);

      return true;
    }

    logger.error({
      msg: 'Scheduled Job Trigger Failed - Job Not Found',
      jobId,
      status: 'FAILED',
      service: 'repo-intel-service',
      component: 'Job-Scheduler',
    });
    return false;
  }
}
