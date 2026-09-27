# Slice 1 — Intake: Import → Normalized Sessions (+ Demo Fixture)

**Owner:** Person 1 (strongest Python) · **Branch:** `slice-1-intake`
**Backlog:** E1 (US-E1-001/002/003) + E10 (US-E10-001…007) · **Docs:** `doc/01` §5–6, `doc/02` §3–5, `doc/03` §6, `doc/08` (Datasets + Sessions)

## Why you are the critical path
Everyone develops against your output. Your fixture file unblocks Slices 2–4, so it comes FIRST — before your API, before your pages.

## 4-hour timeline (minutes)
| Time | Task |
|------|------|
| 0:00–0:15 | ALL 4 together: freeze contracts (see bottom). Then you start the generator immediately. |
| 0:15–1:00 | **E10 generator + fixture.** Deadline is hard: push `data/demo/demo.jsonl` by 1:00. |
| 1:00–2:00 | Ingestion: `POST /datasets/import`, validation, normalize → persist to Supabase. |
| 2:00–2:45 | Read APIs: `GET /datasets`, `GET /datasets/{id}`, `GET /sessions/{id}/events`. |
| 2:45–3:30 | Pages: `/import`, `/runs/[runId]` (static summary for now — Slice 4 wires it live). |
| 3:30–4:00 | Integration + demo rehearsal. Help whoever is stuck. |

## Deliverable 1 — Fixture (by 1:00, non-negotiable)
Create `apps/api/app/demo_generator.py` (plain script, no API needed):

- ~300 sessions total (small = fast; 2,000+ is for the 72h version): ~240 correct + ~60 faulty.
- Domain: customer-support / e-commerce agent, tools `get_order`, `refund_order`, `change_address`, `cancel_order` (`doc/00` §Canonical Demo Domain).
- Inject 5 failure patterns, ~12 sessions each: WRONG_PARAMETER (refund 10→100), FALSE_SUCCESS (tool error + "completed successfully"), DUPLICATE_ACTION (double refund), WRONG_TOOL (cancel instead of address change), LOOP_RETRY (same tool 4+ times).
- Vary phrasing; include `metadata.agent_version` (`v2`/`v3`), timestamps, `final_answer`.
- Session JSON shape (`doc/01` §5): `{session_id, messages[], tool_calls[], final_answer, metadata{agent_version, timestamp}}`.
- Write output to `data/demo/demo.jsonl` (one session per line) + commit it. Ground truth: keep a SEPARATE `data/demo/ground_truth.json` (`{session_id: failure_type}`) — Slices 2–3 must never import it; only Slice 4's evaluation reads it.

## Deliverable 2 — Ingestion API
Files (all yours, nobody else touches them):
- `apps/api/app/services/ingestion.py` — parse JSON/JSONL, validate (session ID required, messages and/or tool_calls present), reject bad lines WITHOUT crashing the import, return `{accepted, rejected, errors[]}`.
- `apps/api/app/api/datasets.py` — `POST /datasets/import` (multipart `file` + `name`, response 201 per `doc/08`), `GET /datasets`, `GET /datasets/{datasetId}`.
- `apps/api/app/repositories/datasets.py`, `sessions.py` — all Supabase writes go through these (service-role key server-side only, `doc/05` §4).
- Normalization (`doc/01` §6): map raw events → `USER_MESSAGE, ASSISTANT_MESSAGE, TOOL_CALL, TOOL_RESULT, ASSISTANT_FINAL` with stable `sequence_no`, link tool call↔result when IDs exist, write to `datasets`, `sessions`, `session_events` tables (migration already applied).

## Deliverable 3 — Read APIs + pages
- `GET /sessions/{sessionId}` and `GET /sessions/{sessionId}/events` (shape per `doc/08`).
- `apps/web/app/import/page.tsx` — file picker → POST import → show accepted/rejected → button "Start analysis" (POST `/analysis-runs`, Slice 4 owns that endpoint; if it's not ready, show the dataset ID so the demo can proceed manually).
- `apps/web/app/runs/[runId]/page.tsx` — run summary numbers (sessions, failures, clusters). Initially render from API; Slice 4 will polish.

## Tests (yours, 15 min max)
`apps/api/tests/test_ingestion.py`: valid file imports; malformed line rejected with line number; whole import never crashes on one bad session.

## What you hand to others (and when)
- By 1:00 → `data/demo/demo.jsonl` committed (Slices 2–4 start real work).
- By 2:00 → import works end-to-end so jury story "upload → analyze" is alive.
- Canonical session/event JSON examples pasted in team chat at 0:15 (before code, so others can stub).

## If you fall behind, cut in this order
1. Drop `/runs` polish (static numbers are fine).
2. Drop `GET /datasets` list (demo uses one dataset).
3. NEVER cut the fixture or validation errors — everything downstream dies without them.

## Git
```bash
git checkout -b slice-1-intake
# commit + push by 1:00 (fixture), 2:00 (import), 3:30 (pages)
```
Shared files (`app/main.py` router registration, migrations): tiny separate commits, announce in chat before pushing.
