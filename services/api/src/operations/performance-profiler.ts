import type { PerformanceBenchmark } from '@repo-intel/shared';

export class PerformanceProfiler {
  private readonly benchmarks: PerformanceBenchmark[] = [
    { operationName: 'AST Parsing', durationMs: 45, timestamp: new Date().toISOString(), isBottleneck: false },
    { operationName: 'Graph Building', durationMs: 120, timestamp: new Date().toISOString(), isBottleneck: false },
    { operationName: 'GraphRAG Retrieval', durationMs: 280, timestamp: new Date().toISOString(), isBottleneck: true },
    { operationName: 'Multi-Agent Review', durationMs: 340, timestamp: new Date().toISOString(), isBottleneck: true },
  ];

  public recordBenchmark(operationName: string, durationMs: number): PerformanceBenchmark {
    const bm: PerformanceBenchmark = {
      operationName,
      durationMs,
      timestamp: new Date().toISOString(),
      isBottleneck: durationMs > 250,
    };
    this.benchmarks.push(bm);
    return bm;
  }

  public getBenchmarks(): PerformanceBenchmark[] {
    return [...this.benchmarks];
  }
}
