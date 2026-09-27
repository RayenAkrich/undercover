# Undercover — Free Deployment Guide ($0 Stack)

Deploy the whole project for free: **Vercel (frontend) + Render (backend) + Supabase (database)**.
Vercel cannot host the FastAPI backend (serverless-only); Render hosts it as a persistent web service.

## 0. Prerequisites (all must be set)

- [ ] Repo pushed to GitHub.
- [ ] `supabase/migrations/001_init.sql` applied in Supabase SQL Editor.
- [ ] Private `trace-imports` storage bucket created in Supabase.
- [ ] You have: Supabase project URL, publishable key (`sb_publishable_…`), service-role key.
- [ ] Supabase Auth → URL Configuration: add your Vercel URL to **Redirect URLs** once known.

## 1. Backend — Render (free web service)

**Option A — Blueprint (recommended):** `render.yaml` at repo root already defines everything.
Render Dashboard → New → Blueprint → select your repo → set the `sync: false` env vars below → Deploy.

**Option B — Manual:** New → Web Service → select repo, then:

| Setting | Value |
|---|---|
| Root Directory | `apps/api` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Plan | `Free` |
| Health Check Path | `/health` |

Env vars on Render (all server-only, never `NEXT_PUBLIC_`):

| Key | Value |
|---|---|
| `SUPABASE_URL` | `https://hvsyjpysehysiifqkzjt.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role key (Dashboard → Settings → API Keys → Reveal) |
| `SUPABASE_ANON_KEY` | publishable key (unused today, reserved for P1 auth) |
| `JUDGE_MODEL` | `configured-model` (used by E3 judge) |
| `FRONTEND_URL` | your Vercel URL (Part 3) — required for CORS |

Verify: open `https://<your-service>.onrender.com/health` → `{"status":"ok",…}`.

## 2. Frontend — Vercel Hobby ($0)

Vercel Dashboard → Add New → Project → Import your repo, then:

| Setting | Value |
|---|---|
| Framework Preset | `Next.js` (auto-detected) |
| Root Directory | `apps/web` |
| Build Command | `npm run build` (default) |

Env vars on Vercel (all public by design):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hvsyjpysehysiifqkzjt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
| `NEXT_PUBLIC_API_URL` | `https://<your-service>.onrender.com` (root for now; `/api/v1` once Slice 1 builds the versioned router) |

Deploy. You get `https://<project>.vercel.app`.

## 3. Wire them together (must do after both deploy)

1. Copy the Vercel URL → paste into Render env var `FRONTEND_URL` → Render redeploys (enables CORS in `apps/api/app/main.py`).
2. Add the Vercel URL to Supabase → Auth → URL Configuration → Redirect URLs.
3. Redeploy Vercel once (so `NEXT_PUBLIC_API_URL` bakes into the build).

## 4. Free-tier limits you must know

| Service | Limit | Impact |
|---|---|---|
| Render Free | Sleeps after 15 min idle; 750 hrs/mo; 512 MB RAM | First request after idle takes ~30–60 s to wake. Warm it before the jury demo. |
| Vercel Hobby | 100 deploys/day; usage caps, no overages | Plenty for a demo. |
| Supabase Free | Project pauses after 7 days idle | Click Resume in dashboard; data is kept. |

Demo tip: open the Render `/health` URL 2 minutes before presenting, or add a free UptimeRobot ping every 5 min during demo days.

## 5. Troubleshooting

| Symptom | Cause → Fix |
|---|---|
| Browser `CORS error` calling API | `FRONTEND_URL` on Render missing/wrong → set exact Vercel URL, redeploy backend. |
| API `502` on first hit | Free service waking → wait 60 s, retry. |
| Frontend shows old API URL | `NEXT_PUBLIC_*` bakes at build time → change var, then Redeploy in Vercel. |
| Vercel build fails | Root Directory must be `apps/web`, not repo root. |
| Render build fails | Root Directory must be `apps/api`; check `requirements.txt` path. |
| Supabase Auth redirect fails | Vercel URL missing from Auth → Redirect URLs. |

## 6. Go-live checklist

- [ ] `/health` on Render returns ok.
- [ ] Landing page loads on Vercel URL with 3D hero animating.
- [ ] `/inbox` loads (placeholder until Slice 4 builds it).
- [ ] No `service-role` / `sb_secret` key anywhere in the frontend bundle or repo (`git status` shows no `.env*` files).
- [ ] Wake-up request sent 2 min before demo.
