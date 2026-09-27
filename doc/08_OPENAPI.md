# Hidden Failures Intelligence — Editable API Contract

Base URL example:

```text
/api/v1
```

All responses use JSON except file upload.

## Conventions

- IDs are UUID strings.
- Times are ISO-8601 UTC timestamps.
- Error format:

```json
{
  "error": {
    "code": "INVALID_DATASET",
    "message": "Line 42 is not valid JSON."
  }
}
```

- Long-running analysis returns a run resource and is polled in P0.

## Endpoint Index

### System

- `GET /health`

### Datasets

- `POST /datasets/import`
- `GET /datasets`
- `GET /datasets/{datasetId}`

### Analysis Runs

- `POST /analysis-runs`
- `GET /analysis-runs/{runId}`
- `GET /analysis-runs/{runId}/summary`

### Issues / Clusters

- `GET /analysis-runs/{runId}/clusters`
- `GET /clusters/{clusterId}`
- `GET /clusters/{clusterId}/members`

### Sessions

- `GET /sessions/{sessionId}`
- `GET /sessions/{sessionId}/events`
- `GET /sessions/{sessionId}/failures`

### Benchmark

- `POST /analysis-runs/{runId}/evaluate`
- `GET /analysis-runs/{runId}/evaluation`

### Bonus

- `POST /clusters/{clusterId}/regression-test`

---

# API Details

## GET /health

Response:

```json
{
  "status": "ok",
  "database": "ok",
  "version": "0.1.0"
}
```

Do not expose secret/provider details.

---

## POST /datasets/import

Multipart form:

- `file`: JSON or JSONL
- `name`: optional

Response `201`:

```json
{
  "id": "uuid",
  "name": "Customer Support Demo",
  "source_type": "JSONL",
  "session_count": 2347,
  "has_ground_truth": true,
  "rejected_sessions": 3
}
```

Validation errors should identify malformed lines/sessions.

---

## GET /datasets

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Customer Support Demo",
      "session_count": 2347,
      "created_at": "2026-09-27T10:00:00Z"
    }
  ]
}
```

---

## GET /datasets/{datasetId}

Returns dataset metadata and latest run summary if available.

---

## POST /analysis-runs

Request:

```json
{
  "dataset_id": "uuid",
  "config": {
    "judge_model": "configured-model",
    "loop_threshold": 4,
    "clustering": {
      "algorithm": "hdbscan",
      "min_cluster_size": 5
    }
  }
}
```

Response `202`:

```json
{
  "id": "uuid",
  "status": "QUEUED"
}
```

---

## GET /analysis-runs/{runId}

Response:

```json
{
  "id": "uuid",
  "status": "RUNNING",
  "sessions_total": 2347,
  "sessions_processed": 1220,
  "failure_events_count": 76,
  "clusters_count": 0,
  "started_at": "2026-09-27T10:01:00Z"
}
```

---

## GET /analysis-runs/{runId}/summary

Response after completion:

```json
{
  "sessions_analyzed": 2347,
  "candidate_sessions": 196,
  "failure_events": 148,
  "clusters": 5,
  "noise_failures": 9,
  "highest_priority_cluster_id": "uuid"
}
```

---

## GET /analysis-runs/{runId}/clusters

Query params:

- `priority=P0|P1|P2|P3`
- `tool=refund_order`
- `sort=priority|occurrences|recent`

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Duplicate refunds after retry",
      "priority_label": "P0",
      "priority_score": 91,
      "occurrence_count": 32,
      "affected_sessions": 28,
      "confidence_score": 97,
      "first_seen": "2026-09-20T10:00:00Z",
      "last_seen": "2026-09-27T09:00:00Z"
    }
  ]
}
```

---

## GET /clusters/{clusterId}

Response:

```json
{
  "id": "uuid",
  "title": "Duplicate refunds after retry",
  "summary": "Refund actions are executed twice after a transient tool failure.",
  "likely_contributing_factor": "Retry path may lack idempotency protection.",
  "occurrence_count": 32,
  "affected_sessions": 28,
  "priority": {
    "impact": 100,
    "frequency": 50,
    "severity": 95,
    "reach": 45,
    "confidence": 97,
    "score": 82,
    "label": "P0"
  },
  "top_tools": ["refund_order"],
  "agent_versions": {"v3": 32},
  "representative_failure_ids": ["uuid1", "uuid2", "uuid3"]
}
```

---

## GET /clusters/{clusterId}/members

Response items include:

- failure event ID;
- session ID;
- failure type;
- semantic summary;
- confidence;
- representative flag.

---

## GET /sessions/{sessionId}

Response:

```json
{
  "id": "uuid",
  "external_session_id": "s-182",
  "agent_version": "v3",
  "model_name": "demo-model",
  "metadata": {}
}
```

---

## GET /sessions/{sessionId}/events

Response:

```json
{
  "items": [
    {
      "id": "event-1",
      "sequence_no": 1,
      "event_type": "USER_MESSAGE",
      "content": "Refund 10 dollars for my last order"
    },
    {
      "id": "event-2",
      "sequence_no": 2,
      "event_type": "TOOL_CALL",
      "tool_name": "refund_order",
      "payload": {"amount": 100}
    }
  ]
}
```

---

## GET /sessions/{sessionId}/failures

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "failure_type": "WRONG_PARAMETER",
      "tool_name": "refund_order",
      "parameter_name": "amount",
      "expected_value": 10,
      "observed_value": 100,
      "confidence": 0.98,
      "evidence_tier": 2,
      "evidence": [
        {"label": "User requested amount", "event_id": "event-1"},
        {"label": "Executed amount", "event_id": "event-2"}
      ]
    }
  ]
}
```

---

## POST /analysis-runs/{runId}/evaluate

Only valid when dataset has hidden ground truth.

The evaluation code must run after/disconnected from discovery logic.

Response:

```json
{
  "status": "completed"
}
```

---

## GET /analysis-runs/{runId}/evaluation

Response:

```json
{
  "precision": 0.94,
  "recall": 0.89,
  "f1": 0.91,
  "false_positives": 12,
  "false_negatives": 17,
  "ari": 0.83,
  "nmi": 0.86
}
```

The example values above are contract examples only. The UI must show the values actually measured for the run.

---

## POST /clusters/{clusterId}/regression-test

**Priority:** P1 bonus.

Response:

```json
{
  "title": "Prevent duplicate refund after retry",
  "given": "The refund tool times out after receiving a request.",
  "when": "A user requests one refund.",
  "then": "At most one successful refund action is allowed.",
  "evidence_cluster_id": "uuid"
}
```

---

# API Change Protocol

When changing an endpoint:

1. update this file;
2. update Pydantic DTOs;
3. update frontend types/client;
4. update tests;
5. note any schema migration impact.
