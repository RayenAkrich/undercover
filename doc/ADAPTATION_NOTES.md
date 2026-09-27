# Adaptation Notes

The original ZIP contained templates for a SecuriNets R&D/CyberCom application. They have been repurposed for the Hidden Failures Intelligence MVP while preserving the same documentation roles and filenames.

Key adaptation decisions:

- product focus changed to behavioral failure discovery for AI agents;
- Next.js is kept for a polished jury dashboard;
- Supabase/PostgreSQL is kept for persistence;
- FastAPI/Python is added as the AI/analytics service;
- RLS is documented as production-ready evolution; hackathon P0 may run in single-workspace demo mode;
- the backlog is reduced to the core discovery/evidence loop;
- OpenAPI now describes datasets, analysis runs, clusters, sessions and benchmark endpoints;
- AI prompts are rewritten for Agent-as-Judge, cluster labeling and safe trace handling;
- UI/UX is optimized around an Issue Inbox rather than a generic dashboard.
