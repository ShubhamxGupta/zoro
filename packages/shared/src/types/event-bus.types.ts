/**
 * Typed Event Bus Domain Models
 */

export type EventType =
  | 'RepositoryIndexed'
  | 'GraphUpdated'
  | 'RetrievalCompleted'
  | 'ReviewStarted'
  | 'ReviewCompleted'
  | 'PatchGenerated'
  | 'PatchValidated'
  | 'SessionClosed';

export interface PlatformEvent<T = Record<string, unknown>> {
  id: string;
  type: EventType;
  correlationId: string;
  payload: T;
  timestamp: string;
}

export type EventSubscriber<T = Record<string, unknown>> = (
  event: PlatformEvent<T>,
) => Promise<void> | void;

export interface EventBus {
  publish<T = Record<string, unknown>>(
    type: EventType,
    payload: T,
    correlationId?: string,
  ): Promise<void>;
  subscribe<T = Record<string, unknown>>(
    type: EventType,
    subscriber: EventSubscriber<T>,
  ): () => void;
}
