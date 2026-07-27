import { describe, it, expect } from 'vitest';
import { InMemoryJobQueue } from './in-memory-job-queue.js';

describe('InMemoryJobQueue', () => {
  it('enqueues, processes, and completes asynchronous jobs', async () => {
    const queue = new InMemoryJobQueue();

    let processedValue = '';
    queue.process('index_file', async (job) => {
      processedValue = String(job.payload['filePath']);
      return { success: true };
    });

    const job = await queue.enqueue('index_file', { filePath: 'src/user.ts' });
    expect(job.status).toBe('queued');

    // Wait for job processing
    await new Promise((r) => setTimeout(r, 50));

    const updatedJob = await queue.getJob(job.id);
    expect(updatedJob?.status).toBe('completed');
    expect(processedValue).toBe('src/user.ts');
  });
});
