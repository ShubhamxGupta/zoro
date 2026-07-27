import type { PlatformConfig, PlatformHealthStatus, PlatformRuntime } from '@repo-intel/shared';
import { TypedEventBus } from '../events/platform-event-bus.js';
import { ObservabilityManager } from '../observability/observability-manager.js';
import { InMemoryJobQueue } from '../queue/in-memory-job-queue.js';
import { DefaultWorkflowEngine } from '../workflow/workflow-engine.js';
import {
  DefaultAIService,
  DefaultGraphService,
  DefaultPatchService,
  DefaultRepositoryService,
  DefaultRetrievalService,
  DefaultReviewService,
  DefaultSessionService,
} from '../services/internal-services.js';

export class DefaultPlatformRuntime implements PlatformRuntime {
  private isInitialized = false;
  private startTime = 0;

  public readonly eventBus: TypedEventBus;
  public readonly observability: ObservabilityManager;
  public readonly jobQueue: InMemoryJobQueue;
  public readonly workflowEngine: DefaultWorkflowEngine;

  public readonly repositoryService: DefaultRepositoryService;
  public readonly reviewService: DefaultReviewService;
  public readonly retrievalService: DefaultRetrievalService;
  public readonly patchService: DefaultPatchService;
  public readonly sessionService: DefaultSessionService;
  public readonly graphService: DefaultGraphService;
  public readonly aiService: DefaultAIService;

  constructor(
    private readonly config: PlatformConfig = {
      environment: 'development',
      logLevel: 'info',
      enableObservability: true,
      maxParallelJobs: 5,
      aiProviderPreference: ['openai', 'ollama', 'mock'],
    },
  ) {
    this.eventBus = new TypedEventBus();
    this.observability = new ObservabilityManager();
    this.jobQueue = new InMemoryJobQueue();
    this.workflowEngine = new DefaultWorkflowEngine();

    this.repositoryService = new DefaultRepositoryService();
    this.reviewService = new DefaultReviewService();
    this.retrievalService = new DefaultRetrievalService();
    this.patchService = new DefaultPatchService();
    this.sessionService = new DefaultSessionService();
    this.graphService = new DefaultGraphService();
    this.aiService = new DefaultAIService();
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.startTime = Date.now();
    this.isInitialized = true;

    this.observability.logInfo('PlatformRuntime initialized successfully.', {
      environment: this.config.environment,
    });

    await this.eventBus.publish('RepositoryIndexed', { status: 'runtime_initialized' });
  }

  public async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    this.observability.logInfo('PlatformRuntime shutting down gracefully...');
    this.isInitialized = false;
  }

  public async health(): Promise<PlatformHealthStatus> {
    const aiHealth = await this.aiService.checkProviderHealth();

    return {
      status: this.isInitialized ? 'healthy' : 'unhealthy',
      uptimeSeconds: this.startTime > 0 ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
      services: {
        eventBus: true,
        jobQueue: true,
        workflowEngine: true,
        aiService: Object.values(aiHealth).some(Boolean),
      },
      timestamp: new Date().toISOString(),
    };
  }

  public async execute<T>(commandName: string, payload: Record<string, unknown>): Promise<T> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.observability.logInfo(`Executing command: ${commandName}`, { payload });

    switch (commandName) {
      case 'indexRepository':
        return (await this.repositoryService.indexRepository(
          String(payload['repoPath'] ?? '.'),
        )) as T;

      case 'retrieveContext':
        return (await this.retrievalService.retrieveContext(
          String(payload['queryText'] ?? ''),
        )) as T;

      case 'executeWorkflow':
        return (await this.workflowEngine.executeWorkflow(
          (payload['type'] as any) ?? 'review',
          payload,
        )) as T;

      default:
        throw new Error(`Unknown platform command: ${commandName}`);
    }
  }
}
