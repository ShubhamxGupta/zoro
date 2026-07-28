import type { BaseExtension } from '@repo-intel/shared';

export class ExtensionManager {
  private readonly extensions = new Map<string, BaseExtension>();
  private readonly logs: string[] = [];

  public registerExtension(extension: BaseExtension): boolean {
    const id = extension.metadata.id.toLowerCase();
    this.extensions.set(id, extension);
    this.log(`Registered extension: ${extension.metadata.name} (${extension.metadata.version})`);
    return true;
  }

  public async initializeAll(): Promise<void> {
    for (const [id, ext] of this.extensions.entries()) {
      try {
        await ext.initialize();
        this.log(`Successfully initialized extension: ${id}`);
      } catch (err: any) {
        this.log(`Failure isolated for extension ${id}: ${err.message}`);
      }
    }
  }

  public getExtension<T extends BaseExtension>(id: string): T | undefined {
    return this.extensions.get(id.toLowerCase()) as T | undefined;
  }

  public getAllExtensions(): BaseExtension[] {
    return Array.from(this.extensions.values());
  }

  public enableExtension(id: string): boolean {
    const ext = this.extensions.get(id.toLowerCase());
    if (ext) {
      ext.isEnabled = true;
      this.log(`Enabled extension: ${id}`);
      return true;
    }
    return false;
  }

  public disableExtension(id: string): boolean {
    const ext = this.extensions.get(id.toLowerCase());
    if (ext) {
      ext.isEnabled = false;
      this.log(`Disabled extension: ${id}`);
      return true;
    }
    return false;
  }

  public async unloadExtension(id: string): Promise<boolean> {
    const ext = this.extensions.get(id.toLowerCase());
    if (ext) {
      try {
        await ext.dispose();
      } catch (err: any) {
        this.log(`Error disposing extension ${id}: ${err.message}`);
      }
      this.extensions.delete(id.toLowerCase());
      this.log(`Unloaded extension: ${id}`);
      return true;
    }
    return false;
  }

  public getLogs(): string[] {
    return [...this.logs];
  }

  private log(message: string): void {
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }
}
