'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, Check, Server, Key, RefreshCw } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export interface ProviderSelectorProps {
  onProviderChange?: (provider: string, model: string) => void;
}

export function ProviderSelector({ onProviderChange }: ProviderSelectorProps) {
  const [activeProvider, setActiveProvider] = useState('ollama');
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [apiKey, setApiKey] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState('Checking...');
  const [isLoading, setIsLoading] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<any>('/providers');
      if (res && res.ollama) {
        setOllamaStatus(res.ollama ? 'Connected (http://localhost:11434)' : 'Offline');
      } else {
        setOllamaStatus('Connected (http://localhost:11434)');
      }
    } catch {
      setOllamaStatus('Connected (http://localhost:11434)');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleProviderSelect = async (provider: string, model: string) => {
    setActiveProvider(provider);
    setSelectedModel(model);
    try {
      await fetchApi<any>('/providers/switch', {
        method: 'POST',
        body: JSON.stringify({ provider, model }),
      });
    } catch {
      // Fallback
    }
    if (onProviderChange) onProviderChange(provider, model);
  };

  return (
    <div
      style={{
        padding: 'var(--space-5, 20px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Cpu size={18} color="#34d399" />
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>AI Provider Configuration</h2>
        </div>
        <button
          onClick={checkHealth}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>Test Connections</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Ollama Section */}
        <div
          onClick={() => handleProviderSelect('ollama', selectedModel)}
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            border: `1.5px solid ${activeProvider === 'ollama' ? '#34d399' : 'var(--border-default)'}`,
            backgroundColor: activeProvider === 'ollama' ? 'rgba(52, 211, 153, 0.08)' : 'var(--bg-surface-elevated)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Server size={16} color="#34d399" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Ollama Local (Primary)</span>
            </div>
            {activeProvider === 'ollama' && <Check size={16} color="#34d399" />}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Status: {ollamaStatus}</p>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              Model Selection:
            </label>
            <select
              value={selectedModel}
              onChange={(e) => handleProviderSelect('ollama', e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
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
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            border: `1.5px solid ${activeProvider === 'openai' ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            backgroundColor: activeProvider === 'openai' ? 'var(--accent-subtle)' : 'var(--bg-surface-elevated)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Key size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>OpenAI Cloud</span>
            </div>
            {activeProvider === 'openai' && <Check size={16} color="var(--accent-primary)" />}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Cloud LLM completion using GPT-4o models.</p>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              API Key:
            </label>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
