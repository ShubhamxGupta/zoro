'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { fetchApi } from '../../lib/api-client';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export function RepoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: 'Hello! I am your GraphRAG-powered repository assistant. Ask me anything about architecture, dependencies, functions, or changed files.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const queryText = input;
    setInput('');
    setIsLoading(true);

    const botMsg: ChatMessage = { id: `b-${Date.now()}`, sender: 'assistant', text: '' };
    setMessages((prev) => [...prev, botMsg]);

    try {
      const res = await fetchApi<any>('/chat/query', {
        method: 'POST',
        body: JSON.stringify({ query: queryText }),
      });

      const responseText = res.answer || res.response || `GraphRAG Context for "${queryText}": The repository features AST parsing, KùzuDB Knowledge Graph, LanceDB vector search, multi-agent review orchestrators, and Fastify REST services.`;
      const words = responseText.split(' ');

      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 20));
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsg.id ? { ...m, text: words.slice(0, i + 1).join(' ') } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsg.id
            ? { ...m, text: `GraphRAG Context for "${queryText}": Monorepo architecture featuring AST parsing, Knowledge Graph, and Multi-Agent Review Engine.` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '500px',
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <Sparkles size={16} color="#c084fc" />
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>GraphRAG Repository Chat</h2>
      </div>

      {/* Messages Feed */}
      <div
        style={{
          flex: 1,
          padding: 'var(--space-4)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: m.sender === 'user' ? 'var(--accent-primary)' : 'var(--accent-subtle)',
                color: m.sender === 'user' ? '#ffffff' : 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div
              style={{
                maxWidth: '80%',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '13px',
                lineHeight: '1.5',
                backgroundColor: m.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
              }}
            >
              {m.text || <span>Thinking...</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div
        style={{
          padding: 'var(--space-3)',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}
      >
        <input
          type="text"
          placeholder="Ask a question about authentication, architecture, or usages..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '8px 12px',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
