# Undercover Deployment Guide

Use this free demo stack:

- **Vercel** for the Next.js frontend in `apps/web`.
- **Render Free Web Service** for the FastAPI backend in `apps/api`.
- **Supabase Free** for Postgres and storage.

Vercel does not run this FastAPI app. The frontend must call a separate backend URL.

## 1. Supabase

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/migrations/001_init.sql`.
3. Create a private storage bucket named `trace-imports`.
4. Copy these values from Project Settings:
   - Project URL
   - Publishable key, usually `sb_publishable_...`
   - Service-role key

Never put the service-role key in Vercel or any `NEXT_PUBLIC_*` variable.

## 2. Backend on Render

The repo already has `render.yaml`, so the easiest path is Render Dashboard -> New -> Blueprint -> select this repo.

If creating the service manually:

| Setting | Value |
|---|---|
| Root Directory | `apps/api` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/health` |
| Plan | `Free` |

Render environment variables:

| Key | Value |
|---|---|
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key |
| `SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `JUDGE_MODEL` | `configured-model` |
| `FRONTEND_URL` | your Vercel URL, for example `https://undercover.vercel.app` |

After deploy, verify:

```text
https://<render-service>.onrender.com/health
```

Expected response:

```json
{"status":"ok","database":"not-configured","version":"0.1.0"}
```

## 3. Frontend on Vercel

Import the same GitHub repo in Vercel.

| Setting | Value |
|---|---|
| Framework Preset | `Next.js` |
| Root Directory | `apps/web` |
| Build Command | `npm run build` |

Vercel environment variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `NEXT_PUBLIC_API_URL` | `https://<render-service>.onrender.com/api/v1` |

`NEXT_PUBLIC_API_URL` must include `/api/v1`. The Slice 3 issue page calls URLs like:

```text
${NEXT_PUBLIC_API_URL}/clusters/{clusterId}
```

Redeploy Vercel after changing any `NEXT_PUBLIC_*` variable because Vercel bakes them into the frontend build.

## 4. Connect the Links

After both services are deployed:

1. Copy the Vercel URL.
2. Set Render `FRONTEND_URL` to that exact origin, with no trailing slash.
3. Redeploy the Render service.
4. Set Vercel `NEXT_PUBLIC_API_URL` to the Render API base with `/api/v1`.
5. Redeploy Vercel.

Test the backend cluster endpoint:

```text
https://<render-service>.onrender.com/api/v1/analysis-runs/00000000-0000-4000-8000-000000000003/clusters
```

Copy one returned cluster `id`, then open the frontend issue page:

```text
https://<vercel-app>.vercel.app/issues/<cluster-id>
```

If that page shows the cluster title, priority badge, score bars, and representative evidence, the frontend-backend link is working.

## 5. Local Check

Backend:

```bash
pip install -r apps/api/requirements.txt
npm run dev:api
```

Frontend:

```bash
npm install
npm run dev:web
```

Use `apps/web/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Use `apps/api/.env`:

```bash
SUPABASE_URL=<supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_ANON_KEY=<publishable-key>
JUDGE_MODEL=configured-model
FRONTEND_URL=http://localhost:3000
```

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| Frontend page shows fallback demo data | Check `NEXT_PUBLIC_API_URL` includes `/api/v1`, then redeploy Vercel. |
| Browser CORS error | Set Render `FRONTEND_URL` to the exact Vercel origin, then redeploy Render. |
| Render first request is slow | Free service is waking up. Open `/health` 1-2 minutes before demo. |
| Vercel build fails | Confirm Root Directory is `apps/web`. |
| Render build fails | Confirm Root Directory is `apps/api`. |
| Supabase auth redirect fails | Add the Vercel URL in Supabase Auth Redirect URLs. |

## 7. Demo Checklist

- [ ] Render `/health` returns `ok`.
- [ ] Render cluster list endpoint returns five demo clusters.
- [ ] Vercel landing page loads.
- [ ] `/issues/<cluster-id>` loads real API data.
- [ ] No service-role key exists in Vercel env vars or frontend files.
