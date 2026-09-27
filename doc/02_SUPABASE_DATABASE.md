# Hidden Failures Intelligence — Supabase Database Specification

## 1. General Database Rules

Database engine: PostgreSQL through Supabase.

Use UUID primary keys and `timestamptz` timestamps.

The database stores normalized analysis data and evidence metadata. Raw imported files may be kept in Supabase Storage; the MVP does not need to duplicate full raw payloads in every table.

The browser must never use the Supabase service-role key.

## 2. MVP Persistence Strategy

P0 can run as a single demo workspace with no login.

Even in demo mode, structure the schema so a future `workspace_id` can be introduced without redesigning the core analysis model.

For the hackathon, the FastAPI backend is the trusted writer.

## 3. `datasets`

Purpose: one imported trace collection.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | human-readable |
| `description` | text nullable | |
| `source_type` | text | `JSON`, `JSONL`, `SYNTHETIC` |
| `session_count` | integer default 0 | cached |
| `has_ground_truth` | boolean default false | benchmark mode |
| `storage_path` | text nullable | original upload |
| `created_at` | timestamptz | |

## 4. `sessions`

Purpose: normalized agent conversation/session.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | internal ID |
| `dataset_id` | uuid FK -> datasets.id | |
| `external_session_id` | text | source trace ID |
| `agent_version` | text nullable | |
| `model_name` | text nullable | |
| `started_at` | timestamptz nullable | |
| `ended_at` | timestamptz nullable | |
| `metadata` | jsonb default '{}' | sanitized extra metadata |
| `created_at` | timestamptz | |

Unique recommended:

```text
(dataset_id, external_session_id)
```

## 5. `session_events`

Purpose: canonical chronological timeline.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `session_id` | uuid FK -> sessions.id | |
| `sequence_no` | integer | stable order |
| `event_type` | enum/text | USER_MESSAGE, ASSISTANT_MESSAGE, TOOL_CALL, TOOL_RESULT, ASSISTANT_FINAL |
| `tool_name` | text nullable | |
| `content` | text nullable | redacted text |
| `payload` | jsonb default '{}' | structured args/result |
| `status` | text nullable | success/error/etc. |
| `occurred_at` | timestamptz nullable | |
| `created_at` | timestamptz | |

Indexes:

- `(session_id, sequence_no)`
- `(event_type)`
- `(tool_name)`

## 6. `analysis_runs`

Purpose: one execution of the analysis pipeline over a dataset.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `dataset_id` | uuid FK -> datasets.id | |
| `status` | text | QUEUED, RUNNING, COMPLETED, FAILED |
| `config` | jsonb | thresholds/model/prompt versions |
| `sessions_total` | integer | |
| `sessions_processed` | integer | |
| `failure_events_count` | integer | |
| `clusters_count` | integer | |
| `started_at` | timestamptz nullable | |
| `completed_at` | timestamptz nullable | |
| `error_message` | text nullable | |
| `created_at` | timestamptz | |

## 7. `detection_signals`

Purpose: low-level deterministic or semantic signals before final failure adjudication.

Columns:

- `id uuid PK`
- `analysis_run_id uuid FK`
- `session_id uuid FK`
- `signal_type text`
- `source text` — `RULE`, `STATISTICAL`, `JUDGE`
- `severity_hint integer nullable`
- `confidence numeric(5,4)`
- `details jsonb`
- `evidence_event_ids uuid[] nullable`
- `created_at timestamptz`

Examples:

- `REPEATED_TOOL_CALL`
- `TOOL_ERROR`
- `PARAMETER_MISMATCH`
- `SUCCESS_CLAIM_AFTER_ERROR`

## 8. `judge_outputs`

Purpose: auditable structured output from Agent-as-Judge.

Columns:

- `id uuid PK`
- `analysis_run_id uuid FK`
- `session_id uuid FK`
- `prompt_version text`
- `model_name text`
- `input_hash text`
- `intent jsonb`
- `expected_action jsonb nullable`
- `observed_action jsonb nullable`
- `observed_outcome jsonb nullable`
- `is_failure boolean`
- `deviation_type text nullable`
- `reason text nullable`
- `confidence numeric(5,4)`
- `raw_output jsonb nullable`
- `created_at timestamptz`

Recommended unique constraint for caching:

```text
(input_hash, prompt_version, model_name)
```

## 9. `failure_events`

Purpose: canonical unit that will be fingerprinted and clustered.

Columns:

