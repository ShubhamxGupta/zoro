'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Code2,
  GitBranch,
  Network,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export function RepositoryDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<any>('/history');
      setStats(data || {});
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header Banner */}
      <div
        style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Repository Intelligence Overview
            </h2>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 600 }}>
              Active Workspace: zoro
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
            Real-time multi-agent code quality, GraphRAG architectural health, and change impact analytics.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Primary Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <div style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Code Health Index</span>
            <ShieldCheck size={18} color="#4ade80" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#4ade80', marginTop: '8px' }}>94.2 / 100</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+2.4% vs last commit scan</span>
        </div>

        <div style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Indexed Code Symbols</span>
            <Code2 size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>1,482</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across 76 source files</span>
        </div>

        <div style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Call Graph Edges</span>
            <Network size={18} color="#c084fc" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#c084fc', marginTop: '8px' }}>3,920</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2-hop retrieval coverage</span>
        </div>

        <div style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Open Review Findings</span>
            <AlertTriangle size={18} color="#fb923c" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#fb923c', marginTop: '8px' }}>3</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>0 Critical, 1 High, 2 Medium</span>
        </div>
      </div>

      {/* Secondary Dashboard Content Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Recent Review Activity */}
        <div style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Recent Review Executions ({stats?.sessions?.length || 2} Total)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { id: 'sess-101', commit: 'main (a8f9210)', agents: 8, findings: 3, duration: '340ms', status: 'Passed' },
              { id: 'sess-100', commit: 'feature/patch-gen (b3c1092)', agents: 8, findings: 1, duration: '280ms', status: 'Passed' },
            ].map((sess) => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <GitBranch size={16} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{sess.commit}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>8 Specialized AI Agents • {sess.duration}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sev-high-text)' }}>{sess.findings} Findings</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--sev-info-bg)', color: 'var(--sev-info-text)', fontWeight: 600 }}>
                    {sess.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engine Status Panel */}
        <div style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Subsystem Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>AST Tree-Sitter Parsers</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>Ready (5 Languages)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Knowledge Graph</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>KùzuDB Embedded</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Vector Store</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>LanceDB Vector Search</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Circuit Breakers</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>Active (CLOSED State)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
