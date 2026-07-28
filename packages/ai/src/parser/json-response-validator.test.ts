import { describe, it, expect } from 'vitest';
import { JSONExtractor } from './json-extractor.js';
import { SchemaValidator } from './schema-validator.js';
import { JSONResponseValidator, AutoRepairPromptBuilder } from './json-response-validator.js';

describe('JSON Response Validator & Parser Suite', () => {
  it('strips markdown code blocks and extracts raw JSON array', () => {
    const raw = `Here is the review finding:
\`\`\`json
[
  {
    "findingId": "finding-101",
    "agentId": "SecurityAgent",
    "category": "security",
    "severity": "CRITICAL",
    "confidenceScore": 0.98,
    "filePath": "src/auth.ts",
    "lineRange": { "startLine": 15, "endLine": 18 },
    "explanation": {
      "whatIsWrong": "SQL Injection",
      "whyItMatters": "Vulnerability"
    }
  }
]
\`\`\`
Hope this helps!`;

    const extracted = JSONExtractor.extractJSON(raw);
    expect(extracted.startsWith('[')).toBe(true);
    expect(extracted.endsWith(']')).toBe(true);
  });

  it('validates extracted JSON against ExplainableFinding Zod schema', () => {
    const rawJSON = [
      {
        findingId: 'finding-102',
        agentId: 'BugDetectionAgent',
        category: 'logic',
        severity: 'HIGH',
        confidenceScore: 0.92,
        filePath: 'src/user.ts',
        lineRange: { startLine: 20, endLine: 22 },
        explanation: {
          whatIsWrong: 'Null dereference',
          whyItMatters: 'TypeError crash',
        },
      },
    ];

    const result = SchemaValidator.validateFindings(rawJSON);
    expect(result.success).toBe(true);
    expect(result.findings.length).toBe(1);
    expect(result.findings[0]?.category).toBe('logic');
  });

  it('handles invalid schema payload gracefully and produces auto-repair prompt', () => {
    const invalidCompletion = '```json\n{"invalid": "data"}\n```';
    const validator = new JSONResponseValidator();
    const result = validator.validate(invalidCompletion);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    const repairPrompt = AutoRepairPromptBuilder.buildRepairPrompt(invalidCompletion, result.error!);
    expect(repairPrompt).toContain('Your previous JSON output failed validation schema.');
  });
});
