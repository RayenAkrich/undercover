# Slice 4 — Verdict: Issue Inbox + Benchmark + Platform + Demo Owner

**Owner:** Person 4 (strongest TypeScript) · **Branch:** `slice-4-verdict`
**Backlog:** E8 (US-E8-001/002) + E9 (US-E9-001/002/004) + E12 (US-E12-001/002) + E11 only if ahead
**Docs:** `doc/01` §16 + §19, `doc/02` §14–15, `doc/08` (Runs/Benchmark/Bonus), `doc/12` (full design system)

## Mission
Own the two pages the jury stares at (Inbox + Benchmark), the run orchestration glue, and the demo itself. You are the integrator: at 3:30 everything must render real data on your pages.

## 4-hour timeline (minutes)
| Time | Task |
|------|------|
| 0:00–0:15 | ALL together: freeze contracts. You run this meeting (15 min hard cap): confirm endpoint shapes, fixture deadline (1:00), integration checkpoint (3:00). |
| 0:15–1:00 | Layout/nav + Issue Inbox against **mock cluster JSON** (invent 5 clusters matching `doc/08` shapes — do NOT wait for anyone). |
| 1:00–2:00 | `POST /analysis-runs` + `GET /analysis-runs/{runId}` + `/summary` + `GET /health`. Simple in-process orchestration calling Slice 1→2→3 functions (see below). |
| 2:00–2:45 | Evaluation (`POST …/evaluate`, `GET …/evaluation`) + `/benchmark` page. |
| 2:45–3:30 | Swap mocks → real APIs on inbox + benchmark. Precompute the **demo fallback JSON**. |
| 3:30–4:00 | Full demo rehearsal ×2. Fix only demo-blocking bugs. |

## Deliverable 1 — App shell + Issue Inbox (your pages, nobody else touches them)
- `apps/web/app/layout.tsx` nav: Logo `Undercover` | Issue Inbox | Runs | Benchmark | Import (+ `globals.css` tokens from `doc/12`: bg `#F8FAFC`, accent `#2563EB`, P0 `#B91C1C`/P1 `#EA580C`/P2 `#CA8A04`/P3 `#475569`).
- `apps/web/app/inbox/page.tsx` — Issue Inbox (moved here: `/` is now the Stitch landing page, see `landing/`): header metrics row (`N Sessions | M Failures | K Patterns | R% rate`), cluster cards sorted by priority (`[P0] title, occurrences · sessions · confidence, impact line, Inspect evidence →`).
- `ClusterCard`, `PriorityBadge` components in YOUR `apps/web/components/` subfolder (`components/inbox/`) — never in the shared root where Slices 2–3 put theirs.
- Run overview numbers come from `GET /analysis-runs/{runId}/summary`.

## Deliverable 2 — Run orchestration (the glue)
`apps/api/app/api/runs.py` + `apps/api/app/services/pipeline.py`:
- `POST /analysis-runs {dataset_id, config} → 202 {id, QUEUED}`; background task runs: load sessions → Slice 2 rules/judge → build events → Slice 3 cluster → prioritize → COMPLETED (FastAPI `BackgroundTasks`, in-process — NO Celery/Redis, `doc/03` §8).
- Coordinate function signatures with Slices 2–3 at the 0:15 meeting (e.g. `detect(session_events) -> signals`, `cluster(events) -> clusters`). If their functions aren't ready at 2:00, orchestrate against their stub shapes and integrate at 3:00.
- `GET /analysis-runs/{runId}` (progress counts) and `/summary` (shape per `doc/08`).

## Deliverable 3 — Benchmark (`apps/api/app/services/evaluation.py`)
- ONLY your code reads `ground_truth_labels` — and ONLY after discovery completes (`doc/02` §14, `doc/04` §13). Enforce by calling evaluate as a separate step, never inside detection.
- Metrics: precision / recall / F1 + FP / FN (skip ARI/NMI in 4h — US-E9-003 is P1). Persist to `evaluation_results`.
- `/benchmark/[runId]/page.tsx`: metric cards with REAL measured values only, plus the note "Ground-truth labels are used only after discovery completes" (`doc/12`).
- E11 regression-test endpoint + button: build ONLY if all above done by 3:15 (Given/When/Then text from cluster title + evidence).

## Deliverable 4 — Platform + demo insurance
- `GET /health` → `{status, database, version}`, no secrets.
- **Demo fallback (non-negotiable):** at 2:45, snapshot one good run's summary + top cluster + one session into `apps/web/lib/demo-fallback.json`. If anything is broken at 3:50, the demo runs on this file (jury mode, `doc/12`). Tell the team this exists — it removes panic.
- Demo script (3-min, `doc/04` §14): 300 sessions → import → "5 patterns" → open P0 duplicate-refund → evidence timeline → benchmark numbers → close on regression-loop vision. Rehearse twice.

## Tests (15 min max)
`tests/test_evaluation.py`: precision/recall on a tiny hand-made prediction set; `test_api_smoke.py`: `/health` 200, import→run→summary on 5 sessions.

## What you need / hand over
- Need: Slice 1 fixture (1:00) for realistic mocks; Slice 3 clusters (~3:15) for live inbox; Slice 2 session page link target for "Inspect evidence" buttons (agree URL `…/sessions/[id]` at 0:15).
- You hand the TEAM: meeting notes + contract paste (0:15), fallback JSON (2:45), go/no-go call (3:50).

## Cut list (in order)
1. E11 regression test → cut entirely if behind.
2. ARI/NMI, run-progress polling (static refresh button is fine).
3. Auth/users/multi-tenancy — out of scope, demo mode only (`doc/05` §2).
