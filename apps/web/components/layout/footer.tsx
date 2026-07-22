import React from 'react';
import { Activity, GitBranch } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        height: '24px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* System Online Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--sev-info-text)',
              display: 'inline-block',
            }}
          />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>ONLINE</span>
        </div>

        <span style={{ color: 'var(--border-strong)' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <GitBranch size={12} />
          <span>main (clean)</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={12} />
          <span>API Gateway: 3000</span>
        </div>
        <span style={{ color: 'var(--border-strong)' }}>|</span>
        <span>v0.5.0</span>
      </div>
    </footer>
  );
};
