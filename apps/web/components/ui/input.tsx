import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, style, className = '', ...props }, ref) => {
    const inputStyle: React.CSSProperties = {
      height: '36px',
      width: '100%',
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-primary)',
      border: error ? '1px solid var(--sev-critical-text)' : '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      paddingLeft: icon ? 'var(--space-8)' : 'var(--space-3)',
      paddingRight: 'var(--space-3)',
      fontSize: '13px',
      transition: 'border-color var(--duration-fast) var(--ease-default)',
      ...style,
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {label && (
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          {icon && (
            <span
              style={{
                position: 'absolute',
                left: 'var(--space-3)',
                display: 'inline-flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              {icon}
            </span>
          )}
          <input ref={ref} style={inputStyle} className={`ui-input ${className}`} {...props} />
        </div>
        {error ? (
          <span style={{ fontSize: '11px', color: 'var(--sev-critical-text)' }}>{error}</span>
        ) : helperText ? (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, style, className = '', ...props }, ref) => {
    const selectStyle: React.CSSProperties = {
      height: '36px',
      width: '100%',
      backgroundColor: 'var(--bg-base)',
      color: 'var(--text-primary)',
      border: error ? '1px solid var(--sev-critical-text)' : '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      paddingLeft: 'var(--space-3)',
      paddingRight: 'var(--space-6)',
      fontSize: '13px',
      cursor: 'pointer',
      ...style,
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
        {label && (
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <select ref={ref} style={selectStyle} className={`ui-select ${className}`} {...props}>
          {children}
        </select>
        {error && <span style={{ fontSize: '11px', color: 'var(--sev-critical-text)' }}>{error}</span>}
      </div>
    );
  },
);

Select.displayName = 'Select';
