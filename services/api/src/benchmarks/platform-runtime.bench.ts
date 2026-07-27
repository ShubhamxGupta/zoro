import { describe, it, expect } from 'vitest';
import { DefaultPlatformRuntime } from '../runtime/platform-runtime.js';
import { TypedEventBus } from '../events/platform-event-bus.js';

describe('Platform Runtime Benchmark', () => {
  it('measures event throughput and workflow execution latency', async () => {
    const bus = new TypedEventBus();

    let count = 0;
    bus.subscribe('GraphUpdated', () => {
      count++;
    });

    const startPub = Date.now();
    for (let i = 0; i < 500; i++) {
      await bus.publish('GraphUpdated', { index: i });
    }
    const pubDuration = Date.now() - startPub;

    expect(count).toBe(500);
    expect(pubDuration).toBeLessThan(200); // 500 events in < 200ms

    const runtime = new DefaultPlatformRuntime();
    await runtime.initialize();

    const startWf = Date.now();
    const result = await runtime.workflowEngine.executeWorkflow('review', { repoPath: '.' });
    const wfDuration = Date.now() - startWf;

    expect(result.status).toBe('completed');
    expect(wfDuration).toBeLessThan(100);

    await runtime.shutdown();
  });
});
