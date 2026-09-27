"""Synthetic Slice 3 demo events."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

RUN_ID = "00000000-0000-4000-8000-000000000003"

PATTERNS = [
    ("DUPLICATE_ACTION", "refund", "refund_order", "payment", 92, "Refund executed twice after timeout"),
    ("WRONG_PARAMETER", "refund", "refund_order", "financial", 88, "Refund amount differs from requested amount"),
    ("FALSE_SUCCESS", "subscription", "cancel_subscription", "trust", 86, "Agent claimed success after tool error"),
    ("WRONG_TOOL", "shipping", "cancel_order", "destructive", 74, "Address change request routed to cancellation"),
    ("LOOP_RETRY", "knowledge_search", "search_kb", "latency", 56, "Repeated empty search without progress"),
]


def synthetic_failure_events(groups: int = 5, rows: int = 8) -> list[dict[str, Any]]:
    base = datetime(2026, 9, 27, 10, 0, tzinfo=timezone.utc)
    events: list[dict[str, Any]] = []
    for group_index, (failure_type, workflow, tool, impact, severity, summary) in enumerate(PATTERNS[:groups]):
        for row in range(rows):
            happened = base + timedelta(minutes=group_index * 20 + row)
            events.append(
                {
                    "id": f"00000000-0000-4000-8{group_index:03d}-{row:012d}",
                    "analysis_run_id": RUN_ID,
                    "session_id": f"session-{group_index + 1}-{row + 1}",
                    "failure_type": failure_type,
                    "workflow": workflow,
                    "tool_name": tool,
                    "parameter_name": "amount" if failure_type == "WRONG_PARAMETER" else None,
                    "expected_value": 10 if failure_type == "WRONG_PARAMETER" else None,
                    "observed_value": 100 if failure_type == "WRONG_PARAMETER" else None,
                    "impact_category": impact,
                    "severity_score": severity - (row % 3),
                    "confidence": 0.94 - row * 0.005,
                    "semantic_summary": f"{summary} in {workflow} session {row + 1}",
                    "agent_version": f"v{3 + row % 2}",
                    "created_at": happened.isoformat(),
                    "evidence_refs": [f"event-{group_index}-{row}-tool"],
                }
            )
    events.append(
        {
            "id": "00000000-0000-4000-8999-000000000001",
            "analysis_run_id": RUN_ID,
            "session_id": "session-noise-1",
            "failure_type": "OTHER",
            "workflow": "billing",
            "tool_name": "create_coupon",
            "impact_category": "unknown",
            "severity_score": 20,
            "confidence": 0.45,
            "semantic_summary": "One-off coupon formatting mismatch",
            "agent_version": "v3",
            "created_at": (base + timedelta(hours=3)).isoformat(),
            "evidence_refs": ["event-noise-tool"],
        }
    )
    return events
