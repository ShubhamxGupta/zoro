import type { ExporterExtension } from '@repo-intel/shared';

export class ExporterRegistry {
  private readonly exporters = new Map<string, ExporterExtension>();

  public registerExporter(exporter: ExporterExtension): void {
    this.exporters.set(exporter.formatId.toLowerCase(), exporter);
  }

  public getExporter(formatId: string): ExporterExtension | undefined {
    return this.exporters.get(formatId.toLowerCase());
  }

  public async exportReport(formatId: string, summary: any): Promise<string> {
    const exporter = this.getExporter(formatId);
    if (!exporter || !exporter.isEnabled) {
      throw new Error(`Unsupported or disabled report exporter format: [${formatId}]`);
    }
    return exporter.exportReport(summary);
  }

  public listFormats(): string[] {
    return Array.from(this.exporters.keys());
  }
}
