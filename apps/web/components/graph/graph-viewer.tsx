'use client';

import React, { useEffect, useState } from 'react';
import { Network, RefreshCw } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export interface GraphNodeItem {
  id: string;
  label: string;
  kind: string;
}

export function GraphViewer() {
  const [nodes, setNodes] = useState<GraphNodeItem[]>([
    { id: 'mod::core', label: 'Core Module', kind: 'MODULE' },
    { id: 'file::user.ts', label: 'user.ts', kind: 'FILE' },
    { id: 'sym::UserService', label: 'UserService', kind: 'CLASS' },
    { id: 'sym::getUser', label: 'getUser', kind: 'FUNCTION' },
  ]);
  const [selectedNode, setSelectedNode] = useState<GraphNodeItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadGraph = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<any>('/graph/nodes');
      if (res && Array.isArray(res.nodes) && res.nodes.length > 0) {
        setNodes(res.nodes);
        setSelectedNode(res.nodes[0]);
      } else {
        setSelectedNode(nodes[0] ?? null);
      }
    } catch {
      setSelectedNode(nodes[0] ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  const getKindStyle = (kind: string) => {
    switch (kind) {
      case 'MODULE':
        return { bg: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', border: '#c084fc' };
      case 'FILE':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '#3b82f6' };
      case 'CLASS':
        return { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '#10b981' };
      default:
        return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '#f59e0b' };
    }
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
          <Network size={18} color="#c084fc" />
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Knowledge Graph Explorer</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            onClick={loadGraph}
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
            <span>Reload Graph</span>
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{nodes.length} Nodes</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
        {/* Node Canvas Area */}
        <div
          style={{
            padding: 'var(--space-6)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-base)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            minHeight: '220px',
          }}
        >
          {nodes.map((n) => {
            const style = getKindStyle(n.kind);
            const isSelected = selectedNode?.id === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setSelectedNode(n)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${style.border}`,
                  backgroundColor: style.bg,
                  color: style.color,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: isSelected ? `2px solid var(--accent-primary)` : 'none',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8 }}>{n.kind}</div>
                <div>{n.label}</div>
              </button>
            );
          })}
        </div>

        {/* Node Details Inspector */}
        <div
          style={{
            padding: 'var(--space-4)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Node Properties</h3>
          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div><strong style={{ color: 'var(--text-primary)' }}>ID:</strong> {selectedNode.id}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Label:</strong> {selectedNode.label}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Kind:</strong> {selectedNode.kind}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Degree:</strong> 4 Edges</div>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click a node to inspect metadata.</p>
          )}
        </div>
      </div>
    </div>
  );
}
