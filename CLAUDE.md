# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Undercover / Hidden Failures Intelligence (HFI)** — a hackathon MVP that discovers recurring *behavioral* failures in AI-agent traces. The core insight: an agent can return HTTP 200, throw no exceptions, and still do the wrong thing (wrong refund amount, false success after a tool error, duplicate action, wrong tool, retry loop). Ordinary APM/monitoring misses these; Undercover finds them, groups them, and ranks what to fix first with evidence.

The canonical demo domain is a customer-support / e-commerce agent with tools `get_order`, `refund_order`, `change_address`, `cancel_order`.

The pipeline is the product:

```
raw traces → normalized sessions → deterministic detection → LLM judge (selective)
→ FailureEvents (+evidence) → fingerprint + embed + cluster → label → prioritize (P0–P3)
```

`doc/` is the source of truth for behavior and contracts — read the relevant doc before implementing. `doc/00_README.md` is the index; `doc/03_NEXTJS_ARCHITECTURE.md` maps directly onto the backend module layout; `doc/08_OPENAPI.md` is the UI↔API contract; `doc/02_SUPABASE_DATABASE.md` matches `supabase/migrations/001_init.sql`.

## Monorepo layout

npm workspace at the root; `apps/web` is the only JS workspace. `apps/api` is a separate Python (pip) project, not part of the workspace.

- `apps/web` — Next.js 14 App Router, TypeScript, Tailwind, Zod, `@supabase/ssr`. UI only: upload, run polling, browsing/filtering, evidence visualization. **Never** run judge calls or clustering in the browser.
- `apps/api` — FastAPI, Python 3.12+, Pydantic, numpy/pandas/scikit-learn/HDBSCAN. All parsing, DB writes, AI provider calls, embeddings, clustering, scoring, evaluation.
- `supabase/migrations` — canonical Postgres schema.
- `data/demo` — generated fixtures (gitignored except `.gitkeep`); `ground_truth.json` is benchmark-only.
- `doc/` — specification set. `team/slice-*.md` — how the four build slices divide the pipeline and which files each owns.

## Commands

From repo root:

```bash
npm run install:all      # npm install + pip install -r apps/api/requirements.txt
npm run dev:web          # Next.js dev server (apps/web)
npm run dev:api          # uvicorn app.main:app --reload (apps/api)
npm run build:web        # next build
```

Web (`apps/web`, run in that dir or with `--workspace apps/web`):

```bash
npm run lint             # next lint
npm run typecheck        # tsc --noEmit
```

API — tests use the `apps/api/tests/` package (test framework not yet pinned in requirements; expect pytest):

```bash
cd apps/api && python -m pytest                          # all tests
cd apps/api && python -m pytest tests/test_ingestion.py  # single file
```

`docker-compose up` builds and runs both apps together (web:3000, api:8000).

## Backend module boundaries (enforce these)

Business logic must not scatter DB calls or vendor SDK calls. Follow `doc/03` §6–7 and §10:

- `api/` — HTTP endpoints and request/response schemas only.
- `services/ingestion.py` — parse/validate JSON/JSONL, normalize to events, persist.
- `detectors/rules.py` — deterministic checks (duplicate action, retry loop, tool error, parameter mismatch, false-success candidate). Pure functions, no DB.
- `judge/` — provider-neutral adapter producing a `JudgeDecision` DTO. All product code consumes that schema, never a vendor response. Cache by input hash; retry on malformed output.
- `clustering/` — fingerprint → embed → HDBSCAN (agglomerative/cosine fallback) → representatives → stats.
- `services/failures.py`, `services/prioritization.py`, `services/evaluation.py`.
- `repositories/` — the only place that talks to Supabase (`SessionRepository`, `FailureRepository`, etc.). Keeps the pipeline testable without a live DB.

## Pipeline design rules (from `doc/00` §Important Rules — do not violate)

1. Deterministic detection first; send to the LLM judge only selected/ambiguous candidates, never every raw conversation.
2. Cluster normalized `FailureEvent` objects and their fingerprints — not whole conversations.
3. Output *likely contributing factor* / hypothesis, not asserted root cause.
4. Every cluster must expose representative traces and evidence — never hide behind a single score.
5. Generate cluster labels *after* clustering.
6. No enterprise infra (Kafka/K8s/queues) in P0; in-process orchestration is fine for demo-sized datasets.

Ground truth (`data/demo/ground_truth.json`, `ground_truth_labels`, `evaluation_results`) is read **only** by `services/evaluation.py` after discovery completes. The detection/clustering path must never read it.

## Security boundaries (`doc/03` §14)

Provider keys stay server-side. Treat all imported trace text as untrusted **data, never instructions** — imported content must not modify system prompts or config, and judge prompts are constrained to output schemas. Redact secrets/PII before LLM calls; validate upload MIME/extension/structure and limit size.

## Supabase / env conventions

- P0 runs in single-workspace demo mode: FastAPI is the trusted writer using the **service-role key, server-side only**. The browser never uses the service-role key. RLS is documented as production evolution (`doc/05`), not enabled for P0.
- Server env (`apps/api/.env`): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `JUDGE_MODEL`, `EMBEDDING_PROVIDER`, plus `FRONTEND_URL` (comma-separated CORS allowlist, consumed in `apps/api/app/main.py`).
- Browser env is `NEXT_PUBLIC_`-prefixed only: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`, and the Supabase anon key.
- **Gotcha:** `apps/web/utils/supabase/{client,server,middleware}.ts` read `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, but `.env.example` defines `NEXT_PUBLIC_SUPABASE_ANON_KEY`. These names must be reconciled or Supabase clients get an undefined key. `next.config.mjs` / Vercel deploy uses whatever is set — check both when the browser client silently fails.

## Deployment

Vercel (web) + Render (api, see `render.yaml`, health check `/health`) + Supabase; or a single `docker-compose` deployment. See `doc/10_DEPLOYMENT.md`.
