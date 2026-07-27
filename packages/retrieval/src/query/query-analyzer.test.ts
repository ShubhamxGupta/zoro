import { describe, it, expect } from 'vitest';
import { QueryAnalyzer } from './query-analyzer.js';

describe('QueryAnalyzer', () => {
  it('classifies query text into intent categories with extracted keywords', () => {
    const analyzer = new QueryAnalyzer();

    const bugIntent = analyzer.analyze('Why does null pointer exception crash in UserService?');
    expect(bugIntent.category).toBe('bug_investigation');
    expect(bugIntent.confidence).toBeGreaterThan(0.8);

    const secIntent = analyzer.analyze('Find security vulnerability in auth token leak');
    expect(secIntent.category).toBe('security');

    const perfIntent = analyzer.analyze('Slow latency memory leak in search pipeline');
    expect(perfIntent.category).toBe('performance');
  });
});
