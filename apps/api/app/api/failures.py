"""Failures API (Slice 2, Deliverable 3) — GET /sessions/{sessionId}/failures (doc/08).

Session read endpoints (GET /sessions/{id}, /events) are owned by Slice 1; this module
adds only the failures endpoint to avoid touching Slice 1's api/sessions.py.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.repositories.failures import FailureRepository

router = APIRouter(tags=["failures"])


@router.get("/sessions/{session_id}/failures")
def get_session_failures(session_id: str) -> dict:
    repo = FailureRepository()
    items = repo.list_by_session(session_id)
    return {"items": [item.model_dump() for item in items]}
