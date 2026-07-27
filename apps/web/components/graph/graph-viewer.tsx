'use client';

import React, { useState } from 'react';
import { Network } from 'lucide-react';

export interface GraphNodeItem {
  id: string;
  label: string;
  kind: string;
}

export interface GraphViewerProps {
  nodes?: GraphNodeItem[];
}

export function GraphViewer({
  nodes = [
    { id: 'mod::core', label: 'Core Module', kind: 'MODULE' },
    { id: 'file::user.ts', label: 'user.ts', kind: 'FILE' },
    { id: 'sym::UserService', label: 'UserService', kind: 'CLASS' },
    { id: 'sym::getUser', label: 'getUser', kind: 'FUNCTION' },
  ],
}: GraphViewerProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNodeItem | null>(nodes[2] ?? null);

  const getKindColor = (kind: string) => {
    switch (kind) {
      case 'MODULE':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-300';
      case 'FILE':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      case 'CLASS':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
    }
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Knowledge Graph Explorer</h2>
        </div>
        <span className="text-xs text-gray-400">142 Nodes • 320 Edges</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950 flex flex-wrap items-center justify-center gap-4 min-h-[220px]">
          {nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNode(n)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${getKindColor(n.kind)} ${selectedNode?.id === n.id ? 'ring-2 ring-purple-500 scale-105' : 'opacity-80 hover:opacity-100'}`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-70">{n.kind}</div>
              <div>{n.label}</div>
            </button>
          ))}
        </div>

        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Node Properties</h3>
          {selectedNode ? (
            <div className="space-y-1 text-xs">
              <div><strong className="text-gray-700 dark:text-gray-300">ID:</strong> {selectedNode.id}</div>
              <div><strong className="text-gray-700 dark:text-gray-300">Label:</strong> {selectedNode.label}</div>
              <div><strong className="text-gray-700 dark:text-gray-300">Kind:</strong> {selectedNode.kind}</div>
              <div><strong className="text-gray-700 dark:text-gray-300">Degree:</strong> 4 Edges</div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">Click a node to inspect metadata.</p>
          )}
        </div>
      </div>
    </div>
  );
}
