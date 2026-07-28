'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  FileDiff,
  MessageSquareText,
  Network,
  Cpu,
  Settings,
  Sparkles,
  Activity,
  History,
  TrendingUp,
  Blocks,
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export function SidebarNav({ activeTab, onSelectTab }: SidebarNavProps) {
  const categories = [
    {
      title: 'Overview & Intelligence',
      items: [
        { id: 'dashboard', label: 'Repository Dashboard', icon: <LayoutDashboard size={16} /> },
        { id: 'intelligence', label: 'Arch Intelligence', icon: <TrendingUp size={16} /> },
        { id: 'history', label: 'Review History', icon: <History size={16} /> },
      ],
    },
    {
      title: 'Code Review & Auto-Fix',
      items: [
        { id: 'review', label: 'AI Review & Findings', icon: <ShieldCheck size={16} /> },
        { id: 'patch', label: 'Patch Inspector', icon: <FileDiff size={16} /> },
        { id: 'pr', label: 'GitHub PR Reviews', icon: <FileDiff size={16} /> },
      ],
    },
    {
      title: 'Knowledge & Retrieval',
      items: [
        { id: 'chat', label: 'GraphRAG AI Assistant', icon: <MessageSquareText size={16} /> },
        { id: 'graph', label: 'Knowledge Graph', icon: <Network size={16} /> },
      ],
    },
    {
      title: 'System & Operations',
      items: [
        { id: 'providers', label: 'AI Provider Management', icon: <Cpu size={16} /> },
        { id: 'extensions', label: 'Extension SDK Marketplace', icon: <Blocks size={16} /> },
        { id: 'operations', label: 'Operations & Diagnostics', icon: <Activity size={16} /> },
        { id: 'settings', label: 'System Settings', icon: <Settings size={16} /> },
        { id: 'onboarding', label: 'Setup Wizard', icon: <Sparkles size={16} /> },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        padding: 'var(--space-4) var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {categories.map((cat) => (
        <div key={cat.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0 var(--space-3)',
              marginBottom: '4px',
            }}
          >
            {cat.title}
          </span>
          {cat.items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  height: '36px',
                  width: '100%',
                  padding: '0 var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast)',
                  textAlign: 'left',
                }}
              >
                <span style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
