'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

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
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const botMsg: ChatMessage = { id: `b-${Date.now()}`, sender: 'assistant', text: '' };
    setMessages((prev) => [...prev, botMsg]);

    const responseText = `GraphRAG Retrieval Context for "${currentInput}": The repository consists of a monorepo architecture featuring AST parsing, KùzuDB Knowledge Graph, LanceDB vector search, multi-agent review orchestrators, and Fastify REST services.`;
    const words = responseText.split(' ');

    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 40));
      setMessages((prev) =>
        prev.map((m) => (m.id === botMsg.id ? { ...m, text: words.slice(0, i + 1).join(' ') } : m))
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[500px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-2 bg-gray-50 dark:bg-gray-950">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h2 className="text-sm font-semibold">GraphRAG Repository Chat</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'}`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
            >
              {m.text || <span className="animate-pulse">Thinking...</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask a question about authentication, architecture, or usages..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
