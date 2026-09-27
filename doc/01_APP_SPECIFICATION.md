# Hidden Failures Intelligence — Application Specification

## 1. Product Vision

Hidden Failures Intelligence is a behavioral reliability layer for AI agents.

It answers a question that conventional observability often cannot answer automatically:

> **What is my agent repeatedly doing wrong in production even when nothing crashes?**

The product turns thousands of conversations and tool traces into a small, prioritized inbox of recurring behavioral issues.

### Product promise

**Monitoring tells you when an agent crashes. Hidden Failures Intelligence tells you when it behaves incorrectly.**

## 2. Problem Statement

AI agents can fail silently:

- the user requests a refund of 10, but the tool executes 100;
- the tool returns an error, but the agent tells the user “completed successfully”;
- a timeout causes the agent to call a payment/refund action twice;
- the user asks to change an address, but the agent calls a cancellation tool;
- the agent loops on the same tool multiple times and wastes latency/tokens;
- the agent completes only part of a multi-step task but claims full success.

These cases are not reliably captured by HTTP errors, stack traces, uptime monitoring, or cost dashboards.

## 3. Core Product Loop

```text
RAW TRACE BATCH
      |
      v
NORMALIZE SESSIONS
      |
      v
DETECT CANDIDATES
 Rules + trace checks
      |
      v
SEMANTIC JUDGE
 only when required
      |
      v
FAILURE EVENTS
      |
      v
FINGERPRINT + EMBED
      |
      v
CLUSTER RECURRING PATTERNS
      |
      v
PRIORITIZE
 impact + severity + frequency + reach + confidence
      |
      v
ISSUE INBOX + EVIDENCE
```

## 4. Primary Users

### AI Engineer

Needs to know which behavioral failures are recurring, how to reproduce them, and which component/tool is implicated.

### AI Product Manager

Needs to understand failure rate, customer reach, business impact and whether a new agent version introduced new behavior.

### QA / Reliability Engineer

Needs representative traces and reusable regression cases.

### Demo/Jury User

Needs to understand the value in under three minutes without reading raw traces.

## 5. MVP Input

The MVP accepts a JSON or JSONL dataset of agent sessions.

A session may contain:

- user messages;
- assistant messages;
- tool calls;
- tool parameters;
- tool results/status;
- timestamps;
- agent/model version metadata;
- optional ground-truth label for benchmark mode.

Canonical minimum fields:

```json
{
  "session_id": "s-182",
  "messages": [],
  "tool_calls": [],
  "final_answer": "...",
  "metadata": {
    "agent_version": "v3",
    "timestamp": "2026-09-27T10:00:00Z"
  }
}
```

## 6. Session Normalization

The ingestion layer must transform different raw events into a canonical timeline:

```text
USER_MESSAGE
ASSISTANT_MESSAGE
TOOL_CALL
TOOL_RESULT
ASSISTANT_FINAL
```

Every event must keep:

- stable event ID;
- session ID;
- timestamp/order;
- tool name if applicable;
- structured arguments/result if applicable;
- raw payload reference for evidence.

## 7. Failure Taxonomy

The MVP must support at least five P0 failure families.

### WRONG_PARAMETER

User intent and tool parameter differ materially.

Example:

```text
User asks refund 10
Tool executes refund 100
```

### FALSE_SUCCESS

A tool/action fails, but the agent claims success.

### DUPLICATE_ACTION

The same non-idempotent action is executed multiple times when the user intended it once.

### WRONG_TOOL

The selected tool/action does not match the user's requested operation.

### LOOP_RETRY

A tool is repeated excessively without producing additional task progress.

### P1 / future failure families

- PARTIAL_COMPLETION
- TOOL_RESULT_MISINTERPRETATION
- INTENT_OUTCOME_MISMATCH
- WRONG_ENTITY / WRONG_RECIPIENT
- POLICY / BUSINESS_RULE_VIOLATION

## 8. Candidate Detection

Candidate detection must be hybrid.

### Deterministic checks

Examples:

- repeated identical tool calls;
- tool status = error;
- invalid schema/type;
- retry count above threshold;
- exact structured parameter mismatch when expected value can be extracted deterministically;
- duplicated transaction ID or equivalent execution signature.

### Semantic checks

Used only where meaning is required:

- infer user intent;
- determine whether final answer contradicts tool result;
- compare expected and observed action semantically;
- determine whether a task was partially completed.

## 9. Agent-as-Judge

The judge is a component, not the source of truth.

For each candidate session, the judge should extract:

1. user intended goal;
2. expected action/outcome;
3. observed action;
4. observed outcome;
5. whether the observed behavior satisfies the intent;
6. deviation type;
7. concise rationale;
8. confidence.

The judge must return structured JSON validated by Pydantic.

The judge must never override deterministic facts such as a recorded tool call or tool error.

## 10. Failure Event

A `FailureEvent` is the canonical unit of analysis.

