# Hidden Failures Intelligence — Product Backlog

## Backlog conventions

Priority:

- **P0**: required for jury-ready MVP.
- **P1**: high-value bonus if P0 is stable.
- **P2**: post-hackathon.

Status values:

- `TODO`
- `IN_PROGRESS`
- `DONE`
- `BLOCKED`

Definition of Done for P0 stories:

1. implementation works on the reference dataset;
2. happy path and main failure path are tested;
3. API/schema changes are documented;
4. no secrets are exposed client-side;
5. demo flow remains functional.

---

# E1 — Dataset Import & Normalization

## US-E1-001 — Import JSON/JSONL trace dataset

**Priority:** P0  
**Status:** TODO

As an analyst, I want to upload a trace dataset so that I can analyze agent behavior.

Acceptance criteria:

- accept `.json` and `.jsonl`;
- reject malformed input with line/file error;
- enforce size limit;
- create `datasets` record;
- persist original file privately or keep a safe local copy in demo mode.

## US-E1-002 — Validate canonical session shape

**Priority:** P0

- session ID required;
- messages and/or tool calls present;
- invalid sessions reported without crashing whole import;
- import summary shows accepted/rejected counts.

## US-E1-003 — Normalize events

**Priority:** P0

Convert raw events to:

- USER_MESSAGE
- ASSISTANT_MESSAGE
- TOOL_CALL
- TOOL_RESULT
- ASSISTANT_FINAL

Acceptance criteria:

- stable ordering;
- tool call and result link when source provides IDs;
- original event reference preserved.

---

# E2 — Deterministic Detection

## US-E2-001 — Detect tool errors

**Priority:** P0

Create a detection signal when a tool result is failed/error/rejected.

## US-E2-002 — Detect duplicate action

**Priority:** P0

Detect repeated non-idempotent calls with materially identical arguments inside one session.

Acceptance criteria:

- configurable time/sequence window;
- duplicate evidence includes both tool calls;
- avoid flagging obvious read-only repeated searches as critical duplicates.

## US-E2-003 — Detect retry/loop behavior

**Priority:** P0

Flag repeated tool calls above configurable threshold.

## US-E2-004 — Detect structured parameter mismatch when possible

**Priority:** P0

When expected structured value is directly extractable, compare it with actual tool arguments.

## US-E2-005 — Build suspicious-success candidate

**Priority:** P0

If a tool fails and the final answer appears to communicate success, send session to semantic judge.

---

# E3 — Agent-as-Judge

## US-E3-001 — Implement provider adapter

**Priority:** P0

Expose provider-neutral `judge_session()`.

## US-E3-002 — Structured judge schema

**Priority:** P0

Judge returns:

- intent;
- expected action;
- observed action;
- observed outcome;
- is_failure;
- deviation type;
- reason;
- confidence.

Invalid JSON must be retried once or marked unavailable.

## US-E3-003 — Minimize judge context

**Priority:** P0

Do not send unnecessary full transcripts.

## US-E3-004 — Cache judge output

**Priority:** P1

Cache by `(input_hash, prompt_version, model_name)`.

## US-E3-005 — Trace-injection resistance

**Priority:** P0

Judge treats imported text as evidence, never as instructions.

---

# E4 — Failure Events & Evidence

## US-E4-001 — Build canonical FailureEvent

**Priority:** P0

Merge deterministic signals and judge decision into a structured failure event.

## US-E4-002 — Evidence tiers

**Priority:** P0

Every failure exposes at least one evidence reference and strongest evidence tier.

## US-E4-003 — Conflict handling

**Priority:** P0

Recorded tool facts override LLM claims.

## US-E4-004 — Redact sensitive text before external model call

**Priority:** P0

At minimum redact obvious tokens/secrets and authorization headers.

---

# E5 — Fingerprinting & Embeddings

## US-E5-001 — Generate structured fingerprint

**Priority:** P0

Fingerprint includes:

- workflow;
- failure type;
- tool;
- parameter;
- outcome category;
- agent version.

## US-E5-002 — Generate semantic failure summary

**Priority:** P0

Summary describes the deviation, not the full conversation.

## US-E5-003 — Generate embeddings

**Priority:** P0

- batch when possible;
- no embedding for sessions without failure event;
- persist or retain for clustering.

---

# E6 — Recurring Failure Clustering

## US-E6-001 — Cluster failure events

**Priority:** P0

Use HDBSCAN or documented fallback.

Acceptance criteria:

- produces cluster ID for grouped failures;
- preserves noise/outliers;
- no predefined cluster names required.

## US-E6-002 — Select representative examples

**Priority:** P0

Select 3–7 representative incidents per cluster for labeling/evidence.

## US-E6-003 — Generate cluster title and summary

**Priority:** P0

Use representative examples and structured statistics.

## US-E6-004 — Generate likely contributing factor

**Priority:** P1

Must be labeled as hypothesis.

## US-E6-005 — Compute cluster statistics

**Priority:** P0

