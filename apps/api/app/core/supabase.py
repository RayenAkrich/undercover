"""Supabase client accessor.

Returns a service-role client when configured, else None so repositories degrade
gracefully (empty reads / no-op writes) in local dev without Supabase. Import is lazy
so the API runs even if the supabase package is not installed.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from app.core.config import settings


@lru_cache(maxsize=1)
def get_client() -> Any | None:
    if not settings.supabase_configured:
        return None
    try:
        from supabase import create_client

        return create_client(settings.supabase_url, settings.supabase_service_role_key)
    except Exception:  # noqa: BLE001 — missing package or bad creds -> degrade
        return None
