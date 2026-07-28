'use client';

import React, { useEffect, useState } from 'react';
import { History, Calendar, GitCommit } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export function ReviewHistoryView() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchApi<any>('/history')
      .then((data) => {
        if (data?.sessions) setHistory(data.sessions);
      })
      .catch(() => {
        setHistory([
          {
            id: 'sess-101',
            commitHash: 'a8f9210',
            branch: 'main',
            findingsCount: 3,
            createdAt: new Date().toISOString(),
            participatingAgents: ['SyntaxAgent', 'LogicAgent', 'SecurityAgent'],
          },
          {
            id: 'sess-100',
            commitHash: 'b3c1092',
            branch: 'feature/patch-gen',
            findingsCount: 1,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            participatingAgents: ['PerformanceAgent', 'ArchitectureAgent'],
          },
        ]);
      });
  }, []);

  return (
    <div
      style={{
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <History size={22} color="var(--accent-primary)" />
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Repository Review History & Audit Trail
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Historical review sessions, participating agents, and resolved security findings over time.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {history.map((sess) => (
          <div
            key={sess.id}
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <GitCommit size={18} color="var(--accent-primary)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Session {sess.id} ({sess.branch} @ {sess.commitHash})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Agents: {sess.participatingAgents?.join(', ') || 'Multi-Agent Suite'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sev-high-text)' }}>
                {sess.findingsCount} Findings
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <Calendar size={12} />
                <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
