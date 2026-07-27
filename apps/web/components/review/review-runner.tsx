'use client';

import React, { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';

export interface ReviewRunnerProps {
  onReviewComplete?: (findings: any[]) => void;
}

export function ReviewRunner({ onReviewComplete }: ReviewRunnerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(0);

  const startReview = async () => {
    setIsRunning(true);
    setStage('Extracting Git Diff...');
    setProgress(25);

    await new Promise((r) => setTimeout(r, 400));
    setStage('GraphRAG Context Retrieval...');
    setProgress(60);

    await new Promise((r) => setTimeout(r, 400));
    setStage('Multi-Agent Code Inspection...');
    setProgress(100);

    const mockFindings = [
      {
        findingId: 'f-1',
        category: 'security',
        severity: 'HIGH',
        confidenceScore: 0.95,
        filePath: 'src/user.ts',
        lineRange: { startLine: 12, endLine: 18 },
        explanation: {
          whatIsWrong: 'Potential null pointer dereference in UserService.',
          whyItMatters: 'Can cause runtime crash during user authentication.',
        },
      },
      {
        findingId: 'f-2',
        category: 'performance',
        severity: 'MEDIUM',
        confidenceScore: 0.88,
        filePath: 'src/api.ts',
        lineRange: { startLine: 45, endLine: 50 },
        explanation: {
          whatIsWrong: 'Uncached database query in hot path loop.',
          whyItMatters: 'Increases API response latency under heavy load.',
        },
      },
    ];

    setIsRunning(false);
    if (onReviewComplete) onReviewComplete(mockFindings);
  };

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Code Review Engine</h2>
          <p className="text-xs text-gray-500">Run multi-agent inspection across changed files or full repository.</p>
        </div>
        <button
          onClick={startReview}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Reviewing...' : 'Start Review'}</span>
        </button>
      </div>

      {isRunning && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{stage}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
