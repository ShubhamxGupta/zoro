import React from 'react';

export type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'resolved' | 'suggested-fix';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children, icon, style, className = '', ...props }) => {
  const getBadgeColors = (): { color: string; bg: string; border?: string } => {
    switch (variant) {
      case 'critical':
        return { color: 'var(--sev-critical-text)', bg: 'var(--sev-critical-bg)', border: 'var(--sev-critical-border)' };
      case 'high':
        return { color: 'var(--sev-high-text)', bg: 'var(--sev-high-bg)', border: 'var(--sev-high-border)' };
      case 'medium':
        return { color: 'var(--sev-medium-text)', bg: 'var(--sev-medium-bg)', border: 'var(--sev-medium-border)' };
      case 'low':
        return { color: 'var(--sev-low-text)', bg: 'var(--sev-low-bg)', border: 'var(--sev-low-border)' };
      case 'resolved':
        return { color: 'var(--sev-resolved-text)', bg: 'var(--sev-resolved-bg)' };
      case 'suggested-fix':
        return { color: 'var(--sev-fix-text)', bg: 'var(--sev-fix-bg)' };
      case 'info':
      default:
        return { color: 'var(--sev-info-text)', bg: 'var(--sev-info-bg)', border: 'var(--sev-info-border)' };
    }
  };

  const { color, bg, border } = getBadgeColors();

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    height: '20px',
    padding: '0 6px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    color,
    backgroundColor: bg,
    border: border ? `1px solid ${border}` : '1px solid transparent',
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <span style={baseStyle} className={`ui-badge ${className}`} {...props}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
