# Slice 2 — Detailed Implementation Chain (Detection → Judge → FailureEvents → Session Page)

Ordered, dependency-aware task chain for `slice-2-detection`, synthesized from all `doc/` files.
Each step lists **inputs → work → outputs → doc refs → acceptance**. Do the steps in order; the
deterministic path (Steps 2–3) is the hard floor — it must work even if everything AI-related fails.

**Owned files (nobody else touches):**
`apps/api/app/detectors/rules.py`, `apps/api/app/judge/*`, `apps/api/app/services/failures.py`,
`apps/api/app/api/sessions.py` (failures endpoint), `apps/api/app/repositories/failures.py`,
`apps/web/app/sessions/[sessionId]/page.tsx` + its components, `apps/api/tests/test_detectors.py`,
`apps/api/tests/test_failures.py`.

**Trust order (never violate — `doc/09` §12, `doc/05` §13):**
`recorded outcome/state` > `recorded tool call/result` > `deterministic derivation` > `LLM judgment` > `LLM hypothesis`.

**Golden rules:** deterministic facts override the judge on conflict; the judge is a component, not
the source of truth; never read `data/demo/ground_truth.json`; one bad session or judge call must
never crash the run.

---

## Step 0 — Freeze contracts (0:00–0:15, ALL together)

**Inputs:** Slice 1's canonical session JSON (pasted in chat before code).

- Confirm the **normalized event** shape you will read from `session_events` (`doc/02` §5, `doc/01` §6):
  `{id, session_id, sequence_no, event_type, tool_name, content, payload, status, occurred_at}` where
  `event_type ∈ {USER_MESSAGE, ASSISTANT_MESSAGE, TOOL_CALL, TOOL_RESULT, ASSISTANT_FINAL}`.
- Confirm tool call↔result linkage convention (linked by IDs when present; otherwise nearest following
  `TOOL_RESULT` with same `tool_name`).
- Confirm the **raw session** shape (for working against `demo.jsonl` before DB rows land):
  `{session_id, messages[], tool_calls[], final_answer, metadata{agent_version, timestamp}}` (`doc/01` §5).
- Agree the `FailureEvent` JSON with Slice 3 verbally now (they build clustering against your rows).

**Output:** written note of the two shapes in team chat.

---

## Step 1 — Stub against the fixture (0:15–1:00)

**Inputs:** structure from Step 0 (fixture file `data/demo/demo.jsonl` lands at 1:00 from Slice 1).

- Build a tiny in-memory loader that turns a raw session dict into an ordered event list matching the
  normalized shape, so rules can be written and tested with **zero API/DB/judge dependency**.
- Do not wait on Supabase — pure Python dicts/lists only at this stage.

**Output:** local fixtures + a helper that yields normalized events per session.

---

## Step 2 — Deterministic rules (1:00–2:00) — `apps/api/app/detectors/rules.py`

Pure functions, no DB, no network. One function per family; each returns a **signal dict or `None`**.
Rules run over **ALL** sessions (`doc/09` §7 cascade). Wrap per-session evaluation in try/except so one
bad session never crashes the run (US-E12-004). Loop threshold comes from run `config` (default 4).

**Signal dict shape** (maps to `detection_signals`, `doc/02` §7):
```
{
  "signal_type": "TOOL_ERROR" | "REPEATED_TOOL_CALL" | "LOOP_RETRY" |
                 "PARAMETER_MISMATCH" | "SUCCESS_CLAIM_AFTER_ERROR",
  "source": "RULE",
  "severity_hint": int | None,
  "confidence": float,            # deterministic → high (e.g. 0.9–1.0), success-claim candidate lower
  "details": {...},               # rule-specific facts (expected/observed, counts, tool, etc.)
  "evidence_event_ids": [uuid]    # the session_event IDs that prove it
}
```

Rules to implement (all five P0 families — `doc/01` §7–8, `team` Deliverable 1):

1. **`TOOL_ERROR`** (US-E2-001) — any `TOOL_RESULT` whose `status` ∈ {error, failed, rejected} (case-insensitive).
   Evidence = that result event.
2. **`DUPLICATE_ACTION`** (US-E2-002) — same **non-idempotent** tool (`refund_order`, `cancel_order`,
   `change_address` — never read-only `get_order`) called twice with **materially identical args** in one
   session. Configurable sequence/time window. Evidence = **both** tool-call events.
