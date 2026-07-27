import type {
  WorkflowEngine,
  WorkflowExecution,
  WorkflowStage,
  WorkflowType,
} from '@repo-intel/shared';

export class DefaultWorkflowEngine implements WorkflowEngine {
  private readonly executions = new Map<string, WorkflowExecution>();
  private readonly activeWorkflows = new Map<string, boolean>();

  public async executeWorkflow(
    type: WorkflowType,
    input: Record<string, unknown>,
  ): Promise<WorkflowExecution> {
    const start = Date.now();
    const id = `wf::${type}::${Date.now()}`;
    const stages = this.getStagesForWorkflow(type);

    const execution: WorkflowExecution = {
      id,
      type,
      status: 'running',
      stagesCompleted: [],
      durationMs: 0,
    };

    this.executions.set(id, execution);
    this.activeWorkflows.set(id, true);

    let currentContext = { ...input };

    try {
      for (const stage of stages) {
        if (!this.activeWorkflows.get(id)) {
          execution.status = 'cancelled';
          execution.durationMs = Date.now() - start;
          return execution;
        }

        execution.currentStage = stage.name;
        const stageOutput = await stage.execute(currentContext);
        currentContext = { ...currentContext, ...stageOutput };
        execution.stagesCompleted.push(stage.name);
      }

      execution.status = 'completed';
      execution.output = currentContext;
    } catch (err) {
      execution.status = 'failed';
      execution.error = err instanceof Error ? err.message : String(err);
    } finally {
      execution.durationMs = Date.now() - start;
      this.activeWorkflows.delete(id);
    }

    return execution;
  }

  public async cancelWorkflow(id: string): Promise<boolean> {
    if (this.activeWorkflows.has(id)) {
      this.activeWorkflows.set(id, false);
      return true;
    }
    return false;
  }

  public async getExecution(id: string): Promise<WorkflowExecution | undefined> {
    return this.executions.get(id);
  }

  private getStagesForWorkflow(type: WorkflowType): WorkflowStage[] {
    switch (type) {
      case 'review':
        return [
          {
            id: '1',
            name: 'Git Diff Extraction',
            execute: async (ctx) => ({ diffExtracted: true, ...ctx }),
          },
          {
            id: '2',
            name: 'GraphRAG Context Retrieval',
            execute: async (ctx) => ({ contextRetrieved: true, ...ctx }),
          },
          {
            id: '3',
            name: 'Multi-Agent Code Inspection',
            execute: async (ctx) => ({ reviewCompleted: true, ...ctx }),
          },
        ];

      case 'patch':
        return [
          {
            id: '1',
            name: 'Patch Plan Validation',
            execute: async (ctx) => ({ planValidated: true, ...ctx }),
          },
          {
            id: '2',
            name: 'In-Memory AST Simulation',
            execute: async (ctx) => ({ astSimulated: true, ...ctx }),
          },
          {
            id: '3',
            name: 'Unified Diff & Scoring',
            execute: async (ctx) => ({ patchGenerated: true, ...ctx }),
          },
        ];

      case 'index':
        return [
          {
            id: '1',
            name: 'AST Symbol Parsing',
            execute: async (ctx) => ({ symbolsParsed: true, ...ctx }),
          },
          {
            id: '2',
            name: 'Knowledge Graph Building',
            execute: async (ctx) => ({ graphBuilt: true, ...ctx }),
          },
          {
            id: '3',
            name: 'Vector Context Embedding',
            execute: async (ctx) => ({ embedded: true, ...ctx }),
          },
        ];
    }
  }
}
