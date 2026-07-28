'use client';

import React, { useEffect, useState } from 'react';
import { Plug, Power, RefreshCw } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export function ExtensionManagerPage() {
  const [extensions, setExtensions] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const loadExtensionsData = async () => {
    try {
      const [extRes, logRes] = await Promise.all([
        fetchApi<any>('/extensions'),
        fetchApi<any>('/extensions/logs'),
      ]);

      if (extRes?.extensions) setExtensions(extRes.extensions);
      if (logRes?.logs) setLogs(logRes.logs);
    } catch {
      setExtensions([]);
      setLogs([]);
    }
  };

  const toggleExtension = async (id: string, currentlyEnabled: boolean) => {
    const endpoint = currentlyEnabled ? '/extensions/disable' : '/extensions/enable';
    await fetchApi(endpoint, { method: 'POST', body: JSON.stringify({ extensionId: id }) });
    loadExtensionsData();
  };

  useEffect(() => {
    loadExtensionsData();
  }, []);

  return (
    <div
      style={{
        padding: 'var(--space-5, 20px)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Plug size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Extension SDK & Plugin Marketplace
          </h2>
        </div>
        <button
          onClick={loadExtensionsData}
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Extension Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {extensions.length === 0 ? (
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            No third-party SDK extensions registered yet. Load an extension via REST API or CLI.
          </div>
        ) : (
          extensions.map((ext) => (
            <div
              key={ext.metadata.id}
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {ext.metadata.name}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                    v{ext.metadata.version}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--accent-primary-alpha)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {ext.metadata.category}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Author: {ext.metadata.author} | ID: <code style={{ fontSize: '11px' }}>{ext.metadata.id}</code>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  {ext.metadata.capabilities?.map((cap: string) => (
                    <span key={cap} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => toggleExtension(ext.metadata.id, ext.isEnabled)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: ext.isEnabled ? '#22c55e' : 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: ext.isEnabled ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Power size={14} />
                {ext.isEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Extension Activity Logs */}
      {logs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'var(--space-4)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Extension Execution Activity Logs</span>
          <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--code-bg)', border: '1px solid var(--border-default)', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
            {logs.map((log, i) => (
              <div key={i}>&gt; {log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
