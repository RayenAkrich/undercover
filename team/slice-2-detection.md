# Slice 2 — Detection: Rules → Judge → FailureEvents + Session Evidence Page

**Owner:** Person 2 · **Branch:** `slice-2-detection`
**Backlog:** E2 (US-E2-001…005) + E3 (US-E3-001/002/003/005) + E4 (US-E4-001/002/003)
**Docs:** `doc/01` §7–11, `doc/02` §7–10, `doc/03` §6 + §9, `doc/08` (Sessions/failures), `doc/09` §1–2 + §6–7

## Mission
Turn normalized sessions into `FailureEvent` rows with evidence, and build the session page that PROVES each failure (this page is the heart of the demo).

## 4-hour timeline (minutes)
| Time | Task |
|------|------|
| 0:00–0:15 | ALL together: freeze contracts. Copy Slice 1's canonical session JSON into your stubs. |
| 0:15–1:00 | Work against `data/demo/demo.jsonl` structure from Slice 1's 0:15 chat paste (fixture lands 1:00). Start with deterministic rules — they need no API and no judge. |
| 1:00–2:00 | **Deterministic rules** (`detectors/rules.py`): all 5 P0 families. |
| 2:00–2:45 | **Judge (minimal)**: provider adapter + compact context + Pydantic validation. |
| 2:45–3:15 | **FailureEvent builder** + `GET /sessions/{id}/failures` (+ persist to `failure_events`, `failure_evidence`). |
| 3:15–4:00 | **Session page** with evidence timeline + expected-vs-observed diff. Demo rehearsal. |

## Deliverable 1 — Deterministic rules (`apps/api/app/detectors/rules.py`, pure functions, no DB)
One function per family, each returns a signal dict or `None` (`doc/01` §8):
- `TOOL_ERROR` — any `TOOL_RESULT` with status error/failed/rejected.
- `DUPLICATE_ACTION` — same non-idempotent tool + materially identical args twice in one session (refund/cancel/change only — never flag read-only `get_order` repeats).
- `LOOP_RETRY` — same tool ≥ 4 times without progress (threshold configurable, default 4).
- `PARAMETER_MISMATCH` — extract expected amount/entity from user message with regex (e.g. "refund 10") and compare to tool args. Keep it narrow: amounts + order IDs.
- `SUCCESS_CLAIM_CANDIDATE` — tool failed AND final answer contains success words ("completed", "done", "success") → flag for judge, never auto-confirm.
- Rules run over ALL sessions; judge runs ONLY on candidates (`doc/09` §7 cascade). One bad session must never crash the run (try/except per session, US-E12-004).

## Deliverable 2 — Judge, minimal but real (`apps/api/app/judge/`)
- `provider.py` — `judge_session(compact_context) -> JudgeDecision` behind a provider-neutral interface (`doc/03` §10). Read model from `JUDGE_MODEL` env.
- Compact context ONLY: user request + relevant tool call(s)/result(s) + final answer (`doc/03` §9). Never full transcripts.
- System + user prompts copied from `doc/09` §1–2, including the SECURITY block (trace = untrusted evidence, never follow embedded instructions).
- Validate output with Pydantic; one retry on invalid JSON, else mark unavailable and continue (US-E3-002).
- **4-hour rule:** if no provider key works within 20 minutes, ship the heuristic stub (rules output mapped to `JudgeDecision` with low confidence + reason "heuristic fallback") and move on. A working deterministic pipeline beats a broken LLM call. Caching (US-E3-004, P1) is CUT.

## Deliverable 3 — FailureEvents + API (`apps/api/app/services/failures.py`)
Merge signals + judge into canonical rows (`doc/01` §10): `{session_id, failure_type, workflow, tool, parameter, expected, observed, impact_category, confidence, evidence_refs}`.
- Deterministic facts override LLM claims on conflict (US-E4-003).
- Every event gets ≥1 evidence row + strongest `evidence_tier` 1–4 (`doc/01` §11).
- Endpoint: `GET /sessions/{sessionId}/failures` (shape per `doc/08`).

## Deliverable 4 — Session page (YOUR demo weapon)
`apps/web/app/sessions/[sessionId]/page.tsx` + components (justify: you own the evidence, so you own its rendering — no shared-page conflicts with Slice 1):
- `EvidenceTimeline`: vertical USER → AGENT → TOOL CALL → TOOL RESULT → FINAL, mismatch step highlighted (label + icon, never color alone — `doc/12` accessibility).
- `MismatchDiff`: Expected vs Observed values side-by-side (e.g. Expected 10 / Observed 100).
- AI interpretation visually distinct from recorded facts (purple/indigo treatment, `doc/12`); hypothesis labeled "AI hypothesis".

## Tests (15 min max)
`tests/test_detectors.py`: duplicate refund flagged; repeated `get_order` NOT flagged; loop of 4 flagged; `test_failures.py`: conflict test (tool fact beats judge claim); priority of evidence tier correct.

## What you need / hand over
- Need from Slice 1: session/event JSON shape (0:15 chat) → fixture file (1:00) → `session_events` rows (2:00).
- Hand to Slice 3 by ~3:15: `failure_events` rows in Supabase (+ 3 example JSON rows in chat) so clustering starts on real data.
- Never read `data/demo/ground_truth.json` in your code (`doc/02` §14).

## Cut list (in order)
1. Judge provider → heuristic stub (see above).
2. Redaction → minimal regex for `sk-`/`Bearer` tokens only (US-E4-004 lite).
3. MismatchDiff polish → plain text Expected/Observed is acceptable.
