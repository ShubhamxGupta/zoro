'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Activity,
  Terminal,
  ChevronDown,
} from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

interface TopHeaderProps {
  activeTab?: string;
  onSelectTab: (tab: string) => void;
}

export function TopHeader({ onSelectTab }: TopHeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [apiStatus, setApiStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [activeModel] = useState<string>('Ollama (qwen2.5-coder)');

  useEffect(() => {
    fetchApi<{ status: string }>('/healthz')
      .then((res) => {
        if (res) setApiStatus('connected');
        else setApiStatus('error');
      })
      .catch(() => setApiStatus('error'));
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <header
      style={{
        height: '60px',
        padding: '0 var(--space-6)',
        backgroundColor: 'var(--bg-surface-glass)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '15px',
            boxShadow: '0 2px 10px rgba(59, 130, 246, 0.35)',
          }}
        >
          ZI
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h1 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Repo Intelligence
            </h1>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--border-glow)',
                textTransform: 'uppercase',
              }}
            >
              Enterprise v0.6.0
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GraphRAG & Multi-Agent Code Review Platform</span>
        </div>
      </div>

      {/* Global Quick Search & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          onClick={() => onSelectTab('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
            fontSize: '12px',
            cursor: 'pointer',
            width: '260px',
            transition: 'border-color var(--duration-fast)',
          }}
        >
          <Search size={14} />
          <span style={{ flex: 1 }}>Search repository or ask GraphRAG...</span>
          <kbd style={{ fontSize: '10px', backgroundColor: 'var(--bg-base)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
            ⌘K
          </kbd>
        </div>

        {/* Status Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: apiStatus === 'connected' ? 'var(--sev-info-bg)' : 'var(--sev-critical-bg)',
            border: `1px solid ${apiStatus === 'connected' ? 'var(--sev-info-border)' : 'var(--sev-critical-border)'}`,
            color: apiStatus === 'connected' ? 'var(--sev-info-text)' : 'var(--sev-critical-text)',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <Activity size={13} />
          <span>{apiStatus === 'connected' ? 'API Gateway Online' : 'Connecting...'}</span>
        </div>

        <div
          onClick={() => onSelectTab('providers')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Terminal size={13} color="var(--accent-primary)" />
          <span>{activeModel}</span>
          <ChevronDown size={12} />
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
