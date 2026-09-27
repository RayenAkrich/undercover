"""FailureEvent builder (Slice 2, Step 4 — doc/01 §10-11, doc/04 §7).

Merges deterministic signals with the (optional) judge decision into canonical
`BuiltFailure` objects with evidence.

Golden rule (US-E4-003): recorded tool facts override LLM claims. Expected/observed
values for WRONG_PARAMETER come from the deterministic signal, never the judge — even
when the judge reports a different value.

Cascade (doc/09 §7): a SUCCESS_CLAIM candidate only becomes a FALSE_SUCCESS failure
when the judge confirms it. It is never auto-confirmed from the rule alone.
"""

from __future__ import annotations

from app.models.failures import (
    EVIDENCE_TIER_BY_TYPE,
    BuiltEvidence,
    BuiltFailure,
    EvidenceType,
)
from app.models.judge import DeviationType, JudgeDecision
from app.models.session import NormalizedEvent, NormalizedSession
from app.models.signals import DetectionSignal, SignalType

WORKFLOW_BY_TOOL = {
    "refund_order": "refund",
    "cancel_order": "cancel",
    "change_address": "address_change",
    "get_order": "lookup",
}

_FINANCIAL_TOOLS = {"refund_order"}
_FINANCIAL_PARAMS = {"amount", "value", "total", "price"}

_SEVERITY_BY_TYPE = {
    "WRONG_PARAMETER": 85,
    "DUPLICATE_ACTION": 90,
    "FALSE_SUCCESS": 80,
    "LOOP_RETRY": 40,
    "WRONG_TOOL": 80,
}


def _workflow(tool: str | None) -> str | None:
    return WORKFLOW_BY_TOOL.get(tool or "")


def _impact(tool: str | None, parameter: str | None) -> str:
    if (tool in _FINANCIAL_TOOLS) or (parameter in _FINANCIAL_PARAMS):
        return "financial"
    return "operational"


def _evidence(event_id: str | None, etype: EvidenceType, label: str, excerpt: str | None = None) -> BuiltEvidence:
    return BuiltEvidence(
        event_id=event_id,
        evidence_type=etype,
        evidence_tier=EVIDENCE_TIER_BY_TYPE[etype],
        label=label,
        excerpt=excerpt,
    )


def _finalize(failure: BuiltFailure) -> BuiltFailure:
    """Set the failure's headline tier to the strongest (lowest) evidence tier."""
    if failure.evidence:
        failure.evidence_tier = min(ev.evidence_tier for ev in failure.evidence)
    failure.is_hypothesis = failure.evidence_tier >= 4
    return failure


def build_failures(
    session: NormalizedSession,
    signals: list[DetectionSignal],
    judge: JudgeDecision | None = None,
) -> list[BuiltFailure]:
    events: dict[str, NormalizedEvent] = {e.id: e for e in session.events}
    out: list[BuiltFailure] = []

    for sig in signals:
        if sig.signal_type == SignalType.PARAMETER_MISMATCH:
            out.append(_finalize(_wrong_parameter(session, sig, events)))
        elif sig.signal_type == SignalType.DUPLICATE_ACTION:
            out.append(_finalize(_duplicate_action(session, sig, events)))
        elif sig.signal_type == SignalType.LOOP_RETRY:
            out.append(_finalize(_loop_retry(session, sig, events)))
        elif sig.signal_type == SignalType.SUCCESS_CLAIM_AFTER_ERROR:
            fail = _false_success(session, sig, events, judge)
            if fail is not None:
                out.append(_finalize(fail))
        # TOOL_ERROR alone is not promoted to a standalone FailureEvent — it only
        # matters as the deterministic backing for a FALSE_SUCCESS candidate.

    return out


# --- per-family builders ----------------------------------------------------


