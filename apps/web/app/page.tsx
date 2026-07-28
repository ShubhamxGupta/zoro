'use client';

import React, { useState } from 'react';
import { TopHeader } from '../components/layout/top-header';
import { SidebarNav } from '../components/layout/sidebar-nav';
import { RepositoryDashboard } from '../components/dashboard/repository-dashboard';
import { ReviewRunner } from '../components/review/review-runner';
import { FindingsExplorer } from '../components/findings/findings-explorer';
import { PatchPreviewer } from '../components/patch/patch-previewer';
import { RepoChat } from '../components/chat/repo-chat';
import { GraphViewer } from '../components/graph/graph-viewer';
import { ProviderSelector } from '../components/providers/provider-selector';
import { ExtensionManagerPage } from '../components/extensions/extension-manager-page';
import { OperationsDashboardPage } from '../components/operations/operations-dashboard-page';
import { SettingsPage } from '../components/settings/settings-page';
import { SetupWizard } from '../components/onboarding/setup-wizard';
import { PRReviewRunner } from '../components/pr/pr-review-runner';
import { RepoIntelligenceDashboard } from '../components/intelligence/repo-intelligence-dashboard';
import { ReviewHistoryView } from '../components/history/review-history-view';

export default function EnterpriseAppPage() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Bar */}
      <TopHeader activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, width: '100%' }}>
        {/* Sidebar Navigation */}
        <SidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic Main Viewport */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-6)',
            backgroundColor: 'var(--bg-base)',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)',
            }}
          >
            {activeTab === 'dashboard' && <RepositoryDashboard />}

            {activeTab === 'intelligence' && <RepoIntelligenceDashboard />}

            {activeTab === 'history' && <ReviewHistoryView />}

            {activeTab === 'review' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <ReviewRunner />
                <FindingsExplorer />
              </div>
            )}

            {activeTab === 'patch' && <PatchPreviewer />}

            {activeTab === 'pr' && <PRReviewRunner />}

            {activeTab === 'chat' && <RepoChat />}

            {activeTab === 'graph' && <GraphViewer />}

            {activeTab === 'providers' && <ProviderSelector />}

            {activeTab === 'extensions' && <ExtensionManagerPage />}

            {activeTab === 'operations' && <OperationsDashboardPage />}

            {activeTab === 'settings' && <SettingsPage />}

            {activeTab === 'onboarding' && (
              <SetupWizard onComplete={() => setActiveTab('dashboard')} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
