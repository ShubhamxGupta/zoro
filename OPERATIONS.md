# Production Operations, Observability & Troubleshooting Guide

## 1. Structured Logging & Tracing Architecture

The platform uses a unified, structured JSON logger (`@repo-intel/shared`) across all microservices and packages.

### Standardized Log Schema

Every log entry adheres to a strict JSON format:

```json
{
  "timestamp": "2026-07-28T15:00:00.000Z",
  "level": "info",
  "service": "repo-intel-service",
  "component": "API-Gateway",
  "message": "HTTP Request Completed",
  "context": {
    "requestId": "9b7ce615-0fca-4482-aa92-8f35bd4f99c8",
    "method": "POST",
    "url": "/api/v1/review/run",
    "statusCode": 200,
    "responseTimeMs": 14.5
  }
}
```

### Request Correlation (`X-Request-ID`)

- **Incoming Requests:** Reads `x-request-id` header from incoming HTTP request. If missing, generates a UUID v4
  correlation ID.
- **Header Response:** Returns `X-Request-ID` header on all HTTP responses.
- **Context Storage:** Stores `requestId` in AsyncLocalStorage (`LogContextManager`) for automatic propagation across
  asynchronous calls, AI providers, git providers, and background queue workers.

---

## 2. Slow Request Monitoring

Requests exceeding the configured threshold (default: **500 ms**) trigger a `WARNING` log:

```json
{
  "msg": "Slow HTTP Request Detected",
  "endpoint": "/api/v1/review/run",
  "durationMs": 620.5,
  "thresholdMs": 500,
  "requestId": "req-12345",
  "component": "Performance-Monitor"
}
```

---

## 3. Operations & Telemetry Metrics

- **Prometheus Metrics:** `GET /metrics` or `GET /api/v1/metrics`
- **Exposed Gauges & Counters:**
    - `repo_intel_total_requests` (HTTP request count)
    - `repo_intel_total_errors` (Error count)
    - `repo_intel_request_latency_ms` (Average request duration)
    - `repo_intel_memory_usage_mb` (Heap used)
    - `repo_intel_cache_hit_ratio_percent` (Multi-tier cache hit ratio)
    - `repo_intel_job_executions_total` (Scheduled background job count)
    - `repo_intel_uptime_seconds` (Uptime counter)

---

## 4. Health & Diagnostics Endpoints

- **Liveness Probe:** `GET /api/v1/operations/liveness`
- **Readiness Probe:** `GET /api/v1/operations/readiness`
- **Deep System Diagnostics:** `GET /api/v1/operations/diagnostics`

---

## 5. Environment Configuration Reference

| Environment Variable        | Default Value  | Description                                                                     |
|-----------------------------|----------------|---------------------------------------------------------------------------------|
| `SLOW_REQUEST_THRESHOLD_MS` | `500`          | Microsecond duration threshold for slow request warning logs                    |
| `LOG_LEVEL`                 | `info`         | Minimum log severity level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`) |
| `REQUEST_ID_HEADER`         | `x-request-id` | HTTP header name for request correlation tracing                                |
| `PRETTY_LOGGING`            | `false`        | Enable human-readable console logging formatting for local dev                  |
| `ENABLE_STACK_TRACES`       | `true`         | Include stack trace in server-side error log payloads                           |
