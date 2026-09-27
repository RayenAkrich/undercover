"""Supabase server client (service-role). Server-only — doc/05 §4.

Merged contract across slices:
- `get_client()` returns a client when configured, else None, so repositories degrade
  gracefully (empty reads / no-op writes) in local dev without Supabase (Slice 2).
- `ping()` is the lightweight DB check used by /health; it raises on any failure (Slice 4).

Keys come from the environment (apps/api/.env in local dev; hosts like Render/Vercel
inject env directly). They are never logged and never leave the backend.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any

try:
    from dotenv import load_dotenv

    # apps/api/.env — parents[2] == apps/api from app/core/supabase.py.
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except Exception:  # noqa: BLE001 — dotenv optional; env may already be injected
    pass


def _placeholder(key: str) -> bool:
    return (not key) or ("PASTE_" in key) or key.startswith("your-")


@lru_cache(maxsize=1)
def get_client() -> Any | None:
    """Service-role client, or None when unconfigured/unavailable (graceful degrade)."""
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or _placeholder(key):
        return None
    try:
        from supabase import create_client

        return create_client(url, key)
    except Exception:  # noqa: BLE001 — missing package or bad creds -> degrade
        return None


def ping() -> None:
    """Lightweight DB check for /health. Raises when Supabase is not reachable."""
    client = get_client()
    if client is None:
        raise RuntimeError("Supabase server credentials missing — check apps/api/.env")
    client.table("datasets").select("id").limit(1).execute()
