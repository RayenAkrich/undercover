"""Parse, validate, and normalize imported agent sessions."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any


EVENT_TYPES = {
    "user": "USER_MESSAGE",
    "assistant": "ASSISTANT_MESSAGE",
}


@dataclass
class ImportErrorItem:
    line: int | None
    session_id: str | None
    message: str


@dataclass
class ParsedImport:
    source_type: str
    sessions: list[dict[str, Any]]
    rejected: int = 0
    errors: list[ImportErrorItem] = field(default_factory=list)


@dataclass
class NormalizedSession:
    raw: dict[str, Any]
    session: dict[str, Any]
    events: list[dict[str, Any]]


def parse_sessions(content: bytes) -> ParsedImport:
    text = content.decode("utf-8-sig").strip()
    if not text:
        return ParsedImport("JSONL", [], 1, [ImportErrorItem(None, None, "Empty upload.")])

    if text[0] in "[{":
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            return _parse_jsonl(text)
        sessions = data.get("sessions", data) if isinstance(data, dict) else data
        if isinstance(sessions, dict):
            sessions = [sessions]
        if not isinstance(sessions, list):
            return ParsedImport("JSON", [], 1, [ImportErrorItem(None, None, "JSON root must be a session, list, or {sessions: [...]}")])
        return _validate_many(sessions, "JSON")

    return _parse_jsonl(text)


def _parse_jsonl(text: str) -> ParsedImport:
    parsed = ParsedImport("JSONL", [])
    valid: list[dict[str, Any]] = []
    for line_no, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            continue
        try:
            session = json.loads(line)
        except json.JSONDecodeError as exc:
            parsed.rejected += 1
            parsed.errors.append(ImportErrorItem(line_no, None, f"Invalid JSON: {exc.msg}"))
            continue
        ok, message = validate_session(session)
        if ok:
            valid.append(session)
        else:
            parsed.rejected += 1
            parsed.errors.append(ImportErrorItem(line_no, _session_id(session), message))
    parsed.sessions = valid
    return parsed


def _validate_many(sessions: list[Any], source_type: str) -> ParsedImport:
    parsed = ParsedImport(source_type, [])
    for index, session in enumerate(sessions, 1):
        ok, message = validate_session(session)
        if ok:
            parsed.sessions.append(session)
        else:
            parsed.rejected += 1
            parsed.errors.append(ImportErrorItem(index, _session_id(session), message))
    return parsed


def validate_session(session: Any) -> tuple[bool, str]:
    if not isinstance(session, dict):
        return False, "Session must be an object."
    if not session.get("session_id"):
        return False, "session_id is required."
    if not session.get("messages") and not session.get("tool_calls"):
        return False, "messages or tool_calls are required."
    if session.get("messages") is not None and not isinstance(session["messages"], list):
        return False, "messages must be a list."
    if session.get("tool_calls") is not None and not isinstance(session["tool_calls"], list):
        return False, "tool_calls must be a list."
    return True, ""


def normalize_session(raw: dict[str, Any]) -> NormalizedSession:
    metadata = raw.get("metadata") or {}
    timestamp = metadata.get("timestamp")
    sequence_no = 1
    events: list[dict[str, Any]] = []

    def append(event: dict[str, Any]) -> None:
        nonlocal sequence_no
        event.setdefault("occurred_at", timestamp)
        event["sequence_no"] = sequence_no
        sequence_no += 1
        events.append(event)

    for message in raw.get("messages") or []:
        role = str(message.get("role", "")).lower()
        append(
            {
                "event_type": EVENT_TYPES.get(role, "ASSISTANT_MESSAGE"),
                "content": message.get("content"),
                "payload": message,
                "occurred_at": message.get("timestamp") or timestamp,
            }
        )

    for call in raw.get("tool_calls") or []:
        args = call.get("arguments") or call.get("args") or {}
        result = call.get("result")
        tool_name = call.get("tool_name") or call.get("name")
        append(
            {
                "event_type": "TOOL_CALL",
                "tool_name": tool_name,
                "payload": {"id": call.get("id"), "arguments": args},
                "status": call.get("status"),
                "occurred_at": call.get("timestamp") or timestamp,
            }
        )
        if result is not None:
            status = result.get("status") if isinstance(result, dict) else None
            append(
                {
                    "event_type": "TOOL_RESULT",
                    "tool_name": tool_name,
                    "payload": {"call_id": call.get("id"), "result": result},
                    "status": status,
                    "occurred_at": call.get("result_timestamp") or call.get("timestamp") or timestamp,
                }
            )

    if raw.get("final_answer"):
        append(
            {
                "event_type": "ASSISTANT_FINAL",
                "content": raw["final_answer"],
                "payload": {"final_answer": raw["final_answer"]},
            }
        )

    return NormalizedSession(
        raw=raw,
        session={
            "external_session_id": raw["session_id"],
            "agent_version": metadata.get("agent_version"),
            "model_name": metadata.get("model_name"),
            "started_at": timestamp,
            "ended_at": metadata.get("ended_at"),
            "metadata": metadata,
        },
        events=events,
    )


async def import_sessions(content: bytes, name: str, dataset_repo: Any, session_repo: Any) -> dict[str, Any]:
    parsed = parse_sessions(content)
    normalized = [normalize_session(session) for session in parsed.sessions]
    dataset = await dataset_repo.create(
        {
            "name": name or "Imported Dataset",
            "source_type": parsed.source_type,
            "session_count": len(normalized),
            "has_ground_truth": False,
        }
    )
    for item in normalized:
        await session_repo.create_with_events(dataset["id"], item.session, item.events)
    return {
        "id": dataset["id"],
        "name": dataset["name"],
        "source_type": dataset["source_type"],
        "session_count": len(normalized),
        "has_ground_truth": dataset.get("has_ground_truth", False),
        "accepted": len(normalized),
        "rejected": parsed.rejected,
        "rejected_sessions": parsed.rejected,
        "errors": [error.__dict__ for error in parsed.errors],
    }


def _session_id(session: Any) -> str | None:
    return session.get("session_id") if isinstance(session, dict) else None
