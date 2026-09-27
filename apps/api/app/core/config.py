"""Runtime settings from environment (server-side only — doc/05 §4)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    supabase_url: str | None = field(default_factory=lambda: os.getenv("SUPABASE_URL"))
    # Service-role key: server-only, never exposed to the browser (doc/05 §4).
    supabase_service_role_key: str | None = field(
        default_factory=lambda: os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )
    judge_model: str = field(default_factory=lambda: os.getenv("JUDGE_MODEL", "configured-model"))
    loop_threshold: int = field(default_factory=lambda: int(os.getenv("LOOP_THRESHOLD", "4")))

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)


settings = Settings()
