/**
 * Job Queue & Worker Abstraction Domain Models
 */
export type JobStatus = 'queued' | 'active' | 'completed' | 'failed';
export interface Job<T = Record<string, unknown>> {
    id: string;
    name: string;
    payload: T;
    status: JobStatus;
    retryCount: number;
    maxRetries: number;
    result?: unknown;
    error?: string;
    createdAt: string;
}
export type JobHandler<T = Record<string, unknown>> = (job: Job<T>) => Promise<unknown>;
export interface JobQueue {
    enqueue<T = Record<string, unknown>>(name: string, payload: T, maxRetries?: number): Promise<Job<T>>;
    process<T = Record<string, unknown>>(name: string, handler: JobHandler<T>): void;
    getJob(id: string): Promise<Job | undefined>;
}
//# sourceMappingURL=job-queue.types.d.ts.map