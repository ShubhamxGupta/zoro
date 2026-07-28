import type { ScheduledJob } from '@repo-intel/shared';

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
    const j = this.jobs.find((job) => job.id === jobId);
    if (j) {
      j.status = 'RUNNING';
      j.lastRunAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}