- occurrence count;
- unique sessions;
- first/last seen;
- top tool;
- agent-version distribution.

---

# E7 — Prioritization

## US-E7-001 — Calculate priority dimensions

**Priority:** P0

Calculate normalized:

- impact;
- frequency;
- severity;
- reach;
- confidence.

## US-E7-002 — Calculate weighted priority score

**Priority:** P0

Default:

```text
0.30 impact + 0.25 frequency + 0.20 severity + 0.15 reach + 0.10 confidence
```

## US-E7-003 — Assign P0/P1/P2/P3 label

**Priority:** P0

Thresholds must be configurable.

## US-E7-004 — Explain priority

**Priority:** P0

UI displays all sub-scores rather than only the final number.

---

# E8 — Issue Inbox & Evidence UI

## US-E8-001 — Issue Inbox

**Priority:** P0

Show clusters sorted by priority.

Each card:

- priority;
- title;
- occurrence count;
- affected sessions;
- impact;
- confidence;
- first/last seen.

## US-E8-002 — Run overview

**Priority:** P0

Show:

- sessions analyzed;
- suspicious sessions;
- failure events;
- recurring clusters;
- run state/progress.

## US-E8-003 — Cluster detail

**Priority:** P0

Show:

- generated summary;
- priority breakdown;
- common evidence pattern;
- representative traces;
- version/tool statistics.

## US-E8-004 — Session timeline

**Priority:** P0

Display event sequence and highlight failure-relevant events.

## US-E8-005 — Expected vs observed diff

**Priority:** P0

For wrong-parameter/entity cases, visually compare values.

---

# E9 — Benchmark & Evaluation

## US-E9-001 — Hidden ground truth support

**Priority:** P0

Ground truth is stored separately and inaccessible to discovery code.

## US-E9-002 — Detection metrics

**Priority:** P0

Calculate precision, recall, F1, false positives, false negatives.

## US-E9-003 — Clustering metrics

**Priority:** P1

Calculate ARI/NMI when ground-truth pattern labels exist.

## US-E9-004 — Benchmark page

**Priority:** P0

Show only measured values from current run.

---

# E10 — Demo Dataset

## US-E10-001 — Generate correct sessions

**Priority:** P0

Generate varied user phrasing and successful tool paths.

## US-E10-002 — Inject wrong-parameter failures

**Priority:** P0

## US-E10-003 — Inject false-success failures

**Priority:** P0

## US-E10-004 — Inject duplicate-action failures

**Priority:** P0

## US-E10-005 — Inject wrong-tool failures

**Priority:** P0

## US-E10-006 — Inject loop/retry failures

**Priority:** P0

## US-E10-007 — Hide labels from discovery pipeline

**Priority:** P0

---

# E11 — Regression Loop (Bonus)

## US-E11-001 — Generate regression test draft

**Priority:** P1

From a cluster, produce a human-readable Given/When/Then test.

Example:

```text
Given the refund API times out
When the user requests one refund
Then at most one successful refund action may occur
```

## US-E11-002 — Export regression case

**Priority:** P2

Export JSON/YAML suitable for future eval harness integration.

---

# E12 — Platform Quality & Security

## US-E12-001 — Health endpoint

**Priority:** P0

`GET /health` returns API/database/provider availability where safe.

## US-E12-002 — No client secrets

**Priority:** P0

No provider/service-role secret in frontend bundle.

## US-E12-003 — Judge schema validation

**Priority:** P0

All judge output validated by Pydantic.

## US-E12-004 — Analysis failure resilience

**Priority:** P0

One malformed session or failed judge call does not crash the whole run.

## US-E12-005 — Automated core tests

**Priority:** P0

At minimum:

- parser/normalizer tests;
- deterministic detector tests;
- FailureEvent builder tests;
- priority score tests;
- API smoke tests.

---

# E13 — Post-Hackathon Integrations

## US-E13-001 — OpenTelemetry ingestion

**Priority:** P2

## US-E13-002 — Langfuse export/import adapter

**Priority:** P2

## US-E13-003 — LangSmith export/import adapter

**Priority:** P2

## US-E13-004 — Continuous ingestion

**Priority:** P2

## US-E13-005 — Version regression alerts

**Priority:** P2

---

# Core End-to-End Acceptance Story

Given a dataset containing thousands of correct and faulty agent sessions,

when an analyst imports and analyzes it,

then the system must:

1. reconstruct session timelines;
2. identify behavioral failures;
3. group related failure events;
4. label recurring failure patterns;
5. prioritize clusters;
6. expose supporting evidence;
7. allow inspection of a representative session;
8. report measured benchmark performance when hidden labels exist.

---

# 48-Hour Suggested Execution Order

```text
H0–H4   schema + reference dataset design
H4–H8   dataset generator/import
H8–H14  normalization + storage
H14–H20 deterministic rules + judge
H20–H25 FailureEvent + evidence
H25–H30 embeddings + clustering
H30–H35 labeling + priority
H35–H41 frontend
H41–H44 evaluation
H44–H48 demo hardening + pitch
```
