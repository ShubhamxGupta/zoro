import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ children, style, className = '', ...props }, ref) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    boxShadow: 'var(--shadow-sm)',
    ...style,
  };

  return (
    <div ref={ref} style={baseStyle} className={`ui-card ${className}`} {...props}>
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, style, className = '', ...props }) => (
  <div style={{ marginBottom: 'var(--space-3)', ...style }} className={`ui-card-header ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, style, className = '', ...props }) => (
  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', ...style }} className={`ui-card-title ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, style, className = '', ...props }) => (
  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', ...style }} className={`ui-card-desc ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, style, className = '', ...props }) => (
  <div style={{ ...style }} className={`ui-card-content ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, style, className = '', ...props }) => (
  <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-2)', ...style }} className={`ui-card-footer ${className}`} {...props}>
    {children}
  </div>
);
