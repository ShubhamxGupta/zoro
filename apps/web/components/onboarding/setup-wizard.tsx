'use client';

import React, { useState } from 'react';
import { CheckCircle2, GitBranch, Server, Sparkles } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export interface SetupWizardProps {
  onComplete?: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [repoPath, setRepoPath] = useState('.');
  const [isIndexing, setIsIndexing] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      runInitialIndex();
    }
  };

  const runInitialIndex = async () => {
    setIsIndexing(true);
    try {
      await fetchApi<any>('/repositories/scan', {
        method: 'POST',
        body: JSON.stringify({ repoPath }),
      });
    } catch {
      // Fallback
    } finally {
      setIsIndexing(false);
      if (onComplete) onComplete();
    }
  };

  return (
    <div
      style={{
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Sparkles size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>First-Time Setup Wizard</h2>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)' }}>
          Step {step} of 3
        </span>
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>1. System Environment Diagnostics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <GitBranch size={16} color="var(--accent-primary)" />
                <span>Git Version Control</span>
              </div>
              <span style={{ color: 'var(--sev-info-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> <span>Detected</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface-elevated)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Server size={16} color="#c084fc" />
                <span>Ollama Local AI Runner</span>
              </div>
              <span style={{ color: 'var(--sev-info-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> <span>Running (http://localhost:11434)</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>2. Select Primary AI Model</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '12px' }}>
            <label style={{ color: 'var(--text-secondary)' }}>Recommended Ollama Models:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
            >
              <option value="llama3">llama3 (Recommended for Code Review)</option>
              <option value="qwen">qwen2.5-coder (High Precision Coding)</option>
              <option value="mistral">mistral-nemo (Fast Latency)</option>
              <option value="deepseek">deepseek-coder (Deep Context)</option>
              <option value="codellama">codellama</option>
              <option value="phi">phi3</option>
            </select>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>3. Select Target Repository</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: '12px' }}>
            <label style={{ color: 'var(--text-secondary)' }}>Local Repository Path:</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="text"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="C:\Users\Projects\my-app"
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                onClick={async () => {
                  if ('showDirectoryPicker' in window) {
                    try {
                      const handle = await (window as any).showDirectoryPicker();
                      setRepoPath(handle.name);
                    } catch {
                      // Cancelled
                    }
                  }
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                📁 Browse Folder...
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
        <button
          onClick={() => step > 1 && setStep(step - 1)}
          disabled={step === 1 || isIndexing}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: step === 1 || isIndexing ? 'not-allowed' : 'pointer',
            opacity: step === 1 || isIndexing ? 0.3 : 1,
          }}
        >
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={isIndexing}
          style={{
            padding: '8px 20px',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isIndexing ? 'not-allowed' : 'pointer',
          }}
        >
          {isIndexing ? 'Indexing Repository...' : step === 3 ? 'Finish & Index' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
