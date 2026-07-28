'use client';

import React, { useEffect, useState } from 'react';
import { Brain, Flame, TrendingUp, ThumbsUp, History } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export function RepoIntelligenceDashboard() {
  const [intelligence, setIntelligence] = useState<any>(null);

  const loadDashboardData = async () => {
    try {
      const intelRes = await fetchApi<any>('/repository/intelligence');
      if (intelRes?.intelligence) setIntelligence(intelRes.intelligence);
    } catch {
      setIntelligence(null);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div
      style={{
        padding: 'var(--space-5, 20px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      <div className="responsive-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Brain size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Repository Memory & Trend Intelligence
          </h2>
        </div>
        <button
          onClick={loadDashboardData}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Refresh Insights
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <History size={14} />
            <span>Total Reviews</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {intelligence?.trends?.totalReviews || 0}
          </div>
        </div>

        <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '12px' }}>
            <ThumbsUp size={14} />
            <span>Patch Acceptance</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
            {intelligence?.trends?.patchAcceptanceRate || 100}%
          </div>
        </div>

        <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '12px' }}>
            <TrendingUp size={14} />
            <span>False Positive Rate</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '4px' }}>
            {intelligence?.trends?.falsePositiveRate || 0}%
          </div>
        </div>

        <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '12px' }}>
            <Flame size={14} />
            <span>Code Hotspots</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
            {intelligence?.hotspots?.length || 0}
          </div>
        </div>
      </div>

      {/* Code Hotspots Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Flame size={16} color="#f59e0b" />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Unstable Modules & Code Hotspots</h3>
        </div>

        <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
          {!intelligence?.hotspots || intelligence.hotspots.length === 0 ? (
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
              No high-churn or unstable code hotspots identified in the codebase.
            </div>
          ) : (
            intelligence.hotspots.map((h: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <div style={{ fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{h.filePath}</div>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '12px', flexWrap: 'wrap' }}>
                  <span>Findings: {h.findingCount}</span>
                  <span style={{ color: h.unstableScore > 0.5 ? '#f87171' : '#34d399', fontWeight: 600 }}>
                    Unstable Score: {h.unstableScore}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
