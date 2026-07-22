import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, children, className = '', style, ...props }, ref) => {
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'secondary':
          return {
            backgroundColor: 'var(--bg-surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
          };
        case 'danger':
          return {
            backgroundColor: 'var(--sev-critical-bg)',
            color: 'var(--sev-critical-text)',
            border: '1px solid var(--sev-critical-border)',
          };
        case 'primary':
        default:
          return {
            backgroundColor: 'var(--accent-primary)',
            color: '#FFFFFF',
            border: 'none',
          };
      }
    };

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      height: size === 'sm' ? '32px' : '36px',
      padding: size === 'sm' ? '0 var(--space-3)' : '0 var(--space-4)',
      borderRadius: 'var(--radius-md)',
      fontSize: size === 'sm' ? '12px' : '13px',
      fontWeight: 500,
      cursor: props.disabled ? 'not-allowed' : 'pointer',
      opacity: props.disabled ? 0.6 : 1,
      transition: 'all var(--duration-fast) var(--ease-default)',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      ...getVariantStyles(),
      ...style,
    };

    return (
      <button ref={ref} style={baseStyle} className={`ui-button ${className}`} {...props}>
        {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
        {children && <span>{children}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
