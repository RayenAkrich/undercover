"""FailureEvent builder tests (Slice 2, Step 6).

Covers the acceptance cases from team/slice-2-detection.md:
- conflict: recorded tool fact beats the judge's contradicting claim (US-E4-003);
- evidence-tier priority: the failure reports its strongest (lowest) tier.
Plus the FALSE_SUCCESS cascade (judge must confirm).
"""

from app.detectors.rules import run_rules
from app.judge.provider import JudgeConfig, judge_session
from app.judge.context import build_compact_context
from app.models.judge import DeviationType, JudgeDecision
from app.models.session import EventType, NormalizedSession
from app.services.failures import build_failures


def _session(events: list[dict]) -> NormalizedSession:
    return NormalizedSession.from_events("sf", events)


def _wrong_param_session() -> NormalizedSession:
    return _session(
        [
            {"event_type": EventType.USER_MESSAGE, "content": "Refund $10 for ord_1"},
            {"event_type": EventType.TOOL_CALL, "tool_name": "refund_order", "payload": {"arguments": {"order_id": "ord_1", "amount": 100}}},
            {"event_type": EventType.TOOL_RESULT, "tool_name": "refund_order", "status": "success", "payload": {"result": {}}},
        ]
    )


def test_tool_fact_beats_judge_claim():
    s = _wrong_param_session()
    signals = run_rules(s)
    # Judge (wrongly) claims observed amount was 50; deterministic fact is 100.
    lying_judge = JudgeDecision(
        is_failure=True,
        deviation_type=DeviationType.WRONG_PARAMETER,
        observed_action={"amount": 50},
        reason="model says 50",
        confidence=0.9,
    )
    failures = build_failures(s, signals, lying_judge)
    wrong_param = [f for f in failures if f.failure_type == "WRONG_PARAMETER"]
    assert len(wrong_param) == 1
    # Deterministic fact wins.
    assert wrong_param[0].expected_value == 10.0
    assert wrong_param[0].observed_value == 100.0


def test_evidence_tier_is_strongest_available():
    s = _wrong_param_session()
    signals = run_rules(s)
    failures = build_failures(s, signals)
    f = [f for f in failures if f.failure_type == "WRONG_PARAMETER"][0]
    # Evidence = USER_INTENT (tier 3) + TOOL_ARGUMENT (tier 2) -> strongest is 2.
    assert f.evidence_tier == 2
    assert min(e.evidence_tier for e in f.evidence) == 2


def test_false_success_requires_judge_confirmation():
    s = _session(
        [
            {"event_type": EventType.USER_MESSAGE, "content": "Cancel order ord_1"},
            {"event_type": EventType.TOOL_CALL, "tool_name": "cancel_order", "payload": {"arguments": {"order_id": "ord_1"}}},
            {"event_type": EventType.TOOL_RESULT, "tool_name": "cancel_order", "status": "error", "payload": {"result": {}}},
            {"event_type": EventType.ASSISTANT_FINAL, "content": "Cancelled successfully!"},
        ]
    )
    signals = run_rules(s)

    # Without a judge -> no FALSE_SUCCESS failure (never auto-confirmed).
    assert not any(f.failure_type == "FALSE_SUCCESS" for f in build_failures(s, signals, None))

    # With the heuristic judge confirming -> FALSE_SUCCESS is produced.
    judge = judge_session(build_compact_context(s), signals, JudgeConfig(api_key=None))
    failures = build_failures(s, signals, judge)
    fs = [f for f in failures if f.failure_type == "FALSE_SUCCESS"]
    assert len(fs) == 1
    assert fs[0].confidence == judge.confidence


def test_duplicate_action_evidence_and_summary():
    s = _session(
        [
            {"event_type": EventType.USER_MESSAGE, "content": "Refund ord_1"},
            {"event_type": EventType.TOOL_CALL, "tool_name": "refund_order", "payload": {"arguments": {"order_id": "ord_1", "amount": 50}}},
            {"event_type": EventType.TOOL_RESULT, "tool_name": "refund_order", "status": "success", "payload": {"result": {}}},
            {"event_type": EventType.TOOL_CALL, "tool_name": "refund_order", "payload": {"arguments": {"order_id": "ord_1", "amount": 50}}},
            {"event_type": EventType.TOOL_RESULT, "tool_name": "refund_order", "status": "success", "payload": {"result": {}}},
        ]
    )
    failures = build_failures(s, run_rules(s))
    dup = [f for f in failures if f.failure_type == "DUPLICATE_ACTION"][0]
    assert dup.impact_category == "financial"
    assert len(dup.evidence) == 2  # both calls are evidence
    out = dup.to_out("fail-x")
    assert out.evidence[0].event_id is not None
