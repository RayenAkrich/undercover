"""Deterministic detector tests (Slice 2, Step 6).

Covers the acceptance cases from team/slice-2-detection.md:
- duplicate refund flagged;
- repeated read-only get_order NOT flagged;
- loop of 4 flagged;
plus tool-error, parameter-mismatch, success-claim, and run resilience.
"""

from app.detectors.rules import (
    DetectorConfig,
    detect_duplicate_action,
    detect_loop_retry,
    detect_parameter_mismatch,
    detect_success_claim_candidate,
    detect_tool_error,
    requires_judge,
    run_rules,
    run_rules_safe,
)
from app.models.session import EventType, NormalizedSession
from app.models.signals import SignalType


def _session(session_id: str, events: list[dict]) -> NormalizedSession:
    return NormalizedSession.from_events(session_id, events)


def _call(tool: str, args: dict) -> dict:
    return {"event_type": EventType.TOOL_CALL, "tool_name": tool, "payload": {"arguments": args}}


def _result(tool: str, status: str = "success", result: dict | None = None) -> dict:
    return {
        "event_type": EventType.TOOL_RESULT,
        "tool_name": tool,
        "status": status,
        "payload": {"result": result or {}},
    }


def _user(text: str) -> dict:
    return {"event_type": EventType.USER_MESSAGE, "content": text}


def _final(text: str) -> dict:
    return {"event_type": EventType.ASSISTANT_FINAL, "content": text}


# --- DUPLICATE_ACTION ------------------------------------------------------


def test_duplicate_refund_flagged():
    s = _session(
        "s1",
        [
            _user("Please refund order ord_1"),
            _call("refund_order", {"order_id": "ord_1", "amount": 50}),
            _result("refund_order"),
            _call("refund_order", {"order_id": "ord_1", "amount": 50}),
            _result("refund_order"),
        ],
    )
    signals = detect_duplicate_action(s)
    assert len(signals) == 1
    assert signals[0].signal_type == SignalType.DUPLICATE_ACTION
    assert signals[0].details["occurrences"] == 2
    # Evidence points at BOTH call events.
    assert len(signals[0].evidence_event_ids) == 2


def test_repeated_get_order_not_flagged():
    s = _session(
        "s2",
        [
            _user("Where is my order?"),
            _call("get_order", {"order_id": "ord_9"}),
            _result("get_order"),
            _call("get_order", {"order_id": "ord_9"}),
            _result("get_order"),
            _call("get_order", {"order_id": "ord_9"}),
            _result("get_order"),
        ],
    )
    assert detect_duplicate_action(s) == []


def test_duplicate_ignores_differing_args():
    s = _session(
        "s3",
        [
            _call("refund_order", {"order_id": "ord_1", "amount": 50}),
            _call("refund_order", {"order_id": "ord_2", "amount": 25}),
        ],
    )
    assert detect_duplicate_action(s) == []


# --- LOOP_RETRY ------------------------------------------------------------


def test_loop_of_four_flagged():
    events = [_user("look it up")]
    for _ in range(4):
        events.append(_call("search_kb", {"q": "vip"}))
        events.append(_result("search_kb", status="success", result={"hits": 0}))
    s = _session("s4", events)
    signals = detect_loop_retry(s)
    assert len(signals) == 1
    assert signals[0].signal_type == SignalType.LOOP_RETRY
    assert signals[0].details["count"] == 4


def test_loop_below_threshold_not_flagged():
    events = []
    for _ in range(3):
        events.append(_call("search_kb", {"q": "vip"}))
        events.append(_result("search_kb", result={"hits": 0}))
    assert detect_loop_retry(_session("s5", events)) == []


def test_loop_with_progress_not_flagged():
    # Same tool 4x but each returns a distinct successful result -> progress.
    events = []
    for i in range(4):
        events.append(_call("search_kb", {"q": f"page{i}"}))
        events.append(_result("search_kb", result={"page": i}))
    assert detect_loop_retry(_session("s6", events)) == []


def test_loop_threshold_configurable():
    events = []
    for _ in range(3):
        events.append(_call("search_kb", {"q": "vip"}))
        events.append(_result("search_kb", result={"hits": 0}))
    signals = detect_loop_retry(_session("s7", events), DetectorConfig(loop_threshold=3))
    assert len(signals) == 1


# --- TOOL_ERROR ------------------------------------------------------------


def test_tool_error_flagged():
    s = _session(
        "s8",
        [
            _call("refund_order", {"amount": 10}),
            _result("refund_order", status="error"),
        ],
    )
    signals = detect_tool_error(s)
    assert len(signals) == 1
    assert signals[0].signal_type == SignalType.TOOL_ERROR
    assert signals[0].confidence == 1.0


# --- PARAMETER_MISMATCH ----------------------------------------------------


def test_parameter_mismatch_amount():
    s = _session(
        "s9",
        [
            _user("Can you refund $10 for the delayed order?"),
            _call("refund_order", {"order_id": "ord_1", "amount": 100}),
            _result("refund_order"),
        ],
    )
    signals = detect_parameter_mismatch(s)
    assert len(signals) == 1
    assert signals[0].signal_type == SignalType.PARAMETER_MISMATCH
    assert signals[0].details["expected"] == 10.0
    assert signals[0].details["observed"] == 100.0
    assert signals[0].details["parameter_name"] == "amount"


def test_parameter_match_no_signal():
    s = _session(
        "s10",
        [
            _user("Refund $10 please"),
            _call("refund_order", {"amount": 10}),
        ],
    )
    assert detect_parameter_mismatch(s) == []


# --- SUCCESS_CLAIM candidate ----------------------------------------------


def test_success_claim_candidate_requires_judge():
    s = _session(
        "s11",
        [
            _user("Cancel my subscription"),
            _call("cancel_order", {"order_id": "ord_1"}),
            _result("cancel_order", status="error"),
            _final("Your subscription has been cancelled successfully!"),
        ],
    )
    signals = detect_success_claim_candidate(s)
    assert len(signals) == 1
    assert signals[0].signal_type == SignalType.SUCCESS_CLAIM_AFTER_ERROR
    assert signals[0].requires_judge is True
    assert requires_judge(signals) is True


def test_no_success_claim_when_tool_succeeded():
    s = _session(
        "s12",
        [
            _call("cancel_order", {"order_id": "ord_1"}),
            _result("cancel_order", status="success"),
            _final("Done! Your order is cancelled."),
        ],
    )
    assert detect_success_claim_candidate(s) == []


# --- orchestration / resilience -------------------------------------------


def test_run_rules_combines_families():
    s = _session(
        "s13",
        [
            _user("Refund $10 for ord_1"),
            _call("refund_order", {"order_id": "ord_1", "amount": 100}),
            _result("refund_order", status="error"),
            _call("refund_order", {"order_id": "ord_1", "amount": 100}),
            _result("refund_order", status="error"),
            _final("All done, your refund was processed successfully."),
        ],
    )
    types = {s.signal_type for s in run_rules(s)}
    assert SignalType.TOOL_ERROR in types
    assert SignalType.DUPLICATE_ACTION in types
    assert SignalType.PARAMETER_MISMATCH in types
    assert SignalType.SUCCESS_CLAIM_AFTER_ERROR in types


def test_run_rules_safe_never_raises():
    # Construct a session then corrupt it so a rule would throw internally.
    s = _session("s14", [_call("refund_order", {"amount": 1})])
    s.events[0].event_type = "NOT_A_REAL_TYPE"  # type: ignore[assignment]
    signals, error = run_rules_safe(s)
    # Either it degrades gracefully (no crash) — signals may be empty, error set or None.
    assert isinstance(signals, list)
