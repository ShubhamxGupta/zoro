import { describe, test, expect } from 'vitest';
import { createMockLogger, createMockFinding, createMockGraphNode } from '../index.js';

describe('Testing Infrastructure Mock Factories', () => {
  test('createMockLogger records info and error calls', () => {
    const logger = createMockLogger();
    logger.info('Test Info Message', { id: 1 });
    logger.error('Test Error Message');

    expect(logger.records).toHaveLength(2);
    expect(logger.records[0].level).toBe('info');
    expect(logger.records[0].message).toBe('Test Info Message');
    expect(logger.records[1].level).toBe('error');
  });

  test('createMockFinding generates valid finding object', () => {
    const finding = createMockFinding({ severity: 'CRITICAL' });
    expect(finding.id).toBe('mock-finding-001');
    expect(finding.severity).toBe('CRITICAL');
    expect(finding.category).toBe('SECURITY');
  });

  test('createMockGraphNode generates valid graph node object', () => {
    const node = createMockGraphNode({ id: 'custom-node' });
    expect(node.id).toBe('custom-node');
    expect(node.type).toBe('Class');
    expect(node.label).toBe('UserService');
  });
});
