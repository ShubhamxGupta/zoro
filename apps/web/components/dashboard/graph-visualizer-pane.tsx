'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Network, Layers } from 'lucide-react';

export const GraphVisualizerPane: React.FC = () => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px', padding: 0, overflow: 'hidden' }}>
      <CardHeader style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-subtle)', margin: 0, backgroundColor: 'var(--bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Network size={16} style={{ color: 'var(--accent-primary)' }} />
            <CardTitle style={{ fontSize: '13px' }}>Repository Knowledge Graph Subgraph (2-Hop Context)</CardTitle>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant={viewMode === '2D' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('2D')}>
              2D Flat
            </Button>
            <Button variant={viewMode === '3D' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('3D')}>
              3D Canvas
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-base)',
          position: 'relative',
          padding: 'var(--space-6)',
        }}
      >
        {/* Graph Visual Canvas Canvas Placeholder Container */}
        <div
          style={{
            position: 'absolute',
            inset: 'var(--space-4)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={32} />
          </div>

          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Cytoscape / Three.js {viewMode} Knowledge Graph Canvas
          </h4>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '420px', textAlign: 'center', lineHeight: '18px' }}>
            Interactive 2-Hop Call Graph Subgraph container. Nodes represent <code className="code-text">SymbolNode</code>, <code className="code-text">FileNode</code>, and <code className="code-text">UnitTestNode</code> with directional <code className="code-text">CALLS</code> edges.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Badge variant="info">3 Symbol Nodes</Badge>
            <Badge variant="critical">1 Flagged Risk Node</Badge>
            <Badge variant="suggested-fix">2 Test Coverage Edges</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
