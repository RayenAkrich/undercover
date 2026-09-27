# Hidden Failures Intelligence — Documentation Manifest

This folder contains the AI-ready product and technical specification for the **Hidden Failures Intelligence MVP**.

| File | Responsibility |
|---|---|
| `00_README.md` | Project entry point, thesis, stack and implementation rules |
| `01_APP_SPECIFICATION.md` | Product scope, core loop, failure model and acceptance criteria |
| `02_SUPABASE_DATABASE.md` | Canonical database/data model |
| `03_NEXTJS_ARCHITECTURE.md` | Next.js frontend + FastAPI analysis architecture |
| `04_WORKFLOWS_AND_DIAGRAMS.md` | Analysis, clustering, evidence and demo workflows |
| `05_RLS_AND_PERMISSIONS.md` | Data safety, authorization and AI trust boundaries |
| `06_ROADMAP_AND_FUTURE.md` | Hackathon, startup MVP and longer-term roadmap |
| `07_PRODUCT_BACKLOG.md` | Implementation-ready epics/user stories |
| `08_OPENAPI.md` | HTTP contract between dashboard and analysis service |
| `09_AI_PROMPTS.md` | Judge/labeling prompts and AI operating rules |
| `10_DEPLOYMENT.md` | Free deploy setup (Vercel + Render + Supabase), env vars and go-live checklist |
| `12-UI-UX-DESIGN-SYSTEM.md` | Jury-ready UI/UX specification |

## Canonical Ownership

- Product behavior: `01_APP_SPECIFICATION.md`
- Data model: `02_SUPABASE_DATABASE.md`
- Runtime/component boundaries: `03_NEXTJS_ARCHITECTURE.md`
- Lifecycle/workflows: `04_WORKFLOWS_AND_DIAGRAMS.md`
- Security/privacy/trust boundaries: `05_RLS_AND_PERMISSIONS.md`
- Scope beyond P0: `06_ROADMAP_AND_FUTURE.md`
- Implementation order and acceptance criteria: `07_PRODUCT_BACKLOG.md`
- API shape: `08_OPENAPI.md`
- LLM behavior: `09_AI_PROMPTS.md`
- UI behavior: `12-UI-UX-DESIGN-SYSTEM.md`

## Conflict Resolution

If two documents disagree:

1. security/data-trust rules in `05_RLS_AND_PERMISSIONS.md` win for safety;
2. product behavior in `01_APP_SPECIFICATION.md` wins for scope;
3. `08_OPENAPI.md` is canonical for HTTP shape;
4. `02_SUPABASE_DATABASE.md` is canonical for persistence;
5. backlog items must be updated when canonical specs change.

## MVP North Star

The complete documentation should preserve one simple product story:

> Turn thousands of AI-agent traces into a small, prioritized list of recurring behavioral failures backed by evidence.
