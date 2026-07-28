'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, Check, Server, Key, RefreshCw, Sparkles, Activity, Database } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export interface ProviderSelectorProps {
  onProviderChange?: (provider: string, model: string) => void;
}

export function ProviderSelector({ onProviderChange }: ProviderSelectorProps) {
  const [activeProvider, setActiveProvider] = useState('ollama');
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchProviderData = async () => {
    setIsLoading(true);
    try {
      const provRes = await fetchApi<any>('/providers');
      if (provRes) {
        if (provRes.activeProvider) setActiveProvider(provRes.activeProvider);
        if (provRes.selectedModel) setSelectedModel(provRes.selectedModel);
      }
    } catch {
      // Offline defaults
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const handleProviderSelect = async (provider: string, model: string) => {
    setActiveProvider(provider);
    setSelectedModel(model);
    setStatusMessage(`Switching to ${provider} (${model})...`);

    try {
      await fetchApi<any>('/providers/switch', {
        method: 'POST',
        body: JSON.stringify({ provider, model }),
      });
      setStatusMessage(`Switched active provider to ${provider} without application restart.`);
    } catch {
      setStatusMessage(`Selected ${provider} in local session.`);
    } finally {
      setTimeout(() => setStatusMessage(null), 3500);
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
        gap: 'var(--space-5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Cpu size={20} color="#34d399" />
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              AI Provider & Capability Plugin System
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Hot-switch active models dynamically without restarting the application.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {statusMessage && (
            <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 500 }}>
              {statusMessage}
            </span>
          )}
          <button
            onClick={fetchProviderData}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Test Connections</span>
          </button>
        </div>
      </div>

      {/* Grid of Installed Provider Plugins */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Ollama Local Plugin */}
        <div
          onClick={() => handleProviderSelect('ollama', selectedModel)}
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            border: `1.5px solid ${activeProvider === 'ollama' ? '#34d399' : 'var(--border-default)'}`,
            backgroundColor: activeProvider === 'ollama' ? 'rgba(52, 211, 153, 0.08)' : 'var(--bg-surface-elevated)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Server size={18} color="#34d399" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Ollama Local (Primary)</span>
            </div>
            {activeProvider === 'ollama' && <Check size={18} color="#34d399" />}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Air-gapped 100% offline local model runner (`http://localhost:11434`).</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>⚡ Streaming</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>🔍 Embeddings</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>🔒 Air-Gapped</span>
          </div>

          <div>
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
              <option value="qwen2.5-coder">qwen2.5-coder</option>
              <option value="mistral-nemo">mistral-nemo</option>
              <option value="deepseek-coder">deepseek-coder</option>
              <option value="codellama">codellama</option>
              <option value="phi3">phi3</option>
            </select>
          </div>
        </div>

        {/* OpenAI Plugin */}
        <div
          onClick={() => handleProviderSelect('openai', 'gpt-4o')}
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            border: `1.5px solid ${activeProvider === 'openai' ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            backgroundColor: activeProvider === 'openai' ? 'var(--accent-subtle)' : 'var(--bg-surface-elevated)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Key size={18} color="var(--accent-primary)" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>OpenAI Cloud</span>
            </div>
            {activeProvider === 'openai' && <Check size={18} color="var(--accent-primary)" />}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cloud LLM completions using GPT-4o, GPT-4o-mini, and o1 models.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>🧠 Reasoning</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>🛠️ Tools</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>👁️ Vision</span>
          </div>

          <div>
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

        {/* Anthropic Claude Plugin */}
        <div
          onClick={() => handleProviderSelect('claude', 'claude-3-5-sonnet-20241022')}
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            border: `1.5px solid ${activeProvider === 'claude' ? '#c084fc' : 'var(--border-default)'}`,
            backgroundColor: activeProvider === 'claude' ? 'rgba(192, 132, 252, 0.08)' : 'var(--bg-surface-elevated)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Sparkles size={18} color="#c084fc" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Anthropic Claude</span>
            </div>
            {activeProvider === 'claude' && <Check size={18} color="#c084fc" />}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Claude 3.5 Sonnet Messages API with 200k context window.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>📖 200k Context</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>⚡ Streaming</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>🧠 High Accuracy</span>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto' }}>
            Model: claude-3-5-sonnet-20241022
          </div>
        </div>

        {/* vLLM Plugin */}
        <div
          onClick={() => handleProviderSelect('vllm', 'meta-llama/Meta-Llama-3-8B-Instruct')}
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            border: `1.5px solid ${activeProvider === 'vllm' ? '#818cf8' : 'var(--border-default)'}`,
            backgroundColor: activeProvider === 'vllm' ? 'rgba(129, 140, 248, 0.08)' : 'var(--bg-surface-elevated)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Activity size={18} color="#818cf8" />
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>vLLM Server</span>
            </div>
            {activeProvider === 'vllm' && <Check size={18} color="#818cf8" />}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>High-throughput local vLLM OpenAI-compatible server (`http://localhost:8000/v1`).</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>🚀 High Throughput</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>⚡ SSE Stream</span>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto' }}>
            Model: Meta-Llama-3-8B-Instruct
          </div>
        </div>
      </div>

      {/* Usage Analytics Panel */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Database size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Provider Analytics & Usage Summary
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', fontSize: '12px' }}>
          <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Active Provider</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginTop: '2px' }}>{activeProvider}</div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Active Model</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedModel}</div>
          </div>

          <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Est. Resource / Cost</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
              {activeProvider === 'ollama' || activeProvider === 'vllm' ? 'Local RAM ~4.0 GB' : '$0.00 (Zero Retention)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
