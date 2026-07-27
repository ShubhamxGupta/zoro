'use client';

import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';

export function SettingsPage() {
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [reviewDepth, setReviewDepth] = useState('standard');
  const [isSaved, setIsSaved] = useState(false);

  const saveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-6 max-w-2xl">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold">Platform Preferences & Settings</h2>
        </div>
        <button
          onClick={saveSettings}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Ollama Base URL</label>
          <input
            type="text"
            value={ollamaUrl}
            onChange={(e) => setOllamaUrl(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">Default Review Depth</label>
          <select
            value={reviewDepth}
            onChange={(e) => setReviewDepth(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg"
          >
            <option value="shallow">Shallow (Fast, Diff Only)</option>
            <option value="standard">Standard (Diff + 1-Hop Subgraph)</option>
            <option value="deep">Deep (Full Multi-Agent 2-Hop Inspection)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
