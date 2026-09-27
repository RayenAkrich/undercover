"""Failure fingerprints for clustering."""

from __future__ import annotations

from hashlib import sha1
from typing import Any


def _text(value: Any) -> str:
    return str(value or "").strip().lower()


def make_fingerprint(event: dict[str, Any]) -> dict[str, str]:
    fingerprint = {
        "workflow": _text(event.get("workflow") or "unknown"),
        "failure_type": _text(event.get("failure_type")),
        "tool": _text(event.get("tool_name") or event.get("tool")),
        "parameter": _text(event.get("parameter_name") or event.get("parameter")),
        "outcome_category": _text(event.get("impact_category") or event.get("outcome_category")),
        "agent_version": _text(event.get("agent_version")),
    }
    fingerprint["fingerprint_hash"] = sha1(
        "|".join(fingerprint.values()).encode("utf-8")
    ).hexdigest()
    return fingerprint


def semantic_summary(event: dict[str, Any]) -> str:
    if event.get("semantic_summary"):
        return str(event["semantic_summary"])

    failure_type = str(event.get("failure_type", "Failure")).replace("_", " ").lower()
    workflow = event.get("workflow") or "workflow"
    tool = event.get("tool_name") or event.get("tool") or "tool"
    parameter = event.get("parameter_name") or event.get("parameter")
    expected = event.get("expected_value") or event.get("expected")
    observed = event.get("observed_value") or event.get("observed")

    detail = ""
    if parameter or expected is not None or observed is not None:
        detail = f" on {parameter or 'value'} expected {expected} observed {observed}"
    return f"{failure_type} in {workflow} via {tool}{detail}"