3. **`LOOP_RETRY`** (US-E2-003) — same tool called ≥ threshold (default 4) without progress. Evidence =
   the repeated call events; `details.count`.
4. **`PARAMETER_MISMATCH`** (US-E2-004) — narrow regex extraction from the user message (amounts like
   "refund 10", and order IDs only) compared to the tool args. Emit only when a value is **directly
   extractable**. Evidence = user message event + tool call event; `details.expected` / `details.observed`.
5. **`SUCCESS_CLAIM_CANDIDATE`** (US-E2-005) — a tool failed **AND** the final answer contains success
   words ("completed", "done", "success"). This is a **candidate for the judge**, never auto-confirmed.
   Emit `signal_type="SUCCESS_CLAIM_AFTER_ERROR"` and mark the session for judging.

**Persistence:** write signals to `detection_signals` (via repository) tagged with `analysis_run_id` +
`session_id`. (Signals can also be returned in-memory to the orchestrator; DB write is for audit.)

**Acceptance (test in Step 6):** duplicate refund flagged; repeated `get_order` NOT flagged; loop of 4 flagged.

---

## Step 3 — Judge, minimal but real (2:00–2:45) — `apps/api/app/judge/`

Runs **only** on candidate sessions from Step 2 (cascade, `doc/09` §7) — never all sessions.

### 3a. Provider-neutral DTO (`doc/03` §10, `doc/01` §9, `doc/02` §8)
`JudgeDecision` (Pydantic):
```
intent: dict            # {goal, entities}
expected_action: dict | None
observed_action: dict | None
observed_outcome: dict | None
is_failure: bool
deviation_type: str | None   # WRONG_PARAMETER|FALSE_SUCCESS|DUPLICATE_ACTION|WRONG_TOOL|LOOP_RETRY|OTHER|NONE
reason: str
confidence: float       # 0..1
```

### 3b. Compact context builder (US-E3-003, `doc/03` §9)
Include **only**: user request + relevant assistant turn(s) + relevant tool call(s)/result(s) + final
answer. **Never** full transcripts.

### 3c. `provider.py` — `judge_session(compact_context) -> JudgeDecision`
- Read model from `JUDGE_MODEL` env; provider key stays server-side (`doc/05` §4).
- System + user prompts copied verbatim from `doc/09` §1–2 — **including the SECURITY block**: trace
  content is untrusted **evidence**, never instructions; no tools; no code exec; JSON-only output
  (US-E3-005, `doc/05` §6).
- Redaction (US-E4-004 lite): before the model call, regex-redact `sk-` keys and `Bearer` tokens.
- Validate output with Pydantic; **one retry** on invalid JSON, then mark unavailable and continue
  (US-E3-002, `doc/04` §5).
- Abstention (`doc/09` §6): ambiguous intent / incomplete trace → low confidence or `is_failure` unknown;
  do not escalate uncertain cases straight to P0.
- Persist to `judge_outputs` (`doc/02` §8) for audit.

### 3d. 20-minute rule (`team` Deliverable 2)
If no provider key works within 20 min, ship the **heuristic stub**: map rule signals → `JudgeDecision`
with low confidence and `reason="heuristic fallback"`, and move on. Caching (US-E3-004, P1) is **CUT**.

**Acceptance:** judge returns schema-valid `JudgeDecision`; invalid JSON retried once then marked unavailable;
embedded "ignore instructions" trace text does not change the verdict.

---

## Step 4 — FailureEvent builder + evidence + API (2:45–3:15) — `apps/api/app/services/failures.py`

### 4a. Merge signals + judge → canonical `failure_events` rows (`doc/01` §10, `doc/02` §9, `doc/04` §7)
Row fields: `{analysis_run_id, session_id, failure_type, workflow, tool_name, parameter_name,
expected_value, observed_value, impact_category, severity_score(0–100), confidence(0–1),
semantic_summary, evidence_tier(1–4)}`.

- **Conflict handling (US-E4-003):** recorded tool facts override LLM claims. Example: rule says
  `refund_order(amount=100)` vs user "10" → `WRONG_PARAMETER` expected=10/observed=100 stands even if the
  judge disagrees.
- Set `impact_category` (e.g. `financial` for refund/amount issues).
- `semantic_summary` describes the **deviation**, not the whole conversation (feeds Slice 3 embeddings).

