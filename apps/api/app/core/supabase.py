"""Supabase server client (service-role). Person 4 owns.

Server-only: keys come from environment, are never logged, and never leave the backend.
Loads apps/api/.env in local dev (Render/Vercel-style hosts inject env directly).
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

# Local dev loads apps/api/.env (hosts like Render inject env directly).
load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")


def get_client() -> Client:
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key or "PASTE_" in key or key.startswith("your-"):
        raise RuntimeError("Supabase server credentials missing — check apps/api/.env")
    return create_client(url, key)


def ping() -> None:
    """Lightweight DB check for /health. Raises on any failure."""
    get_client().table("datasets").select("id").limit(1).execute()
