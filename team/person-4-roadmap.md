# Person 4 Roadmap — Ordered Task List (240 minutes)

Follow strictly in order unless marked ⏳ (do while blocked). Each task states files,
minutes, exact verification, and what unblocks next. Companion: `person-4-pack.md` (§N refs).

## Phase 0 — Kickoff (0:00–0:15)

- [ ] **T1 (15 min + 5 min transcription) — Run the contract meeting (in person).** Whiteboard:
  FailureEvent fields, session/event example paste (Slice 1), `detect()`/`cluster()` signatures
  (Slices 2–3), page URL patterns, fixture deadline 1:00, integration 3:00.
  Disputes: 60-second majority vote; 2–2 tie → domain owner decides (S1 sessions, S2 events,
  S3 clusters, you APIs/pages). Assign LLM-key owner (Gemini free / agent-router, 20-min check).
  Right after: type the whiteboard photo into `team/CONTRACTS.md`, commit, GO.
  Unblocks: everyone's parallel work.

## Phase 1 — Shell + inbox on mocks (0:15–1:00)

- [ ] **T2 (15 min) — Nav shell.** `apps/web/app/layout.tsx`: Logo `Undercover` | Issue Inbox
  | Runs | Benchmark | Import. Tokens: bg `#F8FAFC`, accent `#2563EB`, P0–P3 colors (pack §1).
  Done when: nav renders on every route.
- [ ] **T3 (10 min) — Mock cluster JSON.** Write 5 mock clusters matching pack §10.4 shape
  in `apps/web/lib/mock-clusters.ts`. Done when: file typechecks against your Zod schema.
- [ ] **T4 (20 min) — Inbox header + cards.** `apps/web/app/inbox/page.tsx` +
  `components/inbox/{ClusterCard,PriorityBadge}.tsx`: metrics row + cards sorted by priority
  with all 7 US-E8-001 fields, "Inspect evidence →" links (pack §2).
  Done when: inbox renders fully on mocks.

## Phase 2 — Runs API + health (1:00–2:00)

- [ ] **T5 (25 min) — `POST /analysis-runs` + `GET` + `/summary`.**
  `apps/api/app/api/runs.py`: 202 QUEUED row creation, progress shape (pack §10.1–10.3).
  Test: `curl -X POST localhost:8000/analysis-runs -d '{"dataset_id":"..."}'` → 202.
- [ ] **T6 (10 min) — Extend `/health`.** Add Supabase ping to `app/main.py`
  (keep `{status, database, version}`, no secrets). Test: `curl localhost:8000/health`.
- [ ] **T7 (25 min) — `pipeline.py` skeleton.** `apps/api/app/services/pipeline.py` with the
  full stage order wired to STUB functions matching the 0:15 signatures; BackgroundTasks,
  per-session try/except, COMPLETED/FAILED transitions (pack §4).
  Done when: a run goes QUEUED → RUNNING → COMPLETED on stubs end-to-end.

## Phase 3 — Evaluation + benchmark page (2:00–2:45)

- [ ] **T8 (25 min) — Evaluation endpoints.** `services/evaluation.py`: `POST …/evaluate`
  reads `ground_truth_labels` ONLY here (never in detection), computes precision/recall/F1/FP/FN,
  persists `evaluation_results`; `GET …/evaluation` returns them (pack §10.5–10.6).
  Test on 10 hand-made predictions before touching real data.
- [ ] **T9 (20 min) — Benchmark page.** `apps/web/app/benchmark/[runId]/page.tsx`: metric cards
  + mandatory ground-truth note (pack §6). Renders on mocks first.

## Phase 4 — Integration (2:45–3:30)

- [ ] **T10 (20 min) — Real function swap.** Replace pipeline stubs with Slice 2/3 real functions;
  run import→run→summary on the real 300-session fixture. Fix glue mismatches only —
  never rewrite their internals; report bugs to owners.
- [ ] **T11 (15 min) — Swap mocks → real APIs** on inbox + benchmark pages. Verify numbers match DB.
- [ ] **T12 (10 min) — ⛑️ Fallback JSON (NON-NEGOTIABLE).** Snapshot good run into
  `apps/web/lib/demo-fallback.json`. Done when: file exists and is < 200 lines.

## Phase 5 — Harden + rehearse (3:30–4:00)

- [ ] **T13 (10 min) — Smoke tests.** `test_evaluation.py` + `test_api_smoke.py`
  (`pytest apps/api/tests/ -x -q` green).
- [ ] **T14 (5 min) — Secrets audit.** `grep -ri "service_role\|sb_secret\|sk-" apps/web --include='*.ts*'`
  must return nothing; `git status` shows no `.env*`.
- [ ] **T15 (5 min) — Release check** (`09` §11 list in pack §9): import clean, ≥1 cluster with
  evidence, timeline readable, sub-scores visible, metrics measured, demo < 3 min.
- [ ] **T16 (10 min) — Rehearse ×2** using the 3-min script (pack §9). Fix demo-blocking bugs only.

## Overflow — only if T1–T16 done before 3:45

- [ ] **T17 — E11 regression-test endpoint + button** (pack §8). Otherwise CUT, no guilt.

## While blocked (⏳ tasks, do these any time others are late)

- Polish empty/loading/error states on your pages (never show "0 failures" as proof of safety).
- Improve fallback JSON (add second session example).
- Pre-write your 3-min demo narration.

## Critical path summary

T1 → T4 (inbox visible by 1:00) → T7 (pipeline skeleton by 2:00) → T10 (real run by 3:05) →
T12 (fallback by 3:20) → T15/T16 (rehearsal). T8/T9 and T5/T6 are parallel-safe.
If integration slips past 3:15, freeze features and jump to T12 immediately.
