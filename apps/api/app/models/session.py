"""Normalized session/event models — the canonical timeline the detectors read.

Shape mirrors `session_events` (doc/02 §5) and the normalization contract (doc/01 §6).
Slice 1's ingestion produces these rows in Supabase; Slice 2 reads them. The
`from_raw_session` / `from_events` constructors let detectors run against the
`data/demo/demo.jsonl` fixture (or hand-built fixtures in tests) with no DB.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Canonical event types (matches the DB check constraint in 001_init.sql)."""

    USER_MESSAGE = "USER_MESSAGE"
    ASSISTANT_MESSAGE = "ASSISTANT_MESSAGE"
    TOOL_CALL = "TOOL_CALL"
    TOOL_RESULT = "TOOL_RESULT"
    ASSISTANT_FINAL = "ASSISTANT_FINAL"


# Tool-result statuses that deterministically indicate a failed action (doc/01 §8).
ERROR_STATUSES = {"error", "failed", "failure", "rejected", "denied"}


class NormalizedEvent(BaseModel):
    """One event on the canonical timeline.

    `payload` holds structured tool arguments (for TOOL_CALL) or the structured
    result (for TOOL_RESULT). `status` carries the tool-result status when present.
    """

    id: str
    session_id: str | None = None
    sequence_no: int
    event_type: EventType
    tool_name: str | None = None
    content: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    status: str | None = None
    occurred_at: str | None = None

    # --- convenience -----------------------------------------------------

    @property
    def is_tool_error(self) -> bool:
        return (
            self.event_type == EventType.TOOL_RESULT
            and self.status is not None
            and self.status.strip().lower() in ERROR_STATUSES
        )

    def tool_args(self) -> dict[str, Any]:
        """Structured arguments of a TOOL_CALL (empty for non-calls)."""
        if self.event_type != EventType.TOOL_CALL:
            return {}
        # Accept either payload == args, or payload["arguments"]/["args"].
        for key in ("arguments", "args"):
            if isinstance(self.payload.get(key), dict):
                return self.payload[key]
        return self.payload


class NormalizedSession(BaseModel):
    """A normalized session: ordered events plus session-level metadata."""

    session_id: str
    external_session_id: str | None = None
    agent_version: str | None = None
    model_name: str | None = None
    events: list[NormalizedEvent] = Field(default_factory=list)

    # --- typed views over the timeline ----------------------------------

    def ordered(self) -> list[NormalizedEvent]:
        return sorted(self.events, key=lambda e: e.sequence_no)

    def by_type(self, event_type: EventType) -> list[NormalizedEvent]:
        return [e for e in self.ordered() if e.event_type == event_type]

    def tool_calls(self) -> list[NormalizedEvent]:
        return self.by_type(EventType.TOOL_CALL)

    def tool_results(self) -> list[NormalizedEvent]:
        return self.by_type(EventType.TOOL_RESULT)

    def user_messages(self) -> list[NormalizedEvent]:
        return self.by_type(EventType.USER_MESSAGE)

    def final_event(self) -> NormalizedEvent | None:
        finals = self.by_type(EventType.ASSISTANT_FINAL)
        return finals[-1] if finals else None

    # --- constructors for fixtures / stubbing ---------------------------

    @classmethod
    def from_events(
        cls, session_id: str, raw_events: list[dict[str, Any]], **meta: Any
    ) -> "NormalizedSession":
        """Build from a list of already-normalized event dicts (used in tests)."""
        events: list[NormalizedEvent] = []
        for i, ev in enumerate(raw_events, start=1):
            data = {"sequence_no": i, "session_id": session_id, **ev}
            data.setdefault("id", f"{session_id}-e{i}")
            events.append(NormalizedEvent(**data))
        return cls(session_id=session_id, events=events, **meta)

    @classmethod
    def from_raw_session(cls, raw: dict[str, Any]) -> "NormalizedSession":
        """Best-effort mapping of the demo.jsonl raw shape (doc/01 §5) to a
        normalized session, for stubbing before Slice 1's ingestion lands.

        Real normalization is Slice 1's job; this only supports local rule work.
        Raw shape: {session_id, messages[], tool_calls[], final_answer, metadata}.
        """
        sid = str(raw.get("session_id") or raw.get("external_session_id") or "unknown")
        seq = 0
        events: list[NormalizedEvent] = []

        def add(**kw: Any) -> None:
            nonlocal seq
            seq += 1
            events.append(
                NormalizedEvent(id=f"{sid}-e{seq}", session_id=sid, sequence_no=seq, **kw)
            )

        for msg in raw.get("messages", []) or []:
            role = str(msg.get("role", "")).lower()
            etype = EventType.USER_MESSAGE if role == "user" else EventType.ASSISTANT_MESSAGE
            add(event_type=etype, content=msg.get("content"))

        for call in raw.get("tool_calls", []) or []:
            # Match Slice 1's ingestion mapping so this stub agrees with the real
            # pipeline: tool_name|name, and status pulled from a nested result dict.
            name = call.get("tool_name") or call.get("name") or call.get("tool")
            args = call.get("arguments") or call.get("args") or {}
            add(event_type=EventType.TOOL_CALL, tool_name=name, payload={"arguments": args})
            result = call.get("result")
            if result is not None or call.get("status") is not None:
                status = result.get("status") if isinstance(result, dict) else call.get("status")
                add(
                    event_type=EventType.TOOL_RESULT,
                    tool_name=name,
                    payload={"result": result if result is not None else {}},
                    status=status,
                )

        if raw.get("final_answer") is not None:
            add(event_type=EventType.ASSISTANT_FINAL, content=raw.get("final_answer"))

        meta = raw.get("metadata", {}) or {}
        return cls(
            session_id=sid,
            external_session_id=sid,
            agent_version=meta.get("agent_version"),
            model_name=meta.get("model_name") or meta.get("model"),
            events=events,
        )
