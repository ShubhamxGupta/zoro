import type { WorkflowExtension, WorkflowHookType } from '@repo-intel/shared';

export class WorkflowHookBus {
  private readonly listeners: WorkflowExtension[] = [];

  public registerHookListener(ext: WorkflowExtension): void {
    this.listeners.push(ext);
  }

  public async emitHook(hookType: WorkflowHookType, payload: any): Promise<any> {
    let currentPayload = payload;
    for (const ext of this.listeners) {
      if (!ext.isEnabled) continue;
      try {
        currentPayload = await ext.onHook(hookType, currentPayload);
      } catch (err: any) {
        // Isolated failure: log and preserve pipeline
        console.warn(
          `[WorkflowHookBus] Extension ${ext.metadata.id} failed on ${hookType}: ${err.message}`,
        );
      }
    }
    return currentPayload;
  }
}
