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
]);
const SENSITIVE_STRING_PATTERNS = [
    /sk-[a-zA-Z0-9]{32,}/g, // OpenAI style keys
    /ghp_[a-zA-Z0-9]{36}/g, // GitHub PATs
    /Bearer\s+[a-zA-Z0-9\-\._~\+\/]+=*/gi, // Bearer headers
    /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, // JWT Tokens
];
export function redactString(text) {
    let sanitized = text;
    for (const pattern of SENSITIVE_STRING_PATTERNS) {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    return sanitized;
}
export function redactValue(val, seen = new WeakSet()) {
    if (val === null || val === undefined) {
        return val;
    }
    if (typeof val === 'string') {
        return redactString(val);
    }
    if (typeof val !== 'object') {
        return val;
    }
    if (seen.has(val)) {
        return '[CIRCULAR]';
    }
    seen.add(val);
    if (Array.isArray(val)) {
        return val.map((item) => redactValue(item, seen));
    }
    const result = {};
    for (const [key, value] of Object.entries(val)) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (SENSITIVE_KEYS.has(normalizedKey)) {
            result[key] = '[REDACTED]';
        }
        else {
            result[key] = redactValue(value, seen);
        }
    }
    return result;
}
//# sourceMappingURL=redactor.js.map