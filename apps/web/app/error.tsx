'use client';

import React, { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to diagnostic output
    console.error('Unhandled UI Exception caught by error boundary:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--bg-base)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--sev-critical-bg)',
          color: 'var(--sev-critical-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
          border: '1px solid var(--sev-critical-border)',
        }}
      >
        <ShieldAlert size={32} />
      </div>

      <h1 className="h1" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        Application Error Encounted
      </h1>

      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', marginBottom: 'var(--space-4)', fontSize: '13px' }}>
        {error.message || 'An unexpected rendering error occurred in the user interface viewport.'}
      </p>

      {error.digest && (
        <code className="code-text" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
          Digest ID: {error.digest}
        </code>
      )}

      <Button variant="primary" icon={<RotateCcw size={15} />} onClick={() => reset()}>
        Reload Viewport State
      </Button>
    </div>
  );
}
