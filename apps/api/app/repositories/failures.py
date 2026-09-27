"""FailureRepository — the only place Slice 2 touches Supabase for failures (doc/03 §7).

Reads/writes `failure_events` + `failure_evidence`. Degrades gracefully to empty reads
and no-op writes when Supabase is not configured, so the API and the session page work
in local dev without a database.
"""

from __future__ import annotations

from typing import Any

from app.core.supabase import get_client
from app.models.failures import BuiltFailure, FailureEventOut, FailureEvidenceOut


class FailureRepository:
    def __init__(self, client: Any | None = None) -> None:
        self._client = client if client is not None else get_client()

    @property
    def available(self) -> bool:
        return self._client is not None

    # --- reads ----------------------------------------------------------

    def list_by_session(self, session_id: str) -> list[FailureEventOut]:
        """Failures for one session (GET /sessions/{id}/failures, doc/08)."""
        if not self._client:
            return []
        try:
            fe = (
                self._client.table("failure_events")
                .select("*")
                .eq("session_id", session_id)
                .execute()
            )
            rows = fe.data or []
            out: list[FailureEventOut] = []
            for row in rows:
                evidence = self._evidence_for(row["id"])
                out.append(self._to_out(row, evidence))
            return out
        except Exception:  # noqa: BLE001 — read failures should not 500 the page
            return []

    def _evidence_for(self, failure_event_id: str) -> list[FailureEvidenceOut]:
        try:
            ev = (
                self._client.table("failure_evidence")
                .select("label,event_id,evidence_tier")
                .eq("failure_event_id", failure_event_id)
                .execute()
            )
            return [
                FailureEvidenceOut(
                    label=r.get("label", ""),
                    event_id=r.get("event_id"),
                    evidence_tier=r.get("evidence_tier", 4),
                )
                for r in (ev.data or [])
            ]
        except Exception:  # noqa: BLE001
            return []

    @staticmethod
    def _to_out(row: dict[str, Any], evidence: list[FailureEvidenceOut]) -> FailureEventOut:
        tier = row.get("evidence_tier", 4)
        return FailureEventOut(
            id=str(row["id"]),
            failure_type=row["failure_type"],
            tool_name=row.get("tool_name"),
            parameter_name=row.get("parameter_name"),
            expected_value=row.get("expected_value"),
            observed_value=row.get("observed_value"),
            confidence=float(row.get("confidence", 0.0)),
            evidence_tier=tier,
            semantic_summary=row.get("semantic_summary"),
            is_hypothesis=tier >= 4,
            evidence=evidence,
        )

    # --- writes ---------------------------------------------------------

    def persist(self, analysis_run_id: str, failures: list[BuiltFailure]) -> list[str]:
        """Insert failure events + their evidence. Returns new failure-event ids.

        No-op (returns []) when Supabase is unconfigured.
        """
        if not self._client or not failures:
            return []
        ids: list[str] = []
        for failure in failures:
            inserted = (
                self._client.table("failure_events")
                .insert(failure.to_event_row(analysis_run_id))
                .execute()
            )
            fid = str(inserted.data[0]["id"])
            ids.append(fid)
            rows = failure.to_evidence_rows(fid)
            if rows:
                self._client.table("failure_evidence").insert(rows).execute()
        return ids