Example:

```json
{
  "session_id": "s-182",
  "failure_type": "WRONG_PARAMETER",
  "workflow": "refund",
  "tool": "refund_order",
  "parameter": "amount",
  "expected": 10,
  "observed": 100,
  "impact_category": "financial",
  "confidence": 0.98,
  "evidence_refs": ["event-user-1", "event-tool-4"]
}
```

## 11. Evidence Hierarchy

Evidence strength should be explicit.

1. **E1 — Outcome/state evidence**: observable business/system state changed.
2. **E2 — Tool execution evidence**: actual call/result confirms behavior.
3. **E3 — Structured trace evidence**: sequence/parameter comparison.
4. **E4 — Semantic judge evidence**: interpretation by an LLM.

A finding may use several tiers. LLM judgment alone should not be presented as conclusive when stronger evidence is available.

## 12. Failure Fingerprint

Each `FailureEvent` receives a structured fingerprint containing:

- workflow;
- failure type;
- tool;
- relevant parameter;
- outcome category;
- agent version;
- semantic summary embedding.

The fingerprint is used for deduplication and clustering.

## 13. Clustering

The MVP must group related failures automatically.

Recommended approach:

1. structured pre-grouping by workflow/tool/failure family when available;
2. semantic embedding of normalized failure summaries;
3. HDBSCAN clustering;
4. outlier/noise handling;
5. LLM label generation on representative members of each cluster.

The cluster label is generated *after* clustering and must not be a predefined taxonomy label.

## 14. Cluster Output

A cluster must expose:

- title;
- generated summary;
- failure family distribution;
- occurrence count;
- unique affected sessions/users if available;
- first seen / last seen;
- agent/model versions involved;
- representative evidence;
- evidence confidence;
- priority score;
- likely contributing factor (optional hypothesis).

## 15. Prioritization

The MVP uses a transparent 0–100 score:

```text
Priority =
  0.30 * Impact
+ 0.25 * Frequency
+ 0.20 * Severity
+ 0.15 * Reach
+ 0.10 * Confidence
```

All dimensions must be normalized to 0–100.

The UI must show the sub-scores so the ranking is explainable.

Priority labels:

- P0 — immediate attention;
- P1 — high priority;
- P2 — medium;
- P3 — low.

The label must be based on configurable score thresholds, not an LLM opinion alone.

## 16. Issue Inbox

The home screen is not a generic observability dashboard. It is an **Issue Inbox**.

It should answer:

- What new failure modes were discovered?
- How often do they happen?
- What is the impact?
- What evidence supports the finding?
- Which issue should I inspect first?

## 17. Cluster Detail

Cluster detail shows:

- title and priority;
- statistics;
- representative failure path;
- evidence timeline;
- correlated metadata (tool, version, time window);
- example sessions;
- generated hypothesis clearly labeled as hypothesis.

## 18. Session Trace

A session detail page displays a chronological trace:

```text
USER
  ↓
AGENT
  ↓
TOOL CALL
  ↓
TOOL RESULT
  ↓
AGENT FINAL
```

The relevant mismatch or suspicious step must be visually highlighted.

## 19. Benchmark Mode

For the controlled hackathon dataset, sessions can include hidden ground-truth labels not shown to the discovery engine.

The evaluation view can calculate:

- precision;
- recall;
- F1;
- confusion matrix by failure type;
- cluster quality (ARI/NMI when labels exist);
- number of noise/outlier sessions.

Only measured results may be shown in the pitch.

## 20. Primary Demo Scenario

Reference dataset:

- 2,000–5,000 sessions;
- majority correct sessions;
- at least five injected failure patterns;
- varied phrasing and tool-result payloads;
- hidden ground truth.

Demo sequence:

1. import dataset;
2. start analysis;
3. show “N recurring failure patterns discovered”;
4. open highest-priority cluster;
5. inspect evidence in one session;
6. show measured benchmark metrics;
7. optional: generate a regression test.

## 21. Explicitly Out of MVP

Do not implement in P0:

- live Kafka/streaming ingestion;
- full OpenTelemetry collector;
- Kubernetes;
- SSO / SCIM;
- enterprise multi-tenancy;
- dozens of vendor connectors;
- autonomous code fixes;
- confirmed root-cause analysis;
- advanced state snapshots across external databases;
- complete model/provider cost optimization.

## 22. MVP Acceptance Criteria

The MVP is accepted when:

1. a JSON/JSONL batch can be imported;
2. sessions are normalized into a consistent event timeline;
3. deterministic rules identify at least the defined P0 suspicious behaviors;
4. the semantic judge produces validated structured output;
5. failure events can be generated and persisted;
6. related failure events are grouped into clusters;
7. each cluster exposes representative evidence;
8. clusters receive explainable priority scores;
9. the dashboard lists top issues in priority order;
10. the controlled dataset can be evaluated against hidden ground truth.
