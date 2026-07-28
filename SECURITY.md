# Security & Credentials Management Policy

## 1. Sensitive Data Masking & Redaction

The platform logging engine (`@repo-intel/shared`) automatically sanitizes all log outputs:

- **Redacted Field Keys:** `password`, `secret`, `token`, `access_token`, `refresh_token`, `api_key`, `authorization`, `private_key`, `client_secret`, `cookie`, `cookies`, `set-cookie`.
- **String Pattern Redaction:** OpenAI API keys (`sk-...`), GitHub PAT tokens (`ghp_...`), JWT tokens (`eyJ...`), and HTTP `Bearer` authorization headers are sanitized to `[REDACTED]`.
- **API Error Responses:** Server stack traces are captured in internal logs with correlation IDs (`X-Request-ID`), but are **never exposed** in client HTTP response bodies.

---

## 2. Request Correlation & Audit Trail

- **X-Request-ID:** Every incoming HTTP request and internal workflow operation carries a unique correlation ID (`X-Request-ID`).
- **Security Audit Logging:** Actions such as `auth:login`, `auth:logout`, `provider:switch`, `extension:load`, and `patch:apply` are permanently recorded in `AuditLogger` with request correlation tracing.

---

## 3. Encryption at Rest

All sensitive provider credentials, API keys, and OAuth tokens are encrypted using **AES-256-GCM** with SHA-256 key derivation before storage in `SecretsManager`.

---

## 4. Role-Based Access Control (RBAC)

- **Administrator:** Full platform management, user configuration, provider configuration, audit log inspection.
- **Maintainer:** Repository access, provider configuration, extension management.
- **Reviewer:** Execute code reviews, inspect review sessions, export reports.
- **Developer:** Execute local reviews, submit PR comments.
- **Read-Only:** View public reports and repository documentation.
