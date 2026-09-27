"""Supabase access for sessions and normalized events."""

from __future__ import annotations

from typing import Any

from supabase import Client

from app.repositories.datasets import supabase_client


class SessionRepository:
    def __init__(self, client: Client | None = None) -> None:
        self.client = client or supabase_client()

    async def create_with_events(self, dataset_id: str, session: dict[str, Any], events: list[dict[str, Any]]) -> dict[str, Any]:
        row = dict(session, dataset_id=dataset_id)
        created = self.client.table("sessions").insert(row).execute().data[0]
        event_rows = [dict(event, session_id=created["id"]) for event in events]
        if event_rows:
            self.client.table("session_events").insert(event_rows).execute()
        return created

    async def get(self, session_id: str) -> dict[str, Any] | None:
        data = self.client.table("sessions").select("*").eq("id", session_id).limit(1).execute().data
        return data[0] if data else None

    async def events(self, session_id: str) -> list[dict[str, Any]]:
        return (
            self.client.table("session_events")
            .select("*")
            .eq("session_id", session_id)
            .order("sequence_no")
            .execute()
            .data
        )
