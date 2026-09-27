"""Session read endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.repositories.sessions import SessionRepository


router = APIRouter(prefix="/api/v1/sessions", tags=["sessions"])


def repo() -> SessionRepository:
    try:
        return SessionRepository()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/{session_id}")
async def get_session(session_id: str):
    session = await repo().get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/{session_id}/events")
async def get_session_events(session_id: str):
    return {"items": await repo().events(session_id)}
