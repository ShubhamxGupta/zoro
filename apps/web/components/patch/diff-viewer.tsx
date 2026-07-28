'use client';

import React, { useState } from 'react';
import { FileCode, Copy, Check, Plus, Minus } from 'lucide-react';

interface DiffViewerProps {
  filePath: string;
  unifiedDiff: string;
}

export function DiffViewer({ filePath, unifiedDiff }: DiffViewerProps) {
  const [copied, setCopied] = useState(false);

  const copyPath = () => {
    navigator.clipboard.writeText(filePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = unifiedDiff.split('\n');

  // Compute addition and deletion counts
  let additions = 0;
  let deletions = 0;

  lines.forEach((line) => {
    if (line.startsWith('+') && !line.startsWith('+++')) additions++;
    if (line.startsWith('-') && !line.startsWith('---')) deletions++;
  });

  return (
    <div
      style={{
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-base)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* File Path & Diff Header */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <FileCode size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
            {filePath}
          </span>
          <button
            onClick={copyPath}
            title="Copy File Path"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            {copied ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
          <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Plus size={12} />+{additions}
          </span>
          <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Minus size={12} />-{deletions}
          </span>
        </div>
      </div>

      {/* Code Diff Body */}
      <div
        className="custom-scrollbar"
        style={{
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '12px',
          lineHeight: '20px',
          overflowX: 'auto',
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
        }}
      >
        {lines.map((line, idx) => {
          // File headers (--- a/... and +++ b/...)
          if (line.startsWith('---') || line.startsWith('+++')) {
            return (
              <div
                key={idx}
                style={{
                  padding: '2px 16px',
                  color: '#94a3b8',
                  fontSize: '11px',
                  backgroundColor: '#1e293b',
                  borderBottom: '1px solid #334155',
                }}
              >
                {line}
              </div>
            );
          }

          // Chunk range header (@@ -x,y +a,b @@)
          if (line.startsWith('@@')) {
            return (
              <div
                key={idx}
                style={{
                  padding: '4px 16px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#c084fc',
                  fontWeight: 600,
                  fontSize: '11px',
                  borderLeft: '4px solid #a855f7',
                }}
              >
                {line}
              </div>
            );
          }

          // Old Deletions (RED)
          if (line.startsWith('-')) {
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(239, 68, 68, 0.18)',
                  color: '#f87171',
                  borderLeft: '4px solid #ef4444',
                  paddingRight: '16px',
                }}
              >
                <span
                  style={{
                    width: '36px',
                    textAlign: 'right',
                    paddingRight: '12px',
                    color: '#fca5a5',
                    userSelect: 'none',
                    opacity: 0.7,
                    fontSize: '11px',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ width: '16px', color: '#ef4444', fontWeight: 700, userSelect: 'none', flexShrink: 0 }}>
                  -
                </span>
                <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line.slice(1)}</span>
              </div>
            );
          }

          // New Additions (GREEN)
          if (line.startsWith('+')) {
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(34, 197, 94, 0.18)',
                  color: '#4ade80',
                  borderLeft: '4px solid #22c55e',
                  paddingRight: '16px',
                }}
              >
                <span
                  style={{
                    width: '36px',
                    textAlign: 'right',
                    paddingRight: '12px',
                    color: '#86efac',
                    userSelect: 'none',
                    opacity: 0.7,
                    fontSize: '11px',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ width: '16px', color: '#22c55e', fontWeight: 700, userSelect: 'none', flexShrink: 0 }}>
                  +
                </span>
                <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line.slice(1)}</span>
              </div>
            );
          }

          // Context Lines
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                paddingRight: '16px',
                borderLeft: '4px solid transparent',
              }}
            >
              <span
                style={{
                  width: '36px',
                  textAlign: 'right',
                  paddingRight: '12px',
                  color: '#64748b',
                  userSelect: 'none',
                  fontSize: '11px',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </span>
              <span style={{ width: '16px', color: '#64748b', userSelect: 'none', flexShrink: 0 }}> </span>
              <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
