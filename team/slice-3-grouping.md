# Slice 3 — Grouping: Fingerprint → Cluster → Label → Prioritize + Cluster Page

**Owner:** Person 3 (most ML-comfortable) · **Branch:** `slice-3-grouping`
**Backlog:** E5 (US-E5-001/002/003) + E6 (US-E6-001/002/003/005) + E7 (US-E7-001…004)
**Docs:** `doc/01` §12–15, `doc/02` §11–13, `doc/03` §6, `doc/08` (Clusters), `doc/09` §3–4

## Mission
Turn a pile of `FailureEvent`s into 5 named, scored, ranked recurring issues — the "wow" of the demo ("5 recurring patterns discovered").

## 4-hour timeline (minutes)
| Time | Task |
|------|------|
| 0:00–0:15 | ALL together: freeze contracts. Agree the `FailureEvent` JSON with Slice 2 verbally NOW. |
| 0:15–1:30 | Build fingerprint + clustering against **synthetic stub events you invent** (5 groups × 8 rows matching the agreed JSON — do NOT wait for Slice 2). |
| 1:30–2:30 | Priority scoring + cluster statistics + persist to `failure_clusters` / `cluster_members`. |
| 2:30–3:15 | Cluster APIs + `/issues/[clusterId]` page. Switch input from stubs to Slice 2's real rows. |
| 3:15–4:00 | Labeling (template-first), end-to-end check with Slice 4's inbox, demo rehearsal. |

## Deliverable 1 — Fingerprint + embedding (`apps/api/app/clustering/`, all files yours)
- `fingerprint.py` — `make_fingerprint(event) -> {workflow, failure_type, tool, parameter, outcome_category, agent_version}` + `fingerprint_hash` (sha1 of the tuple). Exact-match hashes give you free dedup/pre-groups (`doc/01` §13 step 1).
- `embed.py` — semantic summary per event ("Refund executed twice after timeout", NOT the full transcript — US-E5-002) vectorized with **TF-IDF (scikit-learn, already installed)**. 4-hour rule: NO `sentence-transformers` download, NO provider embedding API — TF-IDF on 60–300 short summaries clusters the 5 known patterns fine and has zero network risk.
- Persist to `failure_fingerprints` (skip the `vector` column — pgvector is optional per `doc/02` §11).

## Deliverable 2 — Clustering (`cluster.py`)
- **HDBSCAN is already installed** (`hdbscan` in `requirements.txt` — verified installed in `.venv`). Use it with `min_cluster_size=5`; on ANY failure fall back to `AgglomerativeClustering(n_clusters=5, cosine)` — the doc explicitly allows this fallback (`doc/01` §13).
- Pre-group by `(workflow, failure_type, tool)` before embedding to stabilize tiny data.
- Noise/outliers are EXPECTED — keep them queryable, never force them into clusters (US-E6-001).
- `representatives.py` — pick 3–5 medoid/central members per cluster (`is_representative=true`).

## Deliverable 3 — Priority (exact formula, `doc/01` §15)
`services/prioritization.py` (put it in YOUR folder to avoid touching Slice 2's `services/`):
```
Priority = 0.30*Impact + 0.25*Frequency + 0.20*Severity + 0.15*Reach + 0.10*Confidence
```
- 4-hour heuristics, all 0–100: Impact = financial/size map per failure_type (DUPLICATE_ACTION 90, WRONG_PARAMETER 80, FALSE_SUCCESS 85, WRONG_TOOL 70, LOOP_RETRY 50); Frequency = count scaled to max cluster; Severity = mean event severity; Reach = affected sessions scaled; Confidence = mean event confidence.
- Labels P0 ≥ 80, P1 ≥ 60, P2 ≥ 40, else P3 (configurable const). UI MUST show all 5 sub-scores (US-E7-004) — Slice 4 renders them, you compute them.

## Deliverable 4 — Labeling + APIs + page
- Labels: **template-first** — `"{FailureType} in {workflow} via {tool}"` → humanized ("Duplicate refunds after retry"). LLM labeler (`doc/09` §3–4) ONLY if Slice 2's judge already works AND you finish early; template labels are jury-acceptable.
- `likely_contributing_factor` is hypothesis-language only ("may lack idempotency…"), never stated as fact.
- Endpoints: `GET /analysis-runs/{runId}/clusters` (filters `priority`, `tool`, `sort`), `GET /clusters/{clusterId}`, `GET /clusters/{clusterId}/members` (shapes per `doc/08`).
- `apps/web/app/issues/[clusterId]/page.tsx`: title + priority badge, generated summary, stats row, priority breakdown bars, behavior pattern (intent → action → outcome), representative evidence links, hypothesis box labeled "AI hypothesis".

## Tests (15 min max)
`tests/test_clustering.py`: 5 synthetic groups → ≥4 clusters found; noise preserved; `test_priority.py`: weights sum to 100 scale, P0 threshold on a duplicate-refund-heavy cluster.

## What you need / hand over
- Need from Slice 2: `FailureEvent` JSON shape (0:15) → real rows (~3:15). Your stubs make the wait free.
- Hand to Slice 4 by ~3:15: 5 clusters with titles + scores in Supabase so the inbox renders real data.
- Cluster statistics to compute (US-E6-005): occurrence_count, affected sessions, first/last seen, top tool, version distribution.

## Cut list (in order)
1. LLM cluster labels → templates (pre-approved above).
2. Embeddings → pure fingerprint-hash grouping if sklearn misbehaves (5 injected patterns separate cleanly on structured fields alone).
3. Members pagination → return all members (tiny data).
