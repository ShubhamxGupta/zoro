'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

export interface FindingItem {
  findingId: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  filePath: string;
  lineRange: { startLine: number; endLine: number };
  explanation: { whatIsWrong: string; whyItMatters: string };
}

export interface FindingsExplorerProps {
  findings?: FindingItem[];
}

export function FindingsExplorer({
  findings = [
    {
      findingId: 'f-1',
      category: 'security',
      severity: 'HIGH',
      confidenceScore: 0.95,
      filePath: 'src/user.ts',
      lineRange: { startLine: 12, endLine: 18 },
      explanation: {
        whatIsWrong: 'Potential null pointer dereference in UserService.',
        whyItMatters: 'Can cause runtime crash during user authentication.',
      },
    },
    {
      findingId: 'f-2',
      category: 'performance',
      severity: 'MEDIUM',
      confidenceScore: 0.88,
      filePath: 'src/api.ts',
      lineRange: { startLine: 45, endLine: 50 },
      explanation: {
        whatIsWrong: 'Uncached database query in hot path loop.',
        whyItMatters: 'Increases API response latency under heavy load.',
      },
    },
  ],
}: FindingsExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const filtered = findings.filter((f) => {
    const matchesSearch =
      f.filePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.explanation.whatIsWrong.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    return matchesSearch && matchesSev;
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return { bg: 'var(--sev-critical-bg)', color: 'var(--sev-critical-text)', border: 'var(--sev-critical-border)' };
      case 'MEDIUM':
        return { bg: 'var(--sev-medium-bg)', color: 'var(--sev-medium-text)', border: 'var(--sev-medium-border)' };
      default:
        return { bg: 'var(--sev-low-bg)', color: 'var(--sev-low-text)', border: 'var(--sev-low-border)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search findings by file or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '34px',
              paddingRight: '12px',
              paddingTop: '8px',
              paddingBottom: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Findings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtered.map((item) => {
          const sevStyle = getSeverityStyle(item.severity);
          return (
            <div
              key={item.findingId}
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: sevStyle.bg,
                      color: sevStyle.color,
                      border: `1px solid ${sevStyle.border}`,
                    }}
                  >
                    {item.severity}
                  </span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {item.filePath}:{item.lineRange.startLine}-{item.lineRange.endLine}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Confidence: {(item.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>

              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.explanation.whatIsWrong}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.explanation.whyItMatters}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
