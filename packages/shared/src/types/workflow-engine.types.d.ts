/**
 * Deterministic Workflow Engine Domain Models
 */
export type WorkflowType = 'review' | 'patch' | 'index';
export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface WorkflowStage {
    id: string;
    name: string;
    execute(context: Record<string, unknown>): Promise<Record<string, unknown>>;
}
export interface WorkflowExecution {
    id: string;
    type: WorkflowType;
    status: WorkflowStatus;
    stagesCompleted: string[];
    currentStage?: string;
    output?: Record<string, unknown>;
    error?: string;
    durationMs: number;
}
export interface WorkflowEngine {
    executeWorkflow(type: WorkflowType, input: Record<string, unknown>): Promise<WorkflowExecution>;
    cancelWorkflow(id: string): Promise<boolean>;
    getExecution(id: string): Promise<WorkflowExecution | undefined>;
}
//# sourceMappingURL=workflow-engine.types.d.ts.map