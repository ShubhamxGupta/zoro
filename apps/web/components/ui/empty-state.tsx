import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-16) var(--space-6)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--accent-subtle)',
          color: 'var(--accent-primary)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          maxWidth: '400px',
          lineHeight: '18px',
          marginBottom: action ? 'var(--space-6)' : 0,
        }}
      >
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
