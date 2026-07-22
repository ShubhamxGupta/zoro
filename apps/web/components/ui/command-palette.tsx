'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './modal';
import { Input } from './input';
import { Search, Sparkles, Network, Settings, Sliders } from 'lucide-react';

export interface CommandPaletteItem {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (commandId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectAction }) => {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open state handled by parent or trigger
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const commands: CommandPaletteItem[] = [
    { id: 'run-review', label: 'Run Multi-Agent Review on Staged Diff', category: 'Actions', icon: <Sparkles size={14} />, action: () => onSelectAction?.('run-review') },
    { id: 'view-graph', label: 'Open Knowledge Graph 3D Viewport', category: 'Navigation', icon: <Network size={14} />, action: () => onSelectAction?.('view-graph') },
    { id: 'switch-provider', label: 'Switch AI Model Provider (Cloud / Air-Gap)', category: 'Settings', icon: <Sliders size={14} />, action: () => onSelectAction?.('switch-provider') },
    { id: 'open-settings', label: 'Open System Settings', category: 'Settings', icon: <Settings size={14} />, action: () => onSelectAction?.('open-settings') },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) || cmd.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Command Palette">
      <Input
        placeholder="Type a command or search repository symbol... (Esc to exit)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search size={14} />}
        autoFocus
      />
      <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {filteredCommands.length > 0 ? (
          filteredCommands.map((cmd) => (
            <div
              key={cmd.id}
              onClick={() => {
                cmd.action();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'background-color var(--duration-fast) var(--ease-default)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-base)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ color: 'var(--accent-primary)', display: 'inline-flex' }}>{cmd.icon}</span>
                <span>{cmd.label}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{cmd.category}</span>
            </div>
          ))
        ) : (
          <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No matching commands found.
          </div>
        )}
      </div>
    </Modal>
  );
};
