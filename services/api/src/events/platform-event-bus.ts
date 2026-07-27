import type { EventBus, EventSubscriber, EventType, PlatformEvent } from '@repo-intel/shared';

export class TypedEventBus implements EventBus {
  private readonly subscribers = new Map<EventType, Set<EventSubscriber<any>>>();

  public async publish<T = Record<string, unknown>>(
    type: EventType,
    payload: T,
    correlationId = `corr::${Date.now()}`,
  ): Promise<void> {
    const event: PlatformEvent<T> = {
      id: `evt::${Date.now()}::${Math.floor(Math.random() * 1000)}`,
      type,
      correlationId,
      payload,
      timestamp: new Date().toISOString(),
    };

    const typeSubscribers = this.subscribers.get(type);
    if (typeSubscribers) {
      for (const subscriber of typeSubscribers) {
        try {
          await subscriber(event);
        } catch (error) {
          // Log subscriber error silently to maintain event bus resilience
          console.error(`Error in event subscriber for ${type}:`, error);
        }
      }
    }
  }

  public subscribe<T = Record<string, unknown>>(
    type: EventType,
    subscriber: EventSubscriber<T>,
  ): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }

    const set = this.subscribers.get(type)!;
    set.add(subscriber);

    return () => {
      set.delete(subscriber);
    };
  }
}
