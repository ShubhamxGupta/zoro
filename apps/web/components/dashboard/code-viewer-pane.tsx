import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ShieldAlert, Sparkles, FileCode } from 'lucide-react';

export interface CodeViewerPaneProps {
  filePath?: string;
  selectedLine?: number;
}

export const CodeViewerPane: React.FC<CodeViewerPaneProps> = ({
  filePath = 'packages/graph/src/cypher/builder.ts',
  selectedLine = 44,
}) => {
  const codeSnippet = [
    { num: 40, text: "export function buildSymbolQuery(identifier: string): string {" },
    { num: 41, text: "  // Construct graph Cypher traversal query" },
    { num: 42, text: "  const cleanId = sanitizeIdentifier(identifier);" },
    { num: 43, text: "  " },
    { num: 44, text: "  const query = `MATCH (n:SymbolNode {id: '${identifier}'}) RETURN n`;", flagged: true },
    { num: 45, text: "  return query;" },
    { num: 46, text: "}" },
  ];

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px', padding: 0, overflow: 'hidden' }}>
      <CardHeader style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)', margin: 0, backgroundColor: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileCode size={16} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }} className="code-text">
              {filePath}
            </span>
          </div>
          <Badge variant="critical">Line {selectedLine}</Badge>
        </div>
      </CardHeader>

      <CardContent style={{ flex: 1, padding: 0, backgroundColor: 'var(--code-bg)', overflowY: 'auto' }} className="custom-scrollbar">
        <div style={{ padding: 'var(--space-4) 0', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', lineHeight: '20px' }}>
          {codeSnippet.map((line) => (
            <React.Fragment key={line.num}>
              <div
                style={{
                  display: 'flex',
                  backgroundColor: line.flagged ? 'rgba(255, 107, 107, 0.12)' : 'transparent',
                  borderLeft: line.flagged ? '3px solid var(--sev-critical-text)' : '3px solid transparent',
                  padding: '0 var(--space-4)',
                }}
              >
                <span style={{ width: '40px', color: 'var(--text-muted)', userSelect: 'none', textAlign: 'right', paddingRight: 'var(--space-4)' }}>
                  {line.num}
                </span>
                <span style={{ color: line.flagged ? 'var(--sev-critical-text)' : 'var(--text-primary)', whiteSpace: 'pre' }}>
                  {line.text}
                </span>
              </div>

              {/* Inline Review Annotation Widget */}
              {line.flagged && (
                <div style={{ margin: 'var(--space-3) var(--space-6)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--sev-critical-bg)', border: '1px solid var(--sev-critical-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <ShieldAlert size={16} style={{ color: 'var(--sev-critical-text)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sev-critical-text)' }}>
                      [CRITICAL] Potential Unsanitized Cypher Injection
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: 'var(--space-3)', lineHeight: '18px' }}>
                    Input parameter <code className="code-text" style={{ padding: '1px 4px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>identifier</code> is directly concatenated into Cypher query string instead of using sanitized parameter binding.
                  </p>

                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Button variant="primary" size="sm" icon={<Sparkles size={13} />}>
                      Apply Suggested Fix Patch
                    </Button>
                    <Button variant="secondary" size="sm">
                      View Subgraph Evidence Chain
                    </Button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
