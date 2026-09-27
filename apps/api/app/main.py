"""Undercover API — FastAPI entrypoint. See doc/03_NEXTJS_ARCHITECTURE.md §6."""

from fastapi import FastAPI

app = FastAPI(title="Undercover API", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok", "database": "not-configured", "version": "0.1.0"}
