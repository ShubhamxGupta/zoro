# Security & Credentials Management Policy

## Encryption at Rest

All sensitive provider credentials, API keys, and OAuth tokens are encrypted using **AES-256-CBC / GCM** before storage.

## Role-Based Access Control (RBAC)

- **Administrator:** Full platform management, user configuration, provider configuration, audit log inspection.
- **Maintainer:** Repository access, provider configuration, extension management.
- **Reviewer:** Execute code reviews, inspect review sessions, export reports.
- **Developer:** Execute local reviews, submit PR comments.
- **Read-Only:** View public reports and repository documentation.

## Audit Logging

All security-critical actions (`auth:login`, `auth:logout`, `provider:switch`, `extension:load`, `patch:apply`) are permanently recorded in the system audit trail.
