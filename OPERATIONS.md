# Production Operations, Runbook & Performance Tuning Guide

## Health & Diagnostics Endpoints

- Liveness Check: `GET /api/v1/operations/liveness`
- Readiness Check: `GET /api/v1/operations/readiness`
- Diagnostics Report: `GET /api/v1/operations/diagnostics`

## Troubleshooting & Failure Recovery

### AI Provider Failures & Circuit Breakers

If downstream LLM API providers fail or timeout, the `ResilienceCircuitBreaker` will automatically open and degrade gracefully using cached or fallback responses. To reset circuit breakers, inspect `/api/v1/operations/health`.

### Queue & Job Retries

To retry stalled background jobs via CLI:

```bash
repo-intel operations retry <jobId>
```
