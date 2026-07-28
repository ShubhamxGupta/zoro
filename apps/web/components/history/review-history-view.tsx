'use client';

import React, { useEffect, useRef, useState } from 'react';
import { History, Calendar, GitCommit } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export function ReviewHistoryView() {
  const [history, setHistory] = useState<any[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let isMounted = true;
    fetchApi<any>('/history')
      .then((data) => {
        if (isMounted && data?.sessions) {
          setHistory(data.sessions);
        }
      })
      .catch(() => {
        if (isMounted) setHistory([]);
      });

    return () => {
      isMounted = false;
    };
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <History size={22} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
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
        {history.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            No historical review sessions found. Run a code review to record history.
          </div>
        ) : (
          history.map((sess) => (
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
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <GitCommit size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Session {sess.id} ({sess.branch || 'main'} @ {sess.commitHash || 'latest'})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Agents: {sess.participatingAgents?.join(', ') || 'Multi-Agent Suite'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sev-high-text)' }}>
                  {sess.findingsCount ?? sess.findings?.length ?? 0} Findings
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  <span>{sess.createdAt ? new Date(sess.createdAt).toLocaleDateString() : 'Recent'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