def _wrong_parameter(
    session: NormalizedSession, sig: DetectionSignal, events: dict[str, NormalizedEvent]
) -> BuiltFailure:
    d = sig.details
    tool = d.get("tool_name")
    parameter = d.get("parameter_name")
    # Deterministic facts win (US-E4-003): expected/observed come from the signal.
    expected = d.get("expected")
    observed = d.get("observed")

    evidence: list[BuiltEvidence] = []
    ids = sig.evidence_event_ids
    if ids:
        evidence.append(_evidence(ids[0], EvidenceType.USER_INTENT, f"User requested {parameter}={expected}"))
    if len(ids) > 1:
        evidence.append(_evidence(ids[1], EvidenceType.TOOL_ARGUMENT, f"Executed {parameter}={observed}"))

    return BuiltFailure(
        session_id=session.session_id,
        failure_type="WRONG_PARAMETER",
        workflow=_workflow(tool),
        tool_name=tool,
        parameter_name=parameter,
        expected_value=expected,
        observed_value=observed,
        impact_category=_impact(tool, parameter),
        severity_score=_SEVERITY_BY_TYPE["WRONG_PARAMETER"],
        confidence=sig.confidence,
        semantic_summary=(
            f"User requested {parameter}={expected}, but {tool} executed {observed}."
        ),
        evidence=evidence,
    )


def _duplicate_action(
    session: NormalizedSession, sig: DetectionSignal, events: dict[str, NormalizedEvent]
) -> BuiltFailure:
    d = sig.details
    tool = d.get("tool_name")
    occurrences = d.get("occurrences", len(sig.evidence_event_ids))
    evidence = [
        _evidence(eid, EvidenceType.DUPLICATE_EXECUTION, f"{tool} call #{i + 1}")
        for i, eid in enumerate(sig.evidence_event_ids)
    ]
    return BuiltFailure(
        session_id=session.session_id,
        failure_type="DUPLICATE_ACTION",
        workflow=_workflow(tool),
        tool_name=tool,
        impact_category=_impact(tool, None),
        severity_score=_SEVERITY_BY_TYPE["DUPLICATE_ACTION"],
        confidence=sig.confidence,
        semantic_summary=(
            f"{tool} executed {occurrences} times with identical arguments for a single request."
        ),
        evidence=evidence,
    )


def _loop_retry(
    session: NormalizedSession, sig: DetectionSignal, events: dict[str, NormalizedEvent]
) -> BuiltFailure:
    d = sig.details
    tool = d.get("tool_name")
    count = d.get("count", len(sig.evidence_event_ids))
    evidence = [
        _evidence(eid, EvidenceType.LOOP_SEQUENCE, f"{tool} repeated call #{i + 1}")
        for i, eid in enumerate(sig.evidence_event_ids)
    ]
    return BuiltFailure(
        session_id=session.session_id,
        failure_type="LOOP_RETRY",
        workflow=_workflow(tool),
        tool_name=tool,
        impact_category=_impact(tool, None),
        severity_score=_SEVERITY_BY_TYPE["LOOP_RETRY"],
        confidence=sig.confidence,
        semantic_summary=f"{tool} called {count} times without making progress.",
        evidence=evidence,
    )


def _false_success(
    session: NormalizedSession,
    sig: DetectionSignal,
    events: dict[str, NormalizedEvent],
    judge: JudgeDecision | None,
) -> BuiltFailure | None:
    # Cascade: require the judge to confirm (never auto-confirm from the rule).
    if judge is None or not judge.is_failure:
        return None
    if judge.deviation_type not in (DeviationType.FALSE_SUCCESS, DeviationType.OTHER):
        return None

    tool = sig.details.get("failed_tool")
    ids = sig.evidence_event_ids
    evidence: list[BuiltEvidence] = []
    if ids:
        evidence.append(_evidence(ids[0], EvidenceType.TOOL_RESULT, f"{tool} returned an error"))
    if len(ids) > 1:
        evidence.append(_evidence(ids[1], EvidenceType.FINAL_RESPONSE, "Final answer claims success"))
    evidence.append(_evidence(None, EvidenceType.JUDGE, "Judge adjudication"))

    return BuiltFailure(
        session_id=session.session_id,
        failure_type="FALSE_SUCCESS",
        workflow=_workflow(tool),
        tool_name=tool,
        impact_category=_impact(tool, None),
        severity_score=_SEVERITY_BY_TYPE["FALSE_SUCCESS"],
        confidence=judge.confidence,
        semantic_summary=judge.reason
        or f"{tool} failed, but the final answer claims success.",
        evidence=evidence,
    )
