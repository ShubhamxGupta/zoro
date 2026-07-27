'use client';

import React, { useState } from 'react';
import { RepositoryDashboard } from '../components/dashboard/repository-dashboard';
import { ReviewRunner } from '../components/review/review-runner';
import { FindingsExplorer } from '../components/findings/findings-explorer';
import { PatchPreviewer } from '../components/patch/patch-previewer';
import { RepoChat } from '../components/chat/repo-chat';
import { GraphViewer } from '../components/graph/graph-viewer';
import { ProviderSelector } from '../components/providers/provider-selector';
import { SettingsPage } from '../components/settings/settings-page';
import { SetupWizard } from '../components/onboarding/setup-wizard';
import {
  LayoutDashboard,
  ShieldCheck,
  FileDiff,
  MessageSquareText,
  Network,
  Cpu,
  Settings,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function MVPAppPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'review' | 'patch' | 'chat' | 'graph' | 'providers' | 'settings' | 'onboarding'>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'review', label: 'Review & Findings', icon: <ShieldCheck size={16} /> },
    { id: 'patch', label: 'Patch Preview', icon: <FileDiff size={16} /> },
    { id: 'chat', label: 'GraphRAG Chat', icon: <MessageSquareText size={16} /> },
    { id: 'graph', label: 'Knowledge Graph', icon: <Network size={16} /> },
    { id: 'providers', label: 'AI Providers', icon: <Cpu size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    { id: 'onboarding', label: 'Setup Wizard', icon: <Sparkles size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>
      {/* Header Bar */}
      <header
        style={{
          height: '56px',
          padding: '0 var(--space-6)',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            ZI
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Repo Intelligence Platform</h1>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Beta Release (v0.1.0-beta)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--sev-info-bg)', border: '1px solid var(--sev-info-border)', color: 'var(--sev-info-text)', fontSize: '12px', fontWeight: 500 }}>
            <CheckCircle2 size={14} />
            <span>Ollama Connected</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%' }}>
        {/* Sidebar Navigation */}
        <aside
          style={{
            width: '240px',
            backgroundColor: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-default)',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  height: '38px',
                  width: '100%',
                  padding: '0 var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-default)',
                  textAlign: 'left',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Viewport Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', backgroundColor: 'var(--bg-base)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {activeTab === 'dashboard' && <RepositoryDashboard />}

            {activeTab === 'review' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <ReviewRunner />
                <FindingsExplorer />
              </div>
            )}

            {activeTab === 'patch' && <PatchPreviewer />}

            {activeTab === 'chat' && <RepoChat />}

            {activeTab === 'graph' && <GraphViewer />}

            {activeTab === 'providers' && <ProviderSelector />}

            {activeTab === 'settings' && <SettingsPage />}

            {activeTab === 'onboarding' && <SetupWizard onComplete={() => setActiveTab('dashboard')} />}
          </div>
        </main>
      </div>
    </div>
  );
}
