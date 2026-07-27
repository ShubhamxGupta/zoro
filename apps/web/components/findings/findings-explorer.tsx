'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

export interface FindingItem {
  findingId: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  filePath: string;
  lineRange: { startLine: number; endLine: number };
  explanation: { whatIsWrong: string; whyItMatters: string };
}

export interface FindingsExplorerProps {
  findings?: FindingItem[];
}

export function FindingsExplorer({
  findings = [
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
  ],
}: FindingsExplorerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const filtered = findings.filter((f) => {
    const matchesSearch =
      f.filePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.explanation.whatIsWrong.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    return matchesSearch && matchesSev;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search findings by file or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.findingId}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(item.severity)}`}>
                  {item.severity}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  {item.filePath}:{item.lineRange.startLine}-{item.lineRange.endLine}
                </span>
              </div>
              <span className="text-xs text-gray-400">Confidence: {(item.confidenceScore * 100).toFixed(0)}%</span>
            </div>

            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.explanation.whatIsWrong}</div>
            <div className="text-xs text-gray-500">{item.explanation.whyItMatters}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
