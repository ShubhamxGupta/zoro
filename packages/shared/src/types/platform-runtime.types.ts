/**
 * Platform Runtime & Lifecycle Domain Models
 */

export interface PlatformConfig {
  environment: 'development' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableObservability: boolean;
  maxParallelJobs: number;
  aiProviderPreference: string[];
}

export interface PlatformHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  services: Record<string, boolean>;
  timestamp: string;
}

export interface PlatformRuntime {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  health(): Promise<PlatformHealthStatus>;
  execute<T>(commandName: string, payload: Record<string, unknown>): Promise<T>;
}
