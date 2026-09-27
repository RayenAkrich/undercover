"""Compact judge context (doc/03 §9) + secret redaction (US-E4-004 lite, doc/05 §8).

Sends ONLY what the judge needs — user request, relevant assistant turns, the tool
call(s)/result(s), and the final answer — never full transcripts. All text is redacted
for obvious secrets before it leaves the process.
"""

from __future__ import annotations

import hashlib
import json
import re

from pydantic import BaseModel

from app.models.session import EventType, NormalizedSession
from app.detectors.rules import _canonical_args  # canonical arg serialization

# --- redaction --------------------------------------------------------------

_SECRET_PATTERNS = (
    re.compile(r"\bsk-[A-Za-z0-9_\-]{8,}\b"),
    re.compile(r"\bBearer\s+[A-Za-z0-9._\-]{8,}\b", re.IGNORECASE),
    re.compile(r"\b[A-Za-z0-9_\-]{0,10}(?:api[_-]?key|token)[\"':=\s]+[A-Za-z0-9._\-]{8,}\b", re.IGNORECASE),
)


def redact(text: str | None) -> str:
    if not text:
        return ""
    out = text
    for pat in _SECRET_PATTERNS:
        out = pat.sub("[REDACTED]", out)
    return out


class CompactContext(BaseModel):
    session_id: str
    user_request: str
    assistant_context: str
    tool_trace: str
    final_answer: str

    def input_hash(self, prompt_version: str, model_name: str) -> str:
        """Stable hash for judge_outputs uniqueness / future caching (doc/02 §8)."""
        blob = json.dumps(
            {
                "v": prompt_version,
                "m": model_name,
                "u": self.user_request,
                "a": self.assistant_context,
                "t": self.tool_trace,
                "f": self.final_answer,
            },
            sort_keys=True,
        )
        return hashlib.sha256(blob.encode("utf-8")).hexdigest()


def build_compact_context(session: NormalizedSession) -> CompactContext:
    """Assemble the minimal context for one candidate session (doc/03 §9)."""
    users = session.user_messages()
    user_request = redact(" ".join((e.content or "") for e in users).strip())

    assistants = [
        e
        for e in session.by_type(EventType.ASSISTANT_MESSAGE)
    ]
    assistant_context = redact(
        "\n".join((e.content or "") for e in assistants).strip()
    )

    # Interleave tool calls with their results in sequence order.
    lines: list[str] = []
    for ev in session.ordered():
        if ev.event_type == EventType.TOOL_CALL:
            lines.append(f"CALL {ev.tool_name}({_canonical_args(ev.tool_args())})")
        elif ev.event_type == EventType.TOOL_RESULT:
            status = ev.status or "unknown"
            payload = redact(_canonical_args(ev.payload))
            lines.append(f"RESULT {ev.tool_name} status={status} {payload}")
    tool_trace = redact("\n".join(lines))

    final = session.final_event()
    final_answer = redact(final.content if final else "")

    return CompactContext(
        session_id=session.session_id,
        user_request=user_request,
        assistant_context=assistant_context,
        tool_trace=tool_trace,
        final_answer=final_answer,
    )
