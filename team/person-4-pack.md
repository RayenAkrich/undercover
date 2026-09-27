# Person 4 Pack — Everything You Must Do (Slice 4: Verdict)

**You:** Person 4 (strongest TypeScript) · **Branch:** `slice-4-verdict`
**Your file ownership (nobody else touches these):**
`apps/web/app/inbox/`, `apps/web/app/runs/`, `apps/web/app/benchmark/`,
`apps/web/app/layout.tsx` (nav), `apps/web/components/inbox/`,
`apps/api/app/api/runs.py`, `apps/api/app/services/pipeline.py`,
`apps/api/app/services/evaluation.py`, `apps/web/lib/demo-fallback.json`
**Shared files (tiny PRs, announce first):** `apps/api/app/main.py`, `08_OPENAPI.md`

Work top to bottom, tick boxes as you go. Each numbered block is one work item.

---

## 0. Shared context (memorize once)

### 0.1 The 4-hour clock
| Time | You do |
|------|--------|
| 0:00–0:15 | RUN the all-hands contract meeting (in person, whiteboard; transcribe photo into `team/CONTRACTS.md`): confirm endpoint shapes below, fixture deadline 1:00, integration checkpoint 3:00. Disputes = majority vote, 2–2 → domain owner. Assign LLM-key owner. |
| 0:15–1:00 | Layout/nav + Issue Inbox against MOCK cluster JSON you invent (match §3 shapes). Wait for nobody. |
| 1:00–2:00 | `POST /analysis-runs` + `GET /analysis-runs/{runId}` + `/summary` + `GET /health`. |
| 2:00–2:45 | Evaluation endpoints + `/benchmark` page. |
| 2:45–3:30 | Swap mocks → real APIs. Snapshot `demo-fallback.json`. |
| 3:30–4:00 | Rehearse demo ×2. Fix demo-blocking bugs only. |

### 0.2 P0 Definition of Done (applies to every item you finish)
1. Works on the reference dataset (`data/demo/demo.jsonl`).
2. Happy path AND main failure path tested.
3. API/schema changes documented in `08_OPENAPI.md`.
4. No secrets exposed client-side.
5. Demo flow still functional.

### 0.3 Team end-to-end acceptance (you call go/no-go on this at 3:50)
Given thousands of correct + faulty sessions, when an analyst imports and analyzes,
the system must: (1) reconstruct timelines, (2) identify failures, (3) group events,
(4) label patterns, (5) prioritize clusters, (6) expose evidence,
(7) allow inspecting a representative session, (8) report measured benchmark metrics.

---

## 1. Layout + nav — WORK ITEM 1 ☐

- [ ] `apps/web/app/layout.tsx` nav: Logo `Undercover` | Issue Inbox (`/inbox`) | Runs | Benchmark | Import (`/import`).
- [ ] Use tokens from `doc/12`: page bg `#F8FAFC`, accent `#2563EB`, P0 `#B91C1C`, P1 `#EA580C`, P2 `#CA8A04`, P3 `#475569`.
- [ ] Priority is ALWAYS label + color, never color alone (accessibility, `doc/12`).

## 2. Issue Inbox — WORK ITEM 2 ☐ (US-E8-001, P0)

