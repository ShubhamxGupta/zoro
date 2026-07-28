/**
 * Sensitive Data Redactor & Masking Utility
 */

const SENSITIVE_KEYS = new Set([
  'password',
  'pass',
  'secret',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'apikey',
  'api_key',
  'authorization',
  'auth',
  'bearer',
  'privatekey',
  'private_key',
  'client_secret',
  'cookie',
  'cookies',
  'set-cookie',
]);

const SENSITIVE_STRING_PATTERNS = [
  /sk-[a-zA-Z0-9]{32,}/g, // OpenAI style keys
  /ghp_[a-zA-Z0-9]{36}/g, // GitHub PATs
  /Bearer\s+[a-zA-Z0-9\-\._~\+\/]+=*/gi, // Bearer headers
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, // JWT Tokens
];

export function redactString(text: string): string {
  let sanitized = text;
  for (const pattern of SENSITIVE_STRING_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

export function redactValue(val: unknown, seen = new WeakSet()): unknown {
  if (val === null || val === undefined) {
    return val;
  }

  if (typeof val === 'string') {
    return redactString(val);
  }

  if (typeof val !== 'object') {
    return val;
  }

  if (seen.has(val as object)) {
    return '[CIRCULAR]';
  }
  seen.add(val as object);

  if (Array.isArray(val)) {
    return val.map((item) => redactValue(item, seen));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(val as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (SENSITIVE_KEYS.has(normalizedKey)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = redactValue(value, seen);
    }
  }

  return result;
}
