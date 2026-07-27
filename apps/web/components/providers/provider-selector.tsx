'use client';

import React, { useState } from 'react';
import { Cpu, Check, Server, Key } from 'lucide-react';

export interface ProviderSelectorProps {
  onProviderChange?: (provider: string, model: string) => void;
}

export function ProviderSelector({ onProviderChange }: ProviderSelectorProps) {
  const [activeProvider, setActiveProvider] = useState('ollama');
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [apiKey, setApiKey] = useState('');

  const handleProviderSelect = (provider: string, model: string) => {
    setActiveProvider(provider);
    setSelectedModel(model);
    if (onProviderChange) onProviderChange(provider, model);
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <Cpu className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-semibold">AI Provider Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ollama Section */}
        <div
          onClick={() => handleProviderSelect('ollama', selectedModel)}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${activeProvider === 'ollama' ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-sm">Ollama Local (Primary)</span>
            </div>
            {activeProvider === 'ollama' && <Check className="w-4 h-4 text-emerald-600" />}
          </div>
          <p className="text-xs text-gray-500 mt-1">100% Offline air-gapped local model inference.</p>

          <div className="mt-3">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Model Selection:</label>
            <select
              value={selectedModel}
              onChange={(e) => handleProviderSelect('ollama', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
            >
              <option value="llama3">llama3 (8B)</option>
              <option value="qwen">qwen2.5-coder</option>
              <option value="mistral">mistral-nemo</option>
              <option value="deepseek">deepseek-coder</option>
              <option value="codellama">codellama</option>
              <option value="phi">phi3</option>
            </select>
          </div>
        </div>

        {/* OpenAI Section */}
        <div
          onClick={() => handleProviderSelect('openai', 'gpt-4o')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${activeProvider === 'openai' ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-sm">OpenAI Cloud</span>
            </div>
            {activeProvider === 'openai' && <Check className="w-4 h-4 text-blue-600" />}
          </div>
          <p className="text-xs text-gray-500 mt-1">Cloud LLM completion using GPT-4o models.</p>

          <div className="mt-3">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">API Key:</label>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
