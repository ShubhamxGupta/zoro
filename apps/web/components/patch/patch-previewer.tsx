'use client';

import React, { useState } from 'react';
import { Check, X, FileDiff, ShieldAlert } from 'lucide-react';

export interface PatchPreviewerProps {
  patchCandidate?: {
    id: string;
    targetFilePath: string;
    unifiedDiff: string;
    explanation: {
      problemSummary: string;
      whyThisChange: string;
      possibleRisks: string[];
      verificationSteps: string[];
    };
    confidence: number;
  };
}

export function PatchPreviewer({
  patchCandidate = {
    id: 'patch-1',
    targetFilePath: 'src/user.ts',
    unifiedDiff: `--- a/src/user.ts\n+++ b/src/user.ts\n@@ -1,1 +1,1 @@\n-export class UserService {}\n+export class UserServiceRefactored {}`,
    explanation: {
      problemSummary: 'Refactor UserService for type safety',
      whyThisChange: 'Prevents null dereference during user authentication',
      possibleRisks: ['Downstream caller parameter alignment required'],
      verificationSteps: ['Run `npm run build` and `npx vitest run`'],
    },
    confidence: 0.92,
  },
}: PatchPreviewerProps) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileDiff className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">AI Patch Candidate</h2>
        </div>
        <div className="flex items-center space-x-2">
          {status === 'pending' ? (
            <>
              <button
                onClick={() => setStatus('rejected')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => setStatus('accepted')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept Patch</span>
              </button>
            </>
          ) : (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status === 'accepted' ? 'Accepted' : 'Rejected'}
            </span>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <div><strong className="text-gray-700 dark:text-gray-300">File:</strong> {patchCandidate.targetFilePath}</div>
        <div><strong className="text-gray-700 dark:text-gray-300">Rationale:</strong> {patchCandidate.explanation.whyThisChange}</div>
        <div><strong className="text-gray-700 dark:text-gray-300">Confidence:</strong> {(patchCandidate.confidence * 100).toFixed(0)}%</div>
      </div>

      <div className="font-mono text-xs p-3 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
        <pre>{patchCandidate.unifiedDiff}</pre>
      </div>

      {patchCandidate.explanation.possibleRisks.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-start space-x-2 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Possible Risks:</strong>
            <ul className="list-disc list-inside mt-1">
              {patchCandidate.explanation.possibleRisks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
