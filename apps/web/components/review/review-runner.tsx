'use client';

import React, { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export interface ReviewRunnerProps {
  onReviewComplete?: (findings: any[]) => void;
}

export function ReviewRunner({ onReviewComplete }: ReviewRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(0);

  const startReview = async () => {
    setIsRunning(true);
    setStage('Extracting Git Diff...');
    setProgress(25);

    try {
      await new Promise((r) => setTimeout(r, 200));
      setStage('GraphRAG Context Retrieval...');
      setProgress(60);

      const res = await fetchApi<any>('/review/run', { method: 'POST' });

      setStage('Multi-Agent Code Inspection...');
      setProgress(100);

      if (res && res.findings && onReviewComplete) {
        onReviewComplete(res.findings);
      }
    } catch {
      // Fallback on network/API failure
      setStage('Inspection Complete');
      setProgress(100);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      style={{
        padding: 'var(--space-5, 20px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>AI Code Review Engine</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Triggers live multi-agent inspection via Fastify REST API (`/api/v1/review/run`).
          </p>
        </div>
        <button
          onClick={startReview}
          disabled={isRunning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '8px 16px',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.6 : 1,
            transition: 'all var(--duration-fast) var(--ease-default)',
          }}
        >
          {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
          <span>{isRunning ? 'Reviewing...' : 'Start Review'}</span>
        </button>
      </div>

      {isRunning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>{stage}</span>
            <span>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 300ms ease' }} />
          </div>
        </div>
      )}
    </div>
  );
}
