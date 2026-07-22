'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderTree,
  FileCode2,
  Network,
  Sliders,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

export interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'dashboard', onSelectTab }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, active: activeTab === 'dashboard' },
    { id: 'explorer', label: 'Repo Explorer', icon: <FolderTree size={16} />, active: activeTab === 'explorer' },
    { id: 'findings', label: 'Review Findings', icon: <FileCode2 size={16} />, active: activeTab === 'findings' },
    { id: 'graph', label: 'Knowledge Graph', icon: <Network size={16} />, active: activeTab === 'graph' },
    { id: 'providers', label: 'AI Providers', icon: <Sliders size={16} />, active: activeTab === 'providers' },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} />, active: activeTab === 'settings' },
  ];

  return (
    <aside
      style={{
        width: collapsed ? '48px' : '240px',
        height: 'calc(100vh - 72px)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width var(--duration-normal) var(--ease-default)',
        flexShrink: 0,
      }}
    >
      <nav style={{ padding: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab?.(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                height: '36px',
                width: '100%',
                padding: collapsed ? '0 12px' : '0 var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-default)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div style={{ padding: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            height: '32px',
            width: '100%',
            padding: '0 var(--space-2)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {!collapsed && <span>Collapse Sidebar</span>}
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
