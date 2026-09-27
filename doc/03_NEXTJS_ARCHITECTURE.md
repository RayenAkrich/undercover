# Hidden Failures Intelligence — Next.js + FastAPI Architecture

## 1. Technology

### Frontend

- Next.js App Router
- TypeScript
- React
- Tailwind CSS or equivalent utility CSS
- Zod for client/server DTO validation

### Analysis backend

- FastAPI
- Python 3.12+
- Pydantic
- NumPy / pandas
- scikit-learn
- HDBSCAN
- embedding provider or `sentence-transformers`

### Persistence

- Supabase PostgreSQL
- optional pgvector
- Supabase Storage for raw imports

### LLM layer

Provider adapter interface:

```text
JudgeProvider
  ├── judge_session()
  ├── label_cluster()
  └── generate_regression_test()   # P1
```

No product logic should depend directly on one vendor SDK.

## 2. System Architecture

```text
Browser
   |
   v
Next.js UI
   |
   | HTTPS
   v
FastAPI Analysis Service
   |
   +--> Supabase Postgres
   +--> Supabase Storage
   +--> Embedding Model/API
   +--> LLM Judge API
```

The browser should not call the LLM provider directly.

## 3. Suggested Repository Structure

```text
hidden-failures/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── api/
│       │   ├── core/
│       │   ├── models/
│       │   ├── services/
│       │   ├── detectors/
│       │   ├── judge/
│       │   ├── clustering/
│       │   └── repositories/
│       └── tests/
├── data/
│   └── demo/
├── supabase/
│   └── migrations/
├── docs/
└── docker-compose.yml
```

## 4. Frontend Routes

Recommended P0 routes:

```text
/
/import
/runs/[runId]
/issues/[clusterId]
/sessions/[sessionId]
/benchmark/[runId]
```

### `/`

Issue Inbox / latest analysis overview.

### `/import`

Upload JSON/JSONL demo dataset and start an analysis.

### `/runs/[runId]`

Progress and run summary.

### `/issues/[clusterId]`

Recurring failure cluster, evidence, representative traces and priority.

### `/sessions/[sessionId]`

Full normalized timeline.

### `/benchmark/[runId]`

Measured detection and clustering metrics when ground truth exists.

## 5. Frontend Components

```text
IssueInbox
PriorityBadge
ClusterCard
ClusterStats
EvidenceTimeline
TraceEvent
ToolCallCard
MismatchDiff
RunProgress
MetricCard
BenchmarkSummary
FailureDistribution
```

## 6. FastAPI Module Boundaries

### `api/`

HTTP endpoints and request/response schemas only.

### `services/ingestion.py`

- parse uploaded JSON/JSONL;
- validate session schema;
- persist dataset/sessions/events.

### `detectors/rules.py`

Deterministic checks:

- duplicate action;
- loop/retry threshold;
- tool error;
- obvious parameter mismatch;
- suspicious success claim candidate.

### `judge/`

- build minimal judge context;
- invoke provider;
- validate JSON output;
- cache by input hash;
- retry safely on malformed output.

### `services/failures.py`

Merge signals + judge output into canonical `FailureEvent` objects.

### `clustering/`

- fingerprint generation;
- embedding generation;
- HDBSCAN/agglomerative clustering;
- representative sample selection;
- cluster statistics.

### `services/prioritization.py`

Compute explainable sub-scores and final 0–100 priority.

### `services/evaluation.py`

Benchmark against hidden ground truth only after discovery is complete.

## 7. Data Access Pattern

Use repository interfaces rather than database calls scattered through business logic.

Example:

```text
SessionRepository
FailureRepository
ClusterRepository
AnalysisRunRepository
```

This keeps the core pipeline testable without Supabase.

## 8. Analysis Orchestration

P0 may run analysis in-process or through a simple background worker.

Recommended flow:

```text
POST /analysis-runs
   |
   v
create DB row (QUEUED)
   |
   v
background task
   |
   +--> normalize/validate
   +--> deterministic detection
   +--> judge selected candidates
   +--> build failure events
   +--> embed + cluster
   +--> label clusters
   +--> prioritize
   +--> complete run
```

If the dataset is small enough for the demo, a single Python process is acceptable.

Do not add Celery/Redis unless analysis duration makes it necessary.

## 9. Judge Context Minimization

Do not send an entire session if only a few events are relevant.

Build a compact context containing:

- user request;
- relevant preceding turns;
- relevant tool call(s);
- tool result(s);
- final answer.

This reduces cost and noise.

## 10. Provider Abstraction

Define a provider-neutral DTO:

```python
class JudgeDecision(BaseModel):
    intent: dict
    expected_action: dict | None
    observed_action: dict | None
    observed_outcome: dict | None
    is_failure: bool
    deviation_type: str | None
    reason: str
    confidence: float
```

The rest of the product consumes this schema, not provider-specific responses.

## 11. Server vs Client Responsibilities

### Server

- file parsing;
- dataset validation;
- database writes;
- AI provider calls;
- embeddings;
- clustering;
- priority calculation;
- benchmark evaluation.

### Client

- upload interaction;
- run progress polling;
- issue browsing/filtering;
- evidence visualization.

Never perform judge calls or clustering in the browser.

## 12. Error Handling

Display actionable errors:

- unsupported trace schema;
- malformed JSON/JSONL line;
- provider rate limit;
- invalid judge output;
- analysis failed;
- no failures found;
- clustering produced only noise.

A failed judge call for one session should not necessarily fail the entire analysis run.

## 13. Performance Principles

For 2,000–5,000 demo sessions:

- deterministic rules run over all sessions;
- semantic judge runs only on selected candidates or sampled ambiguous sessions;
- embeddings run on failure summaries, not full transcripts;
- cluster labeling runs on representative members only;
- cache judge calls by hash;
- batch embedding requests when provider supports it.

## 14. Security Boundaries

- keep provider keys server-side;
- redact secrets/PII before LLM calls;
- treat trace text as untrusted data, not instructions;
- constrain judge prompts to output schemas;
- never let imported text modify system prompts/configuration;
- limit upload size;
- validate MIME/extension and JSON structure.

## 15. Deployment

Hackathon:

```text
Vercel (Next.js) + Render/Fly/Railway (FastAPI) + Supabase
```

or one Docker Compose deployment if faster.

Production evolution may add worker queues, OpenTelemetry ingestion, VPC deployment and tenant isolation later.
