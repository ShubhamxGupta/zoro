'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Info, X, Sparkles } from 'lucide-react';

interface FeatureHintProps {
  title: string;
  description: string;
  tips?: string[];
}

export function FeatureHint({ title, description, tips = [] }: FeatureHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={popoverRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Sleek Info Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`${title} - Click for tips & guidance`}
        style={{
          width: '26px',
          height: '26px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: isOpen ? 'var(--accent-primary)' : 'var(--accent-subtle)',
          color: isOpen ? '#ffffff' : 'var(--accent-primary)',
          border: '1px solid var(--border-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--duration-fast)',
          flexShrink: 0,
        }}
      >
        <Info size={14} />
      </button>

      {/* Floating Info & Tips Popover Card */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '32px',
            left: 0,
            zIndex: 90,
            width: '320px',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {title}
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '18px' }}>
            {description}
          </p>

          {tips.length > 0 && (
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                <Sparkles size={11} />
                <span>Tips & Usage</span>
              </div>
              <ul style={{ paddingLeft: '14px', margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '17px' }}>
                {tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
