import type { Job, JobHandler, JobQueue } from '@repo-intel/shared';

export class InMemoryJobQueue implements JobQueue {
  private readonly jobs = new Map<string, Job>();
  private readonly handlers = new Map<string, JobHandler<any>>();

  public async enqueue<T = Record<string, unknown>>(
    name: string,
    payload: T,
    maxRetries = 2,
  ): Promise<Job<T>> {
    const job: Job<T> = {
      id: `job::${Date.now()}::${Math.floor(Math.random() * 1000)}`,
      name,
      payload,
      status: 'queued',
      retryCount: 0,
      maxRetries,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job as Job<any>);
    setImmediate(() => this.processJob(job.id));

    return job;
  }

  public process<T = Record<string, unknown>>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler);
  }

  public async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'queued') return;

    const handler = this.handlers.get(job.name);
    if (!handler) return;

    job.status = 'active';
    try {
      const result = await handler(job);
      job.status = 'completed';
      job.result = result;
    } catch (err) {
      if (job.retryCount < job.maxRetries) {
        job.retryCount++;
        job.status = 'queued';
        setImmediate(() => this.processJob(jobId));
      } else {
        job.status = 'failed';
        job.error = err instanceof Error ? err.message : String(err);
      }
    }
  }
}
