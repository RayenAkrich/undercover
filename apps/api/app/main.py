"""Undercover API — FastAPI entrypoint. See doc/03_NEXTJS_ARCHITECTURE.md §6."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.datasets import router as datasets_router
from app.api.sessions import router as sessions_router
from app.api import failures
from app.api.clusters import router as clusters_router

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

# Routers (all under the /api/v1 base — doc/08).
# Slice 1: datasets + sessions routers carry their own /api/v1/... prefix.
app.include_router(datasets_router)
app.include_router(sessions_router)
# Slice 2 (Deliverable 3): failures endpoints.
app.include_router(failures.router, prefix="/api/v1")
# Slice 3: clusters endpoints.
app.include_router(clusters_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "database": "not-configured", "version": "0.1.0"}
