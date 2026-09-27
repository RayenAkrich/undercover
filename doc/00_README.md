# Hidden Failures Intelligence — AI Implementation Documentation

## Purpose

This documentation set defines the MVP for **Hidden Failures Intelligence (HFI)**, a hackathon-ready product that discovers recurring behavioral failures in AI-agent conversations and tool calls.

The product focuses on a gap that ordinary monitoring does not cover well: an agent can return HTTP 200, avoid exceptions, and still **do the wrong thing**.

Core transformation:

**Raw agent traces → normalized sessions → suspicious behaviors → evidence-backed failures → recurring failure clusters → prioritized engineering issues**

The MVP must prove one essential capability:

> Given a large batch of AI-agent sessions, automatically identify hidden failures, group related incidents, and show what engineers should fix first with clear evidence.

## Product Thesis

Traditional monitoring is optimized for crashes, errors, latency, and availability. Hidden Failures Intelligence targets **semantic and behavioral correctness**:

- wrong tool selected;
- wrong tool parameters;
- agent claims success after tool failure;
- duplicate action / replay;
- unnecessary retry loops;
- partial task completion;
- mismatch between user intent, agent action, and actual outcome.

The product is not another generic LLM dashboard. It is a **failure-discovery and issue-intelligence layer**.

## MVP Technology

Recommended hackathon stack:

- Frontend: **Next.js App Router** for a polished jury-facing dashboard.
- AI / analytics API: **FastAPI + Python**.
- Database: **PostgreSQL through Supabase**.
- Validation: **Pydantic** on the backend and **Zod** on the frontend.
- Embeddings: provider API or `sentence-transformers`.
- Clustering: **HDBSCAN** with a simple agglomerative/cosine fallback.
- LLM judge: provider-agnostic adapter for OpenAI / Anthropic / Gemini or another available model.
- Packaging: Docker / Docker Compose if time permits.

If the team has less than 24 hours or only one developer, the Next.js UI may be replaced by Streamlit without changing the analysis architecture.

## Documentation Order

Read in this order:

1. `01_APP_SPECIFICATION.md` — product behavior, personas, scope and acceptance criteria.
2. `02_SUPABASE_DATABASE.md` — canonical data model and relationships.
3. `03_NEXTJS_ARCHITECTURE.md` — frontend/backend implementation structure.
4. `04_WORKFLOWS_AND_DIAGRAMS.md` — analysis lifecycle and diagrams.
5. `05_RLS_AND_PERMISSIONS.md` — access model and production hardening.
6. `06_ROADMAP_AND_FUTURE.md` — hackathon scope and product evolution.
7. `07_PRODUCT_BACKLOG.md` — implementation-ready backlog.
8. `08_OPENAPI.md` — API contract between UI and analysis service.
9. `09_AI_PROMPTS.md` — judge, cluster labeling and AI operating rules.
10. `12-UI-UX-DESIGN-SYSTEM.md` — jury-ready product experience.
11. `DOCS-MANIFEST.md` — ownership map for the documentation.

## Canonical MVP Demo Domain

Use a **customer-support / e-commerce agent** with structured tools:

- `get_order`
- `refund_order`
- `change_address`
- `cancel_order`

The reference dataset should contain correct sessions plus controlled hidden failures such as:

- wrong refund amount;
- false success after a failed tool call;
- duplicate refund;
- wrong tool selection;
- repeated tool loop.

## Important Implementation Rules

1. **Do not send every raw conversation blindly to an expensive LLM.** Use deterministic detection first, then semantic judging only where needed.
2. **Do not cluster entire conversations as the primary representation.** Cluster normalized `FailureEvent` objects and their fingerprints.
3. **Do not claim root cause as fact unless directly supported.** The MVP may output a *likely contributing factor* or *hypothesis*.
4. **Do not hide evidence behind a single score.** Every cluster must expose representative traces and evidence.
5. **Do not pre-label every cluster.** The discovery demo is stronger when labels are generated after clustering.
6. **Do not build enterprise infrastructure before the core loop works.** No Kafka, Kubernetes, SSO, or multi-region architecture in the hackathon P0.

## Core Success Questions

The MVP is successful if the jury can answer “yes” to all four questions:

1. Can it find hidden failures in a large set of sessions?
2. Can it group related failures into recurring patterns?
3. Can it show clear evidence for each pattern?
4. Can it tell an engineer what deserves attention first?
