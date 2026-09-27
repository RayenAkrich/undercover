"""Undercover API — FastAPI entrypoint. See doc/03_NEXTJS_ARCHITECTURE.md §6."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.datasets import router as datasets_router
from app.api.sessions import router as sessions_router
from app.api import failures
from app.api.clusters import router as clusters_router
from app.api.runs import router as runs_router
from app.core.supabase import ping

app = FastAPI(title="Undercover API", version="0.1.0")

# CORS origins for the deployed/local frontend (doc/10_DEPLOYMENT.md).
# Comma-separated list, e.g. FRONTEND_URL=https://undercover.vercel.app,http://localhost:3000
frontend_urls = [
    u.strip()
    for u in os.getenv("FRONTEND_URL", "http://localhost:3000").split(",")
    if u.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers. Slices 1-3 mount under /api/v1; slice 4's runs router carries its own
# /analysis-runs prefix (see NOTE in the merge summary about aligning the API base).
app.include_router(datasets_router)  # /api/v1/datasets
app.include_router(sessions_router)  # /api/v1/sessions
app.include_router(failures.router, prefix="/api/v1")  # Slice 2 failures
app.include_router(clusters_router, prefix="/api/v1")  # Slice 3 clusters
app.include_router(runs_router)  # Slice 4 /analysis-runs


@app.get("/health")
def health():
    try:
        ping()
        database = "ok"
    except Exception:
        database = "degraded"
    return {"status": "ok", "database": database, "version": "0.1.0"}
