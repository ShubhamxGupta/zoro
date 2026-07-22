'use client';

import React from 'react';
import { Sun, Moon, Search, Cpu, Menu } from 'lucide-react';
import { useTheme } from '../theme-provider';

export interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, onOpenCommandPalette }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      style={{
        height: '48px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        zIndex: 100,
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
          className="mobile-menu-toggle"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'none', // Shown in CSS media query for mobile
            alignItems: 'center',
          }}
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Cpu size={14} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            RepoIntel
          </span>
        </div>

        <span style={{ color: 'var(--border-strong)', padding: '0 2px' }}>/</span>

        {/* Breadcrumb path */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>repo-intelligence</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>main</span>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            height: '32px',
            padding: '0 var(--space-3)',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          <Search size={14} />
          <span>Quick search...</span>
          <kbd
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              padding: '1px 4px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Light/Dark Theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};
