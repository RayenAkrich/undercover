"""Judge tests (Slice 2, Step 3).

No provider key is configured in tests, so judge_session exercises the heuristic
fallback path (the 20-minute rule). Also covers context minimization and redaction.
"""

from app.detectors.rules import run_rules
from app.judge.context import build_compact_context, redact
from app.judge.provider import JudgeConfig, heuristic_decision, judge_session
from app.models.judge import DeviationType
from app.models.session import EventType, NormalizedSession


def _session(events: list[dict]) -> NormalizedSession:
    return NormalizedSession.from_events("sj", events)


def test_redaction_removes_secrets():
    assert "[REDACTED]" in redact("here is sk-ABCD1234efgh5678 do not leak")
    assert "[REDACTED]" in redact("Authorization: Bearer abcdef123456ghijkl")
    assert redact("nothing secret here") == "nothing secret here"


def test_compact_context_excludes_noise_and_keeps_essentials():
    s = _session(
        [
            {"event_type": EventType.USER_MESSAGE, "content": "Refund $10 for ord_1"},
            {"event_type": EventType.ASSISTANT_MESSAGE, "content": "Working on it"},
            {"event_type": EventType.TOOL_CALL, "tool_name": "refund_order", "payload": {"arguments": {"amount": 100}}},
            {"event_type": EventType.TOOL_RESULT, "tool_name": "refund_order", "status": "success", "payload": {"result": {"ok": True}}},
            {"event_type": EventType.ASSISTANT_FINAL, "content": "Done, $10 refunded"},
        ]
    )
    ctx = build_compact_context(s)
    assert "Refund $10" in ctx.user_request
    assert "refund_order" in ctx.tool_trace
    assert "Done" in ctx.final_answer
    # hash is stable and deterministic
    assert ctx.input_hash("judge-v1", "m") == ctx.input_hash("judge-v1", "m")


def test_heuristic_maps_success_claim_to_false_success():
    s = _session(
        [
            {"event_type": EventType.USER_MESSAGE, "content": "Cancel my order ord_1"},
            {"event_type": EventType.TOOL_CALL, "tool_name": "cancel_order", "payload": {"arguments": {"order_id": "ord_1"}}},
            {"event_type": EventType.TOOL_RESULT, "tool_name": "cancel_order", "status": "error", "payload": {"result": {}}},
            {"event_type": EventType.ASSISTANT_FINAL, "content": "Your order was cancelled successfully!"},
        ]
    )
    signals = run_rules(s)
    ctx = build_compact_context(s)
    decision = judge_session(ctx, signals, JudgeConfig(api_key=None))
    assert decision.source == "HEURISTIC"
    assert decision.is_failure is True
    assert decision.deviation_type == DeviationType.FALSE_SUCCESS
    assert "heuristic fallback" in decision.reason
    assert 0.0 <= decision.confidence <= 1.0


def test_heuristic_abstains_without_signals():
    s = _session([{"event_type": EventType.USER_MESSAGE, "content": "hello"}])
    ctx = build_compact_context(s)
    decision = heuristic_decision(ctx, [], JudgeConfig(api_key=None))
    assert decision.is_failure is False
    assert decision.deviation_type == DeviationType.NONE


def test_judge_output_is_schema_valid():
    s = _session(
        [
            {"event_type": EventType.USER_MESSAGE, "content": "Refund $10 for ord_1"},
            {"event_type": EventType.TOOL_CALL, "tool_name": "refund_order", "payload": {"arguments": {"amount": 100}}},
        ]
    )
    signals = run_rules(s)
    decision = judge_session(build_compact_context(s), signals, JudgeConfig(api_key=None))
    # Round-trips through the row shape used for judge_outputs.
    row = decision.to_row("run-1", "sj", "hash-1")
    assert row["is_failure"] in (True, False)
    assert row["prompt_version"] == "judge-v1"