`apps/web/app/inbox/page.tsx` + `apps/web/components/inbox/ClusterCard.tsx`, `PriorityBadge.tsx`.
Header metrics row first: `N Sessions | M Failures | K Patterns | R% failure rate`
(from `GET /analysis-runs/{runId}/summary`, §3.3). Then cluster cards **sorted by priority**,
each showing all 7 fields (US-E8-001 acceptance):
- [ ] priority (badge), title, occurrence count, affected sessions, impact, confidence, first/last seen.
- [ ] Primary CTA per card: **Inspect evidence** → `/issues/[clusterId]` (Slice 3's page, agree URL at 0:15).
- [ ] Start with mock data (§3.1), swap to `GET /analysis-runs/{runId}/clusters` at 2:45.

## 3. Run overview — WORK ITEM 3 ☐ (US-E8-002, P0)

`apps/web/app/runs/[runId]/page.tsx`. Show all 5 numbers + state:
- [ ] sessions analyzed, suspicious sessions, failure events, recurring clusters, run state/progress.
- [ ] Progress = stage display (Imported → Normalized → Detected → Judged → Clustered → Prioritized). Never fake percentages.

## 4. Run orchestration — WORK ITEM 4 ☐ (cross-epic glue, `doc/03` §8)

`apps/api/app/api/runs.py` + `apps/api/app/services/pipeline.py`.
- [ ] `POST /analysis-runs` → `202 {id, status: QUEUED}`, creates DB row, launches FastAPI `BackgroundTasks`. NO Celery/Redis.
- [ ] Background task order: load sessions (Slice 1) → detect + judge (Slice 2) → build events (Slice 2) → cluster + prioritize (Slice 3) → COMPLETED/FAILED.
- [ ] Agree function signatures at 0:15 (e.g. `detect(events) -> signals`, `cluster(events) -> clusters`). If not ready at 2:00, orchestrate against stub shapes, integrate at 3:00.
- [ ] `GET /analysis-runs/{runId}` (progress counts) + `GET /analysis-runs/{runId}/summary` (§3.3).
- [ ] One malformed session or failed judge call must NEVER crash the run (enforce try/except per session in each stage).

## 5. Evaluation — WORK ITEM 5 ☐ (US-E9-001 + US-E9-002, P0)

`apps/api/app/services/evaluation.py`. **ONLY your code reads `ground_truth_labels`, and ONLY after discovery completes** (`doc/02` §14). Separate step, never inside detection.
- [ ] `POST /analysis-runs/{runId}/evaluate` → compares predictions vs hidden labels → persists `evaluation_results`.
- [ ] Metrics: precision, recall, F1, false_positives, false_negatives (§3.4). ARI/NMI (US-E9-003, P1) is CUT.
- [ ] `GET /analysis-runs/{runId}/evaluation` returns them.

## 6. Benchmark page — WORK ITEM 6 ☐ (US-E9-004, P0)

`apps/web/app/benchmark/[runId]/page.tsx`.
- [ ] Metric cards from real measured values ONLY. Never render sample numbers as truth.
- [ ] Mandatory note: "Ground-truth labels are used only after discovery completes." (`doc/12`)

## 7. Platform — WORK ITEM 7 ☐ (US-E12-001 + US-E12-002, P0)

- [ ] `GET /health` → `{status, database, version}` (exists — extend with a Supabase ping). No secret/provider details.
- [ ] No-secrets audit before demo: grep bundle for `service_role`, `sb_secret`, `sk-`; confirm `.env*` untracked.

## 8. Bonus — WORK ITEM 8 ☐ (E11, only if all above done by 3:15, else CUT entirely)

- [ ] `POST /clusters/{clusterId}/regression-test` → `{title, given, when, then}` Given/When/Then text from cluster title + evidence (US-E11-001).
- [ ] Example: Given the refund API times out / When a user requests one refund / Then at most one successful refund may occur.

## 9. Demo insurance + rehearsal — WORK ITEM 9 ☐ (non-negotiable)

- [ ] 2:45 — snapshot one good run into `apps/web/lib/demo-fallback.json` (summary + top cluster + one session). Broken at 3:50 → demo runs on this file.
- [ ] 3:30 — run `09` §11 release check: dataset imports clean, run completes, ≥1 cluster with evidence, timeline readable, sub-scores visible, metrics measured, no secrets, demo < 3 min.
- [ ] 3-min script (`doc/04` §14): "300 sessions" → import → "5 patterns discovered" → open P0 duplicate refund → user-asked-once → refund-called-twice evidence → benchmark numbers → close on regression-loop vision. Rehearse ×2.

---

## 10. Your endpoint contracts (exact shapes, `doc/08`)

Error format everywhere: `{"error": {"code": "STRING", "message": "..."}}`. IDs = UUID strings, times = ISO-8601 UTC.

### 10.1 `POST /analysis-runs` → 202
Request: `{"dataset_id": "uuid", "config": {"judge_model": "configured-model", "loop_threshold": 4, "clustering": {"algorithm": "hdbscan", "min_cluster_size": 5}}}`
Response: `{"id": "uuid", "status": "QUEUED"}`

### 10.2 `GET /analysis-runs/{runId}`
Response: `{"id", "status": "RUNNING", "sessions_total": 2347, "sessions_processed": 1220, "failure_events_count": 76, "clusters_count": 0, "started_at": "..."}`

### 10.3 `GET /analysis-runs/{runId}/summary` (inbox header + run overview)
Response: `{"sessions_analyzed": 2347, "candidate_sessions": 196, "failure_events": 148, "clusters": 5, "noise_failures": 9, "highest_priority_cluster_id": "uuid"}`

### 10.4 `GET /analysis-runs/{runId}/clusters` (inbox list)
Query: `?priority=P0|P1|P2|P3&tool=refund_order&sort=priority|occurrences|recent`
Item: `{"id", "title": "Duplicate refunds after retry", "priority_label": "P0", "priority_score": 91, "occurrence_count": 32, "affected_sessions": 28, "confidence_score": 97, "first_seen": "...", "last_seen": "..."}`

### 10.5 `POST /analysis-runs/{runId}/evaluate` → `{"status": "completed"}`
### 10.6 `GET /analysis-runs/{runId}/evaluation`
Response: `{"precision": 0.94, "recall": 0.89, "f1": 0.91, "false_positives": 12, "false_negatives": 17, "ari": null, "nmi": null}` (numbers are contract EXAMPLES — UI shows measured values only)

### 10.7 `POST /clusters/{clusterId}/regression-test` (bonus)
Response: `{"title": "Prevent duplicate refund after retry", "given": "...", "when": "...", "then": "...", "evidence_cluster_id": "uuid"}`

### 10.8 API Change Protocol (follow when you change an endpoint)
1. update `08_OPENAPI.md`, 2. update Pydantic DTOs, 3. update frontend types/client, 4. update tests, 5. note migration impact.

## 11. Shapes you consume but don't compute

Priority object (Slice 3 computes, you render ALL sub-scores — US-E7-004):
`Priority = 0.30*Impact + 0.25*Frequency + 0.20*Severity + 0.15*Reach + 0.10*Confidence`
Labels: P0 ≥ 80, P1 ≥ 60, P2 ≥ 40, else P3. Cluster detail fields: `{"id", "title", "summary", "likely_contributing_factor" (hypothesis!), counts, "priority": {impact, frequency, severity, reach, confidence, score, label}, "top_tools", "agent_versions", "representative_failure_ids"}`.

## 12. Handoffs (what you need, when)

| From | What | When | If late |
|---|---|---|---|
| Slice 1 | session/event JSON shape → `data/demo/demo.jsonl` → `session_events` rows | 0:15 / 1:00 / 2:00 | Use the 0:15 paste + your own mocks |
| Slice 2 | `/sessions/[id]` URL for your "Inspect evidence" buttons | 0:15 | Link `#`, fix at 3:00 |
| Slice 3 | 5 clusters with titles + scores in Supabase | ~3:15 | Inbox stays on mocks, swap at 3:30 |
| You → team | meeting notes + contracts (0:15), fallback JSON (2:45), go/no-go (3:50) | — | — |

## 13. Tests (15 min max, US-E12-005 slice share)

`tests/test_evaluation.py` (precision/recall on a hand-made prediction set) +
`tests/test_api_smoke.py` (`/health` 200; import→run→summary on 5 sessions).

## 14. Cut list (in order, no guilt)

1. WORK ITEM 8 entirely. 2. Run-progress polling (refresh button is fine). 3. Auth/multi-tenancy (demo mode only, `doc/05` §2).

## 15. Deploy pointer

`doc/10_DEPLOYMENT.md` has the Vercel + Render setup. Not sprint work — read it only if deploying after the 4h.
