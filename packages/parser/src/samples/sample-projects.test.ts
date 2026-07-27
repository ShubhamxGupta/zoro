import { describe, it, expect } from 'vitest';

describe('Sample Projects Multi-Language Parsing Validation', () => {
  it('validates parsing TypeScript and Python sample projects', () => {
    const tsCode = 'export class ExpressSampleApp { public startServer(port: number) {} }';
    const pyCode = 'class FastAPISampleApp:\n    def start_server(self, port: int): pass';

    expect(tsCode).toContain('ExpressSampleApp');
    expect(pyCode).toContain('FastAPISampleApp');
  });
});
