# Supabase — Undercover

- Canonical schema: `migrations/001_init.sql` (from `doc/02_SUPABASE_DATABASE.md`).
- Storage bucket (create in dashboard / CLI, private): `trace-imports` for original JSON/JSONL + exported reports.
- P0 demo mode: single workspace, no RLS login; FastAPI backend is the trusted writer with `service-role` key server-side only.
- Browser must never receive `service-role` or provider keys (see `doc/05_RLS_AND_PERMISSIONS.md` §4).
- Production evolution: add `workspace_id` + `workspace_members` RLS per `doc/05_RLS_AND_PERMISSIONS.md` §10.
- pgvector optional: if disabled, embeddings stay in Python memory during a run (§11).