- `id uuid PK`
- `analysis_run_id uuid FK`
- `session_id uuid FK`
- `failure_type text`
- `workflow text nullable`
- `tool_name text nullable`
- `parameter_name text nullable`
- `expected_value jsonb nullable`
- `observed_value jsonb nullable`
- `impact_category text nullable`
- `severity_score integer` — 0..100
- `confidence numeric(5,4)` — 0..1
- `semantic_summary text`
- `evidence_tier integer` — 1..4 (1 strongest)
- `created_at timestamptz`

## 10. `failure_evidence`

Purpose: explicit evidence attached to a failure.

Columns:

- `id uuid PK`
- `failure_event_id uuid FK -> failure_events.id`
- `event_id uuid FK -> session_events.id nullable`
- `evidence_type text`
- `evidence_tier integer`
- `label text`
- `excerpt text nullable`
- `details jsonb default '{}'`
- `created_at timestamptz`

Examples:

- USER_INTENT
- TOOL_ARGUMENT
- TOOL_RESULT
- DUPLICATE_EXECUTION
- FINAL_RESPONSE

## 11. `failure_fingerprints`

Purpose: normalized structural signature plus embedding reference.

Columns:

- `failure_event_id uuid PK/FK`
- `workflow text nullable`
- `failure_type text`
- `tool_name text nullable`
- `parameter_name text nullable`
- `outcome_category text nullable`
- `agent_version text nullable`
- `fingerprint_hash text`
- `embedding vector` — optional pgvector if enabled
- `created_at timestamptz`

If pgvector is not enabled during the hackathon, embeddings may be computed in Python and kept in memory during an analysis run.

## 12. `failure_clusters`

Purpose: recurring failure mode discovered by clustering.

Columns:

- `id uuid PK`
- `analysis_run_id uuid FK`
- `cluster_key text`
- `generated_title text`
- `generated_summary text`
- `likely_contributing_factor text nullable`
- `occurrence_count integer`
- `affected_sessions integer`
- `first_seen timestamptz nullable`
- `last_seen timestamptz nullable`
- `impact_score integer` — 0..100
- `frequency_score integer` — 0..100
- `severity_score integer` — 0..100
- `reach_score integer` — 0..100
- `confidence_score integer` — 0..100
- `priority_score integer` — 0..100
- `priority_label text` — P0..P3
- `created_at timestamptz`

## 13. `cluster_members`

Purpose: mapping between failure events and clusters.

Columns:

- `cluster_id uuid FK -> failure_clusters.id`
- `failure_event_id uuid FK -> failure_events.id`
- `distance numeric nullable`
- `is_representative boolean default false`
- `created_at timestamptz`

Primary key:

```text
(cluster_id, failure_event_id)
```

## 14. `ground_truth_labels`

Purpose: hidden labels used only in benchmark/evaluation mode.

Columns:

- `id uuid PK`
- `dataset_id uuid FK`
- `session_id uuid FK`
- `is_failure boolean`
- `failure_type text nullable`
- `cluster_label text nullable`
- `notes text nullable`

Important: the detection/clustering pipeline must not read this table while producing results.

## 15. `evaluation_results`

Purpose: store benchmark metrics.

Columns:

- `id uuid PK`
- `analysis_run_id uuid FK`
- `precision numeric nullable`
- `recall numeric nullable`
- `f1 numeric nullable`
- `ari numeric nullable`
- `nmi numeric nullable`
- `false_positives integer`
- `false_negatives integer`
- `details jsonb`
- `created_at timestamptz`

## 16. Supabase Storage

Recommended bucket:

```text
trace-imports
```

Use for:

- original JSON/JSONL file;
- optional exported analysis report.

Do not expose imported production traces publicly.

## 17. High-Level Relationship Map

```text
datasets
   |
   +---- sessions ---- session_events
   |
   +---- analysis_runs
             |
             +---- detection_signals
             +---- judge_outputs
             +---- failure_events ---- failure_evidence
             |          |
             |          +---- failure_fingerprints
             |          |
             |          +---- cluster_members ---- failure_clusters
             |
             +---- evaluation_results

datasets ---- ground_truth_labels   (benchmark only)
```

## 18. Data Retention and Privacy

For production evolution:

- store only necessary text/excerpts;
- support configurable retention;
- redact secrets/PII before model calls;
- hash inputs used for judge caching;
- never log provider API keys;
- keep raw traces private;
- support future self-hosted/VPC deployment.

## 19. MVP Database Acceptance Criteria

- imported sessions and events are reconstructable in order;
- analysis runs are reproducible from stored config;
- every failure event links back to evidence;
- every cluster links to its member failures;
- benchmark labels remain isolated from discovery logic;
- no browser-side service-role access exists.
