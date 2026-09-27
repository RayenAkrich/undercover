# Frozen Contracts — Undercover 4h Sprint

**Locked at 0:15. After lock, any change needs a team announce + tiny PR. No silent shape changes.**
_All sections pre-filled from `doc/` defaults — team confirms or adjusts live, then deletes `[CONFIRM]` tags._

## 1. Session JSON (Slice 1 owns) [CONFIRM]

```json
{
  "session_id": "s-182",
  "messages": [
    {"role": "user", "content": "Refund 10 dollars for my late order"},
    {"role": "assistant", "content": "I'll process that refund right away."}
  ],
  "tool_calls": [
    {"tool": "refund_order", "args": {"order_id": "ord-9921", "amount": 100}, "result": {"status": "success", "transaction_id": "tx-88192"}}
  ],
  "final_answer": "Your 10 dollar refund was completed.",
  "metadata": {"agent_version": "v3", "timestamp": "2026-09-27T10:00:00Z"}
}
```

Required: `session_id`, plus messages and/or tool calls. Invalid sessions are reported, never crash the import.

## 2. Session events (Slice 1 owns) [CONFIRM]

Canonical types only: `USER_MESSAGE`, `ASSISTANT_MESSAGE`, `TOOL_CALL`, `TOOL_RESULT`, `ASSISTANT_FINAL`.
Every event keeps: stable event ID, session ID, `sequence_no`, timestamp/order, `tool_name` (if any),
structured `payload` (args/result), `status`, raw payload reference.

```json
[
  {"event_id": "e1", "sequence_no": 1, "event_type": "USER_MESSAGE", "content": "Refund 10 dollars for my late order"},
  {"event_id": "e2", "sequence_no": 2, "event_type": "TOOL_CALL", "tool_name": "refund_order", "payload": {"order_id": "ord-9921", "amount": 100}},
  {"event_id": "e3", "sequence_no": 3, "event_type": "TOOL_RESULT", "tool_name": "refund_order", "payload": {"status": "success"}, "status": "success"}
]
```

## 3. FailureEvent fields (Slice 2 proposes, Slice 3 accepts) [CONFIRM]

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
  "evidence_refs": ["e1", "e2"]
}
```

Allowed `failure_type`: `WRONG_PARAMETER`, `FALSE_SUCCESS`, `DUPLICATE_ACTION`, `WRONG_TOOL`, `LOOP_RETRY`, `OTHER`, `NONE`.
Rule: recorded tool facts override LLM claims on conflict. Every event carries ≥1 evidence ref + tier 1–4.

## 4. Python signatures (proposed) [CONFIRM]

```python
detect(session_events: list[dict]) -> list[dict]          # Slice 2: signals
build_events(signals: list[dict], judge: dict | None) -> list[dict]  # Slice 2: FailureEvents
cluster(events: list[dict]) -> list[dict]                 # Slice 3: clusters + members
prioritize(cluster: dict) -> dict                         # Slice 3: 5 sub-scores + label
# Priority = 0.30*Impact + 0.25*Frequency + 0.20*Severity + 0.15*Reach + 0.10*Confidence
# Labels: P0 ≥ 80, P1 ≥ 60, P2 ≥ 40, else P3
```

## 5. Endpoints (Person 4 owns runs/*, others as listed) [CONFIRM]

| Method + path | Owner | Status |
|---|---|---|
| `POST /datasets/import` (multipart `file` + `name`) | Slice 1 | 201 |
| `GET /datasets`, `GET /datasets/{id}` | Slice 1 | 200 |
| `GET /sessions/{id}`, `GET /sessions/{id}/events`, `GET /sessions/{id}/failures` | S1, S1, S2 | 200 |
| `POST /analysis-runs` → `202 {id, QUEUED}` | Person 4 | 202 |
| `GET /analysis-runs/{runId}`, `GET …/summary` | Person 4 | 200 |
| `GET /analysis-runs/{runId}/clusters` (`?priority&tool&sort`) | Slice 3 | 200 |
| `GET /clusters/{id}`, `GET /clusters/{id}/members` | Slice 3 | 200 |
| `POST …/{runId}/evaluate`, `GET …/{runId}/evaluation` | Person 4 | 200 |
| `POST /clusters/{id}/regression-test` (bonus) | Person 4 | 200 |
| `GET /health` | Person 4 | 200 |

Error shape: `{"error": {"code": "STRING", "message": "..."}}`. Full shapes: `doc/08_OPENAPI.md` / `team/person-4-pack.md` §10.

## 6. Page URLs [CONFIRM]

`/ ` (landing) · `/import` (S1) · `/inbox` (P4) · `/runs/[runId]` (P4) ·
`/issues/[clusterId]` (S3) · `/sessions/[id]` (S2) · `/benchmark/[runId]` (P4)

## 7. Deadlines

Fixture `data/demo/demo.jsonl` committed **1:00** · integration checkpoint **3:00** ·
fallback `demo-fallback.json` snapshotted **2:45** · go/no-go **3:50**.

## 8. Risk log

- [ ] **LLM key owner: ______** — get Gemini free key / check agent-router within first 20 min.
  No key by hour 2 → heuristic stub ships as final (rules-first order stands regardless).
- [ ] **Tie-break:** 60-second vote per dispute; 2–2 → domain owner decides
  (S1 sessions, S2 events, S3 clusters, P4 APIs/pages). Person 4 enforces the clock.
- [ ] **Git:** branch per slice, rebase daily, shared files (`app/main.py`, migrations, this file) announce-first.

## 9. Change rule

Propose in chat → majority accepts → update this file + `08_OPENAPI.md` + affected DTOs/tests in one tiny PR.
