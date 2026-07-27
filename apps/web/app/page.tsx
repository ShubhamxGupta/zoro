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
import {
  LayoutDashboard,
  ShieldCheck,
  FileDiff,
  MessageSquareText,
  Network,
  Cpu,
  Settings,
} from 'lucide-react';

export default function MVPAppPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'review' | 'patch' | 'chat' | 'graph' | 'providers' | 'settings'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            ZI
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none">Repo Intelligence Platform</h1>
            <span className="text-[11px] text-gray-500 font-medium">Minimum Lovable Prototype (MVP Track)</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <LayoutDashboard className="w-4 h-4 text-blue-500" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'review' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Review & Findings</span>
          </button>

          <button
            onClick={() => setActiveTab('patch')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'patch' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <FileDiff className="w-4 h-4 text-indigo-500" />
            <span>Patch Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'chat' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <MessageSquareText className="w-4 h-4 text-purple-500" />
            <span>GraphRAG Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'graph' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Network className="w-4 h-4 text-amber-500" />
            <span>Knowledge Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'providers' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Cpu className="w-4 h-4 text-emerald-500" />
            <span>AI Providers</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span>Settings</span>
          </button>
        </aside>

        {/* Viewport Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeTab === 'dashboard' && <RepositoryDashboard />}

            {activeTab === 'review' && (
              <div className="space-y-6">
                <ReviewRunner />
                <FindingsExplorer />
              </div>
            )}

            {activeTab === 'patch' && <PatchPreviewer />}

            {activeTab === 'chat' && <RepoChat />}

            {activeTab === 'graph' && <GraphViewer />}

            {activeTab === 'providers' && <ProviderSelector />}

            {activeTab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  );
}
