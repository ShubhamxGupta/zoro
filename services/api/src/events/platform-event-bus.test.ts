import { describe, it, expect } from 'vitest';
import { TypedEventBus } from './platform-event-bus.js';

describe('TypedEventBus', () => {
  it('publishes and subscribes to typed platform events with correlation IDs', async () => {
    const bus = new TypedEventBus();
    const receivedEvents: string[] = [];

    const unsubscribe = bus.subscribe('ReviewStarted', (event) => {
      receivedEvents.push(event.type);
      expect(event.correlationId).toBe('corr-123');
    });

    await bus.publish('ReviewStarted', { repo: 'zoro' }, 'corr-123');
    expect(receivedEvents).toContain('ReviewStarted');

    unsubscribe();
    await bus.publish('ReviewStarted', { repo: 'zoro' }, 'corr-124');
    expect(receivedEvents.length).toBe(1);
  });
});
