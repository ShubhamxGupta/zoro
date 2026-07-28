'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Activity,
  Terminal,
  ChevronDown,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { fetchApi } from '../../lib/api-client';
import { PlatformGuideModal } from '../common/platform-guide-modal';

interface TopHeaderProps {
  activeTab?: string;
  onSelectTab: (tab: string) => void;
}

export function TopHeader({ onSelectTab }: TopHeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [apiStatus, setApiStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [activeModel, setActiveModel] = useState<string>('Detecting Provider...');
  const [guideOpen, setGuideOpen] = useState(false);

  const checkConnection = async () => {
    setApiStatus('connecting');
    try {
      const [healthRes, provRes] = await Promise.all([
        fetchApi<{ status: string }>('/healthz'),
        fetchApi<any>('/providers').catch(() => null),
      ]);

      if (healthRes) {
        setApiStatus('connected');
        if (provRes?.activeProvider) {
          setActiveModel(`${provRes.activeProvider.toUpperCase()} (${provRes.selectedModel || 'default'})`);
        } else {
          setActiveModel('Ollama (local)');
        }
      } else {
        setApiStatus('error');
        setActiveModel('Backend Offline');
      }
    } catch {
      setApiStatus('error');
      setActiveModel('Backend Offline');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const getStatusColor = () => {
    if (apiStatus === 'connected') {
      return {
        bg: 'var(--sev-info-bg)',
        border: 'var(--sev-info-border)',
        text: 'var(--sev-info-text)',
        label: 'API Gateway Online',
      };
    }
    if (apiStatus === 'error') {
      return {
        bg: 'var(--sev-critical-bg)',
        border: 'var(--sev-critical-border)',
        text: 'var(--sev-critical-text)',
        label: 'Backend Offline',
      };
    }
    return {
      bg: 'var(--sev-medium-bg)',
      border: 'var(--sev-medium-border)',
      text: 'var(--sev-medium-text)',
      label: 'Connecting...',
    };
  };

  const statusStyle = getStatusColor();

  return (
    <>
      <header
        style={{
          minHeight: '60px',
          padding: 'var(--space-2) var(--space-6)',
          backgroundColor: 'var(--bg-surface-glass)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
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
              flexShrink: 0,
            }}
          >
            ZI
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
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
        <div className="top-header-controls" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div
            className="top-header-search"
            onClick={() => onSelectTab('chat')}
            title="Click to search repository or ask GraphRAG assistant questions"
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
              minWidth: '200px',
              maxWidth: '280px',
              flex: '1 1 auto',
              transition: 'border-color var(--duration-fast)',
            }}
          >
            <Search size={14} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Search repository or ask GraphRAG...
            </span>
            <kbd style={{ fontSize: '10px', backgroundColor: 'var(--bg-base)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-default)', flexShrink: 0 }}>
              ⌘K
            </kbd>
          </div>

          {/* Platform Guide Trigger Button */}
          <button
            onClick={() => setGuideOpen(true)}
            title="Platform Quick Guide: How to use & what does what"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-subtle)',
              border: '1px solid var(--border-glow)',
              color: 'var(--accent-primary)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            <HelpCircle size={14} />
            <span>Platform Guide</span>
          </button>

          {/* Status Badges with Click-to-Retry */}
          <div
            onClick={checkConnection}
            title="API Gateway Connection Status. Click to re-probe connection."
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: statusStyle.bg,
              border: `1px solid ${statusStyle.border}`,
              color: statusStyle.text,
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Activity size={13} />
            <span>{statusStyle.label}</span>
            <RefreshCw size={10} style={{ opacity: 0.7 }} />
          </div>

          <div
            onClick={() => onSelectTab('providers')}
            title="Current active AI Provider. Click to configure models & providers."
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
              whiteSpace: 'nowrap',
            }}
          >
            <Terminal size={13} color="var(--accent-primary)" />
            <span>{activeModel}</span>
            <ChevronDown size={12} />
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            title="Toggle Light/Dark Theme"
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
              flexShrink: 0,
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Quick Start Guide Modal */}
      <PlatformGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onSelectTab={onSelectTab}
      />
    </>
  );
}
