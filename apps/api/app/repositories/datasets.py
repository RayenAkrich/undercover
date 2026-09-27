"""Supabase access for datasets."""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Any

from supabase import Client, create_client


@lru_cache(maxsize=1)
def supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
    return create_client(url, key)


class DatasetRepository:
    def __init__(self, client: Client | None = None) -> None:
        self.client = client or supabase_client()

    async def create(self, dataset: dict[str, Any]) -> dict[str, Any]:
        return self.client.table("datasets").insert(dataset).execute().data[0]

    async def list(self) -> list[dict[str, Any]]:
        return (
            self.client.table("datasets")
            .select("id,name,session_count,created_at")
            .order("created_at", desc=True)
            .execute()
            .data
        )

    async def get(self, dataset_id: str) -> dict[str, Any] | None:
        data = self.client.table("datasets").select("*").eq("id", dataset_id).limit(1).execute().data
        return data[0] if data else None
