import type { ExplainableFinding } from '@repo-intel/shared';
import { JSONExtractor } from './json-extractor.js';
import { SchemaValidator } from './schema-validator.js';

export class AutoRepairPromptBuilder {
  public static buildRepairPrompt(rawContent: string, schemaError: string): string {
    return `Your previous JSON output failed validation schema.
    
ERROR DETAILS:
${schemaError}

RAW OUTPUT WAS:
${rawContent.substring(0, 500)}

INSTRUCTIONS:
Return strictly a valid JSON array of objects conforming to the ExplainableFinding schema:
[
  {
    "findingId": "finding-1",
    "agentId": "SecurityAgent",
    "category": "security",
    "severity": "HIGH",
    "confidenceScore": 0.95,
    "filePath": "src/auth.ts",
    "lineRange": { "startLine": 10, "endLine": 12 },
    "explanation": {
      "whatIsWrong": "Unsanitized user input in query",
      "whyItMatters": "Enables SQL injection vulnerability",
      "impactedComponents": ["AuthService"]
    }
  }
]
No markdown fences or conversation text. Output raw JSON array only.`;
  }
}

export class JSONResponseValidator {
  public validate(rawCompletion: string): {
    success: boolean;
    findings: ExplainableFinding[];
    error?: string;
  } {
    const extracted = JSONExtractor.extractJSON(rawCompletion);
    if (!extracted) {
      return { success: false, findings: [], error: 'No JSON payload found in raw completion.' };
    }

    try {
      const parsed = JSON.parse(extracted);
      return SchemaValidator.validateFindings(parsed);
    } catch (err: any) {
      return { success: false, findings: [], error: `JSON Syntax Error: ${err.message}` };
    }
  }
}
