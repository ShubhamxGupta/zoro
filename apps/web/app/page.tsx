'use client';

import React, { useState } from 'react';
import { Header, Sidebar, Footer } from '../components/layout';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, Skeleton, Modal, CommandPalette } from '../components/ui';
import { MetricCards, FindingsList, CodeViewerPane, GraphVisualizerPane } from '../components/dashboard';
import { ShieldAlert, Sparkles, CheckCircle2, Sliders, AlertTriangle, Layers, FileCode2, Network, Palette } from 'lucide-react';

export default function DashboardPage() {
  const [activeNavTab, setActiveNavTab] = useState('dashboard');
  const [activeViewMode, setActiveViewMode] = useState<'findings' | 'graph' | 'tokens'>('findings');
  const [selectedFindingId, setSelectedFindingId] = useState('finding-001');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <Header onOpenCommandPalette={() => setIsCommandOpen(true)} />

      {/* Main Layout Body */}
      <div className="dashboard-body">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeNavTab} onSelectTab={setActiveNavTab} />

        {/* Main Viewport Content Area */}
        <main className="dashboard-viewport">
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Dashboard Title & Quick Actions Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                  <h1 className="display-title" style={{ color: 'var(--text-primary)' }}>Repository Intelligence Dashboard</h1>
                  <Badge variant="info">Phase 6 Verified</Badge>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Enterprise-grade, graph-aware, multi-agent code analysis platform.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button variant="secondary" icon={<Palette size={14} />} onClick={() => setActiveViewMode('tokens')}>
                  Design Tokens
                </Button>
                <Button variant="primary" icon={<Sparkles size={14} />} onClick={() => setIsCommandOpen(true)}>
                  Trigger Review (⌘K)
                </Button>
              </div>
            </div>

            {/* Health Metric Cards Row */}
            <MetricCards />

            {/* View Switching Navigation Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-2)' }}>
              <Button
                variant={activeViewMode === 'findings' ? 'primary' : 'ghost'}
                size="sm"
                icon={<FileCode2 size={14} />}
                onClick={() => setActiveViewMode('findings')}
              >
                Review Findings (3)
              </Button>
              <Button
                variant={activeViewMode === 'graph' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Network size={14} />}
                onClick={() => setActiveViewMode('graph')}
              >
                Knowledge Graph Subgraph
              </Button>
              <Button
                variant={activeViewMode === 'tokens' ? 'primary' : 'ghost'}
                size="sm"
                icon={<Layers size={14} />}
                onClick={() => setActiveViewMode('tokens')}
              >
                Design System Primitives
              </Button>
            </div>

            {/* View Mode 1: Review Findings Split-Pane View */}
            {activeViewMode === 'findings' && (
              <div className="split-pane-grid">
                <FindingsList selectedId={selectedFindingId} onSelectFinding={setSelectedFindingId} />
                <CodeViewerPane selectedLine={selectedFindingId === 'finding-001' ? 44 : 112} />
              </div>
            )}

            {/* View Mode 2: 2D/3D Knowledge Graph Subgraph View */}
            {activeViewMode === 'graph' && (
              <div style={{ height: '600px', width: '100%' }}>
                <GraphVisualizerPane />
              </div>
            )}

            {/* View Mode 3: Design Tokens & UI Primitives Showcase */}
            {activeViewMode === 'tokens' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Button Primitives & Action Controls</CardTitle>
                    <CardDescription>Fixed 32px/36px heights with focus accessibility rings.</CardDescription>
                  </CardHeader>
                  <CardContent style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <Button variant="primary" icon={<Sparkles size={15} />}>
                      Primary Button
                    </Button>
                    <Button variant="secondary" icon={<Sliders size={15} />}>
                      Secondary Button
                    </Button>
                    <Button variant="ghost">Ghost Action</Button>
                    <Button variant="danger" icon={<AlertTriangle size={15} />}>
                      Danger Action
                    </Button>
                    <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                      Test Modal Dialog
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Review Severity & Status Chips</CardTitle>
                  </CardHeader>
                  <CardContent style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    <Badge variant="critical" icon={<ShieldAlert size={12} />}>
                      Critical
                    </Badge>
                    <Badge variant="high">High Risk</Badge>
                    <Badge variant="medium">Medium Risk</Badge>
                    <Badge variant="low">Low Risk</Badge>
                    <Badge variant="info">Info / Pass</Badge>
                    <Badge variant="resolved" icon={<CheckCircle2 size={12} />}>
                      Resolved
                    </Badge>
                    <Badge variant="suggested-fix" icon={<Sparkles size={12} />}>
                      Suggested Fix
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skeleton Pulse Loaders</CardTitle>
                  </CardHeader>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <Skeleton height={20} width="40%" />
                    <Skeleton height={14} width="80%" />
                    <Skeleton height={14} width="60%" />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer Status Bar */}
      <Footer />

      {/* Reusable Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Test Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Settings & System Configuration"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Save Settings
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '20px' }}>
          Configured with Vanilla CSS design tokens. Press <kbd style={{ padding: '2px 6px', background: 'var(--bg-surface-elevated)', borderRadius: '4px' }}>Esc</kbd> to close.
        </p>
      </Modal>
    </div>
  );
}
