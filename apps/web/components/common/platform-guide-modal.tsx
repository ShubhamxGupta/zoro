'use client';

import React from 'react';
import {
  HelpCircle,
  X,
  LayoutDashboard,
  ShieldCheck,
  MessageSquareText,
  Cpu,
  Blocks,
  Activity,
  FileDiff,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export function PlatformGuideModal({ isOpen, onClose, onSelectTab }: PlatformGuideModalProps) {
  if (!isOpen) return null;

  const features = [
    {
      tabId: 'dashboard',
      icon: <LayoutDashboard size={18} color="var(--accent-primary)" />,
      title: 'Repository Dashboard',
      subtitle: 'Overview & Key Metrics',
      description: 'Provides real-time codebase health metrics, total indexed AST symbols, KùzuDB call graph edges, and review finding counters.',
    },
    {
      tabId: 'intelligence',
      icon: <TrendingUp size={18} color="#f59e0b" />,
      title: 'Arch Intelligence & Hotspots',
      subtitle: 'Code Quality Trends',
      description: 'Identifies high-churn, unstable modules, recurring security flaws, and historical review metrics over time.',
    },
    {
      tabId: 'review',
      icon: <ShieldCheck size={18} color="#34d399" />,
      title: 'AI Multi-Agent Review',
      subtitle: 'Static & Logic Analysis',
      description: 'Executes parallel review agents (Syntax, Security, Logic, Performance, Architecture) across modified git files.',
    },
    {
      tabId: 'patch',
      icon: <FileDiff size={18} color="#c084fc" />,
      title: 'Patch Inspector & Auto-Fix',
      subtitle: 'Verified Refactored Patches',
      description: 'Generates context-aware code refactoring patches with automated AST syntax validation before applying to disk.',
    },
    {
      tabId: 'chat',
      icon: <MessageSquareText size={18} color="#38bdf8" />,
      title: 'GraphRAG AI Assistant',
      subtitle: '2-Hop Repository Context',
      description: 'Ask deep technical questions about your codebase. Retrieves 2-hop symbol dependencies and structural code call paths.',
    },
    {
      tabId: 'providers',
      icon: <Cpu size={18} color="#a855f7" />,
      title: 'AI Provider Management',
      subtitle: 'LLM Router & Fallbacks',
      description: 'Switch and configure downstream LLM models (OpenAI, Anthropic, Ollama, vLLM) with automatic circuit breaker resiliency.',
    },
    {
      tabId: 'extensions',
      icon: <Blocks size={18} color="#ec4899" />,
      title: 'Extension SDK Marketplace',
      subtitle: 'Third-Party SDK Plugins',
      description: 'Load custom third-party security agents and review plugins into the platform runtime dynamically.',
    },
    {
      tabId: 'operations',
      icon: <Activity size={18} color="#22c55e" />,
      title: 'Operations & Telemetry',
      subtitle: 'Production Diagnostics',
      description: 'Inspect heap memory, cache hit ratios, scheduled background job retries, Prometheus metrics, and X-Request-ID correlation logs.',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: 'var(--space-5)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <HelpCircle size={22} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Platform Quick Start & Navigation Guide
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Learn what each section does and how to get the most out of Repo Intelligence.
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div
          className="custom-scrollbar"
          style={{
            padding: 'var(--space-6)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          {/* Quick How-To Section */}
          <div
            style={{
              padding: 'var(--space-4) var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} />
              <span>Recommended Workflow</span>
            </div>
            <ol style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '20px', margin: 0, lineHeight: '20px' }}>
              <li><strong>Check Overview:</strong> Start at the <em>Repository Dashboard</em> to view current Code Health and Knowledge Graph statistics.</li>
              <li><strong>Run Code Review:</strong> Navigate to <em>AI Review & Findings</em> to run static and logic security analysis.</li>
              <li><strong>Auto-Fix Findings:</strong> Inspect findings and generate AST-validated refactoring patches in <em>Patch Inspector</em>.</li>
              <li><strong>Ask GraphRAG:</strong> Open <em>GraphRAG AI Assistant</em> to query your codebase with 2-hop structural context.</li>
            </ol>
          </div>

          {/* Features Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
            {features.map((feat) => (
              <div
                key={feat.tabId}
                onClick={() => {
                  onSelectTab(feat.tabId);
                  onClose();
                }}
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  transition: 'border-color var(--duration-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {feat.icon}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {feat.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {feat.subtitle}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '17px' }}>
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
