'use client';

import React, { useState } from 'react';
import { Check, X, FileDiff, ShieldAlert, Sparkles } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export interface PatchPreviewerProps {
  patchCandidate?: {
    id: string;
    targetFilePath: string;
    unifiedDiff: string;
    explanation: {
      problemSummary: string;
      whyThisChange: string;
      possibleRisks: string[];
      verificationSteps: string[];
    };
    confidence: number;
  };
}

export function PatchPreviewer({ patchCandidate: initialPatch }: PatchPreviewerProps) {
  const [patch, setPatch] = useState(
    initialPatch ?? {
      id: 'patch-1',
      targetFilePath: 'src/user.ts',
      unifiedDiff: `--- a/src/user.ts\n+++ b/src/user.ts\n@@ -1,1 +1,1 @@\n-export class UserService {}\n+export class UserServiceRefactored {}`,
      explanation: {
        problemSummary: 'Refactor UserService for type safety',
        whyThisChange: 'Prevents null dereference during user authentication',
        possibleRisks: ['Downstream caller parameter alignment required'],
        verificationSteps: ['Run `npm run build` and `npx vitest run`'],
      },
      confidence: 0.92,
    }
  );
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePatch = async () => {
    setIsGenerating(true);
    try {
      const res = await fetchApi<any>('/patches/generate', {
        method: 'POST',
        body: JSON.stringify({ targetSymbol: 'UserService' }),
      });
      if (res) {
        setPatch(res);
        setStatus('pending');
      }
    } catch {
      // Fallback
    } finally {
      setIsGenerating(false);
    }
  };

  const acceptPatch = async () => {
    try {
      await fetchApi<any>(`/patches/${patch.id}/accept`, { method: 'POST' });
      setStatus('accepted');
    } catch {
      setStatus('accepted');
    }
  };

  const rejectPatch = async () => {
    try {
      await fetchApi<any>(`/patches/${patch.id}/reject`, { method: 'POST' });
      setStatus('rejected');
    } catch {
      setStatus('rejected');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <FileDiff size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>AI Patch Simulation</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            onClick={generatePatch}
            disabled={isGenerating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
            }}
          >
            <Sparkles size={14} />
            <span>{isGenerating ? 'Simulating...' : 'Regenerate Patch'}</span>
          </button>

          {status === 'pending' ? (
            <>
              <button
                onClick={rejectPatch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
                <span>Reject</span>
              </button>
              <button
                onClick={acceptPatch}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: 'var(--sev-info-border)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Check size={14} />
                <span>Accept Patch</span>
              </button>
            </>
          ) : (
            <span
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: status === 'accepted' ? 'var(--sev-info-bg)' : 'var(--sev-critical-bg)',
                color: status === 'accepted' ? 'var(--sev-info-text)' : 'var(--sev-critical-text)',
                border: `1px solid ${status === 'accepted' ? 'var(--sev-info-border)' : 'var(--sev-critical-border)'}`,
              }}
            >
              {status === 'accepted' ? 'Accepted' : 'Rejected'}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <div><strong style={{ color: 'var(--text-primary)' }}>File:</strong> {patch.targetFilePath}</div>
        <div><strong style={{ color: 'var(--text-primary)' }}>Rationale:</strong> {patch.explanation.whyThisChange}</div>
        <div><strong style={{ color: 'var(--text-primary)' }}>Confidence:</strong> {(patch.confidence * 100).toFixed(0)}%</div>
      </div>

      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          padding: 'var(--space-3)',
          backgroundColor: 'var(--code-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-primary)',
          overflowX: 'auto',
        }}
      >
        <pre>{patch.unifiedDiff}</pre>
      </div>

      {patch.explanation.possibleRisks.length > 0 && (
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--sev-high-bg)',
            border: '1px solid var(--sev-high-border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2)',
            fontSize: '12px',
            color: 'var(--sev-high-text)',
          }}
        >
          <ShieldAlert size={16} color="var(--sev-high-text)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>Possible Risks:</strong>
            <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
              {patch.explanation.possibleRisks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
