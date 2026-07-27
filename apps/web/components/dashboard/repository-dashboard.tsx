'use client';

import React from 'react';
import { HardDrive, Code, Cpu, Activity, CheckCircle2 } from 'lucide-react';

export interface RepositoryDashboardProps {
  repoName?: string;
  languages?: string[];
  filesCount?: number;
  symbolsCount?: number;
  nodeCount?: number;
  edgeCount?: number;
  lastIndexedTime?: string;
  activeProvider?: string;
  selectedModel?: string;
}

export function RepositoryDashboard({
  repoName = 'zoro',
  languages = ['TypeScript', 'JSON', 'Markdown'],
  filesCount = 25,
  symbolsCount = 142,
  nodeCount = 142,
  edgeCount = 320,
  lastIndexedTime = 'Just now',
  activeProvider = 'ollama',
  selectedModel = 'llama3',
}: RepositoryDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repository Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of repository index, knowledge graph, and AI runtime status.</p>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Status: Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Repository</span>
            <HardDrive className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold">{repoName}</div>
          <div className="text-xs text-gray-400">Languages: {languages.join(', ')}</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Index Size</span>
            <Code className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold">{filesCount} Files ({lastIndexedTime})</div>
          <div className="text-xs text-gray-400">{symbolsCount} Symbols Extracted</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">Knowledge Graph</span>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold">{nodeCount} Nodes</div>
          <div className="text-xs text-gray-400">{edgeCount} Semantic Edges</div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-medium uppercase tracking-wider">AI Engine</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold capitalize">{activeProvider}</div>
          <div className="text-xs text-gray-400">Model: {selectedModel}</div>
        </div>
      </div>
    </div>
  );
}
