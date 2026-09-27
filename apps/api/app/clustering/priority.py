"""Priority scoring for failure clusters."""

from __future__ import annotations

from typing import Any

IMPACT_BY_FAILURE_TYPE = {
    "DUPLICATE_ACTION": 90,
    "WRONG_PARAMETER": 80,
    "FALSE_SUCCESS": 85,
    "WRONG_TOOL": 70,
    "LOOP_RETRY": 50,
}


def priority_label(score: int) -> str:
    if score >= 80:
        return "P0"
    if score >= 60:
        return "P1"
    if score >= 40:
        return "P2"
    return "P3"


def score_cluster(events: list[dict[str, Any]], max_count: int) -> dict[str, int | str]:
    count = len(events)
    sessions = {event.get("session_id") for event in events}
    failure_types = [str(event.get("failure_type", "")) for event in events]

    impact = max(IMPACT_BY_FAILURE_TYPE.get(item, 40) for item in failure_types)
    frequency = round((count / max(max_count, 1)) * 100)
    severity = round(
        sum(int(event.get("severity_score", 0)) for event in events) / max(count, 1)
    )
    reach = round((len(sessions) / max(max_count, 1)) * 100)
    confidence = round(
        sum(float(event.get("confidence", 0)) for event in events) / max(count, 1) * 100
    )
    score = round(
        0.30 * impact
        + 0.25 * frequency
        + 0.20 * severity
        + 0.15 * reach
        + 0.10 * confidence
    )
    return {
        "impact_score": impact,
        "frequency_score": frequency,
        "severity_score": severity,
        "reach_score": reach,
        "confidence_score": confidence,
        "priority_score": score,
        "priority_label": priority_label(score),
    }
