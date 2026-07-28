import { describe, it, expect } from 'vitest';
import { ExtensionManager } from './extension-manager.js';
import { WorkflowHookBus } from './workflow-hook-bus.js';
import { ExporterRegistry } from './exporter-registry.js';
import { SampleSecurityReviewAgentExtension } from './sample-extension.js';
import type { WorkflowExtension, ExporterExtension } from '@repo-intel/shared';

describe('Extension SDK & Plugin Framework Suite', () => {
  it('registers and manages extension lifecycle cleanly', async () => {
    const manager = new ExtensionManager();
    const sample = new SampleSecurityReviewAgentExtension();

    manager.registerExtension(sample);
    await manager.initializeAll();

    expect(manager.getAllExtensions().length).toBe(1);
    expect(manager.getExtension('org.example.custom-security-agent')).toBeDefined();

    manager.disableExtension('org.example.custom-security-agent');
    expect(sample.isEnabled).toBe(false);

    manager.enableExtension('org.example.custom-security-agent');
    expect(sample.isEnabled).toBe(true);

    const unloaded = await manager.unloadExtension('org.example.custom-security-agent');
    expect(unloaded).toBe(true);
    expect(manager.getAllExtensions().length).toBe(0);
  });

  it('runs analysis via review agent extension and returns findings', async () => {
    const sample = new SampleSecurityReviewAgentExtension();
    const findings = await sample.runAnalysis('src/config.ts', 'const AWS_SECRET_KEY = "12345";');

    expect(findings.length).toBe(1);
    expect(findings[0]?.severity).toBe('CRITICAL');
    expect(findings[0]?.explanation.whatIsWrong).toContain('Hardcoded secret');
  });

  it('isolates failures in workflow hook bus without breaking pipeline', async () => {
    const bus = new WorkflowHookBus();

    const buggyHook: WorkflowExtension = {
      metadata: {
        id: 'buggy-hook',
        name: 'Failing Hook',
        version: '1.0.0',
        author: 'Tester',
        description: 'Throws error',
        category: 'workflow',
        minPlatformVersion: '0.6.0',
        capabilities: [],
      },
      isEnabled: true,
      initialize: async () => {},
      dispose: async () => {},
      onHook: async () => {
        throw new Error('Simulated plugin failure');
      },
    };

    bus.registerHookListener(buggyHook);
    const result = await bus.emitHook('beforeReview', { data: 'test' });

    expect(result).toEqual({ data: 'test' });
  });

  it('registers custom exporter extensions in ExporterRegistry', async () => {
    const registry = new ExporterRegistry();

    const csvExporter: ExporterExtension = {
      metadata: {
        id: 'csv-exporter',
        name: 'CSV Exporter',
        version: '1.0.0',
        author: 'Team',
        description: 'CSV exporter',
        category: 'exporter',
        minPlatformVersion: '0.6.0',
        capabilities: [],
      },
      formatId: 'csv',
      isEnabled: true,
      initialize: async () => {},
      dispose: async () => {},
      exportReport: async (summary: any) =>
        `prId,findings\n${summary.prId},${summary.findingsCount}`,
    };

    registry.registerExporter(csvExporter);
    expect(registry.listFormats()).toContain('csv');

    const csvOutput = await registry.exportReport('csv', { prId: 'pr-42', findingsCount: 3 });
    expect(csvOutput).toContain('prId,findings');
    expect(csvOutput).toContain('pr-42,3');
  });
});
