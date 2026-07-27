import type { EmbeddingProvider } from '@repo-intel/shared';

export class MockEmbeddingProvider implements EmbeddingProvider {
  private readonly dims = 128;
  private readonly modelName = 'mock-embedding-v1';

  public async embed(text: string): Promise<number[]> {
    return this.generateDeterministicVector(text);
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  public dimensions(): number {
    return this.dims;
  }

  public model(): string {
    return this.modelName;
  }

  private generateDeterministicVector(text: string): number[] {
    const vector: number[] = new Array<number>(this.dims).fill(0);
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let d = 0; d < this.dims; d++) {
      const val = Math.sin(hash + d * 0.1) * Math.cos(d);
      vector[d] = val;
    }

    // Normalize to unit vector
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  }
}