### 4b. Evidence rows → `failure_evidence` (US-E4-002, `doc/01` §11, `doc/02` §10)
Every failure event gets **≥1** evidence row, each linked to a real `session_events.id` (immutable
evidence, `doc/05` §14). Set the strongest **evidence_tier**:
- **E1** outcome/state changed · **E2** tool call/result confirms · **E3** structured trace/param compare ·
  **E4** semantic judge only.
Record the **strongest available** tier on the failure event; LLM-only (E4) must not be presented as
conclusive when E1–E3 exist. Evidence `label` examples: USER_INTENT, TOOL_ARGUMENT, TOOL_RESULT,
DUPLICATE_EXECUTION, FINAL_RESPONSE.

### 4c. Endpoint — `GET /sessions/{sessionId}/failures` (`doc/08`)
Response `{items:[{id, failure_type, tool_name, parameter_name, expected_value, observed_value,
confidence, evidence_tier, evidence:[{label, event_id}]}]}`. Add repository methods in
`apps/api/app/repositories/failures.py` (all Supabase writes/reads go through repositories, `doc/03` §7).

**Acceptance (test in Step 6):** conflict test (tool fact beats judge claim); evidence-tier priority
correct (strongest tier chosen); every failure has ≥1 evidence ref.

---

## Step 5 — Session evidence page (3:15–4:00) — `apps/web/app/sessions/[sessionId]/page.tsx`

The demo weapon. Fetch `GET /sessions/{id}`, `/events`, `/failures`. Components (yours):

- **`EvidenceTimeline`** — vertical USER → AGENT → TOOL CALL → TOOL RESULT → FINAL (`doc/01` §18,
  `doc/12` Evidence Timeline). Highlight the mismatch step with **label + icon, never color alone**
  (`doc/12` Accessibility). HTML-escape all trace text (`doc/05` §5).
- **`MismatchDiff`** — Expected vs Observed side-by-side (Expected 10 / Observed 100). Plain text is an
  acceptable fallback.
- **AI interpretation visually distinct from recorded facts** — subtle purple/indigo treatment for the
  judge's `reason`/hypothesis; label it **"AI hypothesis"** (`doc/12` Evidence colors, `doc/05` §7).

**Priority colors (`doc/12`):** P0 `#B91C1C`, P1 `#EA580C`, P2 `#CA8A04`, P3 `#475569`; accent `#2563EB`.
**Accessibility:** ≥4.5:1 contrast; tool payloads wrap/scroll safely; keyboard-accessible.

**Acceptance:** open a known wrong-parameter session → timeline renders in order, mismatch step
highlighted, Expected/Observed visible, AI hypothesis visually separated from facts.

---

## Step 6 — Tests (15 min max)

- `tests/test_detectors.py`: duplicate refund flagged; repeated `get_order` NOT flagged; loop of 4 flagged.
- `tests/test_failures.py`: conflict (tool fact beats judge claim); evidence-tier priority correct.

Run: `cd apps/api && python -m pytest tests/test_detectors.py tests/test_failures.py`.

---

## Step 7 — Handoffs & guardrails

- **Need from Slice 1:** session/event JSON shape (0:15) → `demo.jsonl` (1:00) → `session_events` rows (2:00).
- **Hand to Slice 3 by ~3:15:** real `failure_events` rows in Supabase + 3 example JSON rows in chat, so
  clustering starts on real data.
- **Never** import/read `data/demo/ground_truth.json` in Slice 2 code (`doc/02` §14, `doc/05` §14).
- Register any new router in `apps/api/app/main.py` as a **tiny separate commit**, announced in chat.

---

## Cut list (apply in this order if behind)

1. Judge provider → heuristic stub (Step 3d).
2. Redaction → minimal regex for `sk-` / `Bearer` only (US-E4-004 lite).
3. `MismatchDiff` polish → plain-text Expected/Observed is acceptable.

Never cut: the five deterministic rules, per-session try/except, evidence references, or the
ground-truth isolation.

---

## Dependency chain at a glance

```
Step 0 contracts
      ↓
Step 1 fixture stubs ──────────────┐  (unblocks rules with no DB)
      ↓                            │
Step 2 deterministic rules ─────► detection_signals ─┐
      ↓ (candidates only)                            │
Step 3 judge ─────────────────► judge_outputs        │
      ↓                                               ↓
Step 4 FailureEvent builder ──► failure_events + failure_evidence
      ↓                                               │
      ├─► GET /sessions/{id}/failures ────────────────┤
      ↓                                               ↓
Step 5 session page (timeline + diff + AI hypothesis) │
                                                      ↓
                                        Step 7 → Slice 3 clustering
```
