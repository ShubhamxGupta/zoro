'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge, type BadgeVariant } from '../ui/badge';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export interface FindingItem {
  id: string;
  title: string;
  category: 'Security' | 'Logic' | 'Performance' | 'Architecture' | 'Syntax';
  severity: BadgeVariant;
  filePath: string;
  lineNumber: number;
  selected?: boolean;
}

export interface FindingsListProps {
  findings?: FindingItem[];
  selectedId?: string;
  onSelectFinding?: (id: string) => void;
}

const DEFAULT_FINDINGS: FindingItem[] = [
  {
    id: 'finding-001',
    title: 'Potential Unsanitized Input Interpolation in Cypher Query',
    category: 'Security',
    severity: 'critical',
    filePath: 'packages/graph/src/cypher/builder.ts',
    lineNumber: 44,
  },
  {
    id: 'finding-002',
    title: 'Unbounded Recursive AST Walk May Cause Memory Exhaustion',
    category: 'Performance',
    severity: 'high',
    filePath: 'packages/parser/src/scanner/walker.ts',
    lineNumber: 112,
  },
  {
    id: 'finding-003',
    title: 'Missing Fallback Provider Adapter in LLM Router Pipeline',
    category: 'Architecture',
    severity: 'medium',
    filePath: 'packages/ai/src/router/provider.router.ts',
    lineNumber: 88,
  },
];

export const FindingsList: React.FC<FindingsListProps> = ({
  findings = DEFAULT_FINDINGS,
  selectedId = 'finding-001',
  onSelectFinding,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filtered = findings.filter((f) => (filter === 'all' ? true : f.severity === filter));

  const getSeverityIcon = (sev: BadgeVariant) => {
    switch (sev) {
      case 'critical':
      case 'high':
        return <ShieldAlert size={14} />;
      case 'medium':
        return <AlertTriangle size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px', padding: 0 }}>
      <CardHeader style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CardTitle>Review Findings ({filtered.length})</CardTitle>
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            {['all', 'critical', 'high', 'medium'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: filter === f ? 'var(--accent-subtle)' : 'transparent',
                  color: filter === f ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: filter === f ? 600 : 400,
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-2)' }} className="custom-scrollbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filtered.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => onSelectFinding?.(item.id)}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                  <Badge variant={item.severity} icon={getSeverityIcon(item.severity)}>
                    {item.severity}
                  </Badge>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.category}</span>
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '18px' }}>
                  {item.title}
                </h4>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }} className="code-text">
                  {item.filePath}:{item.lineNumber}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
