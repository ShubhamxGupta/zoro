import type { JobQueueTask } from '@repo-intel/shared';

export class DistributedJobQueue {
  private readonly tasks: JobQueueTask[] = [];
  private readonly deadLetterQueue: JobQueueTask[] = [];

  public enqueueTask(taskType: string, payload: Record<string, any>, priority = 5): JobQueueTask {
    const task: JobQueueTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskType,
      payload,
      priority,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    this.tasks.sort((a, b) => b.priority - a.priority);
    return task;
  }

  public getPendingTasks(): JobQueueTask[] {
    return this.tasks.filter((t) => t.status === 'PENDING');
  }

  public getDeadLetterQueue(): JobQueueTask[] {
    return [...this.deadLetterQueue];
  }

  public retryTask(taskId: string): boolean {
    const t = this.tasks.find((task) => task.id === taskId);
    if (t) {
      t.status = 'PENDING';
      return true;
    }
    return false;
  }
}
