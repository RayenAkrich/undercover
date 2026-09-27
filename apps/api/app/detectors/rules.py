"""Deterministic detection rules (Slice 2, Step 2 — doc/01 §7-8, doc/04 §4).

Pure functions, no DB and no network. Each `detect_*` takes a NormalizedSession
(+ config) and returns a list of DetectionSignal (empty when the family does not
fire — a session can legitimately produce several signals, doc/04 §4).

Rules run over ALL sessions; only candidates go to the judge (doc/09 §7 cascade).
`run_rules_safe` guarantees one malformed session never crashes the whole run
(US-E12-004).

Deterministic confidence is high by design; the success-claim candidate is the one
family that must NOT be auto-confirmed — it is flagged `requires_judge` (doc/01 §8).
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Any

from app.models.session import EventType, NormalizedEvent, NormalizedSession
from app.models.signals import DetectionSignal, SignalSource, SignalType


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------


@dataclass
class DetectorConfig:
    """Tunable thresholds; sourced from analysis-run `config` (doc/08 POST /analysis-runs)."""

    loop_threshold: int = 4
    # Non-idempotent tools — repeats here are dangerous. Read-only tools like
    # `get_order` are excluded so repeated lookups are never flagged (US-E2-002).
    non_idempotent_tools: frozenset[str] = frozenset(
        {"refund_order", "cancel_order", "change_address"}
    )
    success_words: tuple[str, ...] = (
        "completed",
        "complete",
        "done",
        "success",
        "successfully",
        "issued",
        "processed",
        "confirmed",
        "refunded",
        "cancelled",
        "canceled",
        "updated",
    )
    # Parameter names the mismatch rule knows how to compare (kept narrow).
    amount_arg_names: tuple[str, ...] = ("amount", "value", "total", "price")
    order_id_arg_names: tuple[str, ...] = ("order_id", "order", "order_number", "id")


DEFAULT_CONFIG = DetectorConfig()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _canonical_args(args: dict[str, Any]) -> str:
    """Stable serialization of tool args for 'materially identical' comparison."""
    try:
        return json.dumps(args, sort_keys=True, default=str)
    except TypeError:
        return str(sorted(args.items()))


def _first_arg(args: dict[str, Any], names: tuple[str, ...]) -> tuple[str | None, Any]:
    for name in names:
        if name in args:
            return name, args[name]
    return None, None


_AMOUNT_PATTERNS = (
    re.compile(r"\$\s*(\d+(?:\.\d{1,2})?)"),
    re.compile(r"(\d+(?:\.\d{1,2})?)\s*(?:dollars|usd|bucks)\b", re.IGNORECASE),
    re.compile(
        r"(?:refund|charge|pay|amount|for|of)\s+\$?\s*(\d+(?:\.\d{1,2})?)",
        re.IGNORECASE,
    ),
)
# Order IDs must contain a digit so the English word "order" is never matched as an
# ID (that produced mass false positives against real args like "ORD-1005").
_ORDER_ID_PATTERNS = (
    re.compile(r"\b(ord[_-]?\d[a-z0-9_-]*)\b", re.IGNORECASE),
    re.compile(r"\border\s+#?\s*([a-z]{0,4}[_-]?\d[a-z0-9_-]*)\b", re.IGNORECASE),
)


def _extract_amount(text: str) -> float | None:
    for pat in _AMOUNT_PATTERNS:
        m = pat.search(text)
        if m:
            try:
                return float(m.group(1))
            except ValueError:
                continue
    return None


def _extract_order_id(text: str) -> str | None:
    for pat in _ORDER_ID_PATTERNS:
        m = pat.search(text)
        if m:
            return m.group(1)
    return None


def _to_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


# ---------------------------------------------------------------------------
# Rule 1 — TOOL_ERROR (US-E2-001)
# ---------------------------------------------------------------------------


def detect_tool_error(
    session: NormalizedSession, config: DetectorConfig = DEFAULT_CONFIG
) -> list[DetectionSignal]:
    """Any TOOL_RESULT with an error/failed/rejected status (doc/01 §8)."""
    signals: list[DetectionSignal] = []
    for result in session.tool_results():
        if result.is_tool_error:
            signals.append(
                DetectionSignal(
                    session_id=session.session_id,
                    signal_type=SignalType.TOOL_ERROR,
                    source=SignalSource.RULE,
                    severity_hint=60,
                    confidence=1.0,
                    details={
                        "tool_name": result.tool_name,
                        "status": result.status,
                    },
                    evidence_event_ids=[result.id],
                )
            )
    return signals


# ---------------------------------------------------------------------------
# Rule 2 — DUPLICATE_ACTION (US-E2-002)
# ---------------------------------------------------------------------------


def detect_duplicate_action(
    session: NormalizedSession, config: DetectorConfig = DEFAULT_CONFIG
) -> list[DetectionSignal]:
    """Same non-idempotent tool + materially identical args called >1 time.

    Read-only tools (e.g. `get_order`) are never flagged (US-E2-002).
    Evidence includes ALL matching tool-call events.
    """
    groups: dict[tuple[str, str], list[NormalizedEvent]] = {}
    for call in session.tool_calls():
        tool = call.tool_name or ""
        if tool not in config.non_idempotent_tools:
            continue
        key = (tool, _canonical_args(call.tool_args()))
        groups.setdefault(key, []).append(call)

    signals: list[DetectionSignal] = []
    for (tool, args_key), calls in groups.items():
        if len(calls) < 2:
            continue
        signals.append(
            DetectionSignal(
                session_id=session.session_id,
                signal_type=SignalType.DUPLICATE_ACTION,
                source=SignalSource.RULE,
                severity_hint=90,
                confidence=0.95,
                details={
                    "tool_name": tool,
                    "occurrences": len(calls),
                    "arguments": calls[0].tool_args(),
                },
                evidence_event_ids=[c.id for c in calls],
            )
        )
    return signals


# ---------------------------------------------------------------------------
# Rule 3 — LOOP_RETRY (US-E2-003)
# ---------------------------------------------------------------------------


def detect_loop_retry(
    session: NormalizedSession, config: DetectorConfig = DEFAULT_CONFIG
) -> list[DetectionSignal]:
    """Same tool called >= threshold times (default 4) without progress.

    'Without progress' is approximated deterministically: the repeated calls
    produced no successful/among-varying results (all errors, empty, or identical
    result payloads). Threshold is configurable via run config.
    """
    calls_by_tool: dict[str, list[NormalizedEvent]] = {}
    for call in session.tool_calls():
        calls_by_tool.setdefault(call.tool_name or "", []).append(call)

    # Index results per tool to assess progress.
    results_by_tool: dict[str, list[NormalizedEvent]] = {}
    for result in session.tool_results():
        results_by_tool.setdefault(result.tool_name or "", []).append(result)

    signals: list[DetectionSignal] = []
    for tool, calls in calls_by_tool.items():
        if len(calls) < config.loop_threshold:
            continue
        results = results_by_tool.get(tool, [])
        distinct_results = {
            _canonical_args(r.payload) for r in results if not r.is_tool_error
        }
        no_progress = len(distinct_results) <= 1  # <=1 distinct successful outcome
        if not no_progress:
            continue
        signals.append(
            DetectionSignal(
                session_id=session.session_id,
                signal_type=SignalType.LOOP_RETRY,
                source=SignalSource.RULE,
                severity_hint=40,
                confidence=0.9,
                details={
                    "tool_name": tool,
                    "count": len(calls),
                    "threshold": config.loop_threshold,
                    "distinct_successful_results": len(distinct_results),
                },
                evidence_event_ids=[c.id for c in calls],
            )
        )
    return signals


# ---------------------------------------------------------------------------
# Rule 4 — PARAMETER_MISMATCH (US-E2-004)
# ---------------------------------------------------------------------------


def detect_parameter_mismatch(
    session: NormalizedSession, config: DetectorConfig = DEFAULT_CONFIG
) -> list[DetectionSignal]:
    """Compare an expected value extracted from the user message with tool args.

    Deliberately narrow: amounts and order IDs only, and only when a value is
    directly extractable (doc/01 §8). Emits at most one signal per tool call that
    mismatches an extracted expectation.
    """
    user_text = " ".join(
        (e.content or "") for e in session.user_messages()
    ).strip()
    if not user_text:
        return []

    expected_amount = _extract_amount(user_text)
    expected_order = _extract_order_id(user_text)
    if expected_amount is None and expected_order is None:
        return []

    signals: list[DetectionSignal] = []
    user_event = session.user_messages()[0]

    for call in session.tool_calls():
        args = call.tool_args()

        # Amount mismatch.
        if expected_amount is not None:
            arg_name, observed = _first_arg(args, config.amount_arg_names)
            observed_amount = _to_float(observed)
            if (
                arg_name is not None
                and observed_amount is not None
                and abs(observed_amount - expected_amount) > 0.001
            ):
                signals.append(
                    DetectionSignal(
                        session_id=session.session_id,
                        signal_type=SignalType.PARAMETER_MISMATCH,
                        source=SignalSource.RULE,
                        severity_hint=85,
                        confidence=0.9,
                        details={
                            "tool_name": call.tool_name,
                            "parameter_name": arg_name,
                            "expected": expected_amount,
                            "observed": observed_amount,
                        },
                        evidence_event_ids=[user_event.id, call.id],
                    )
                )
                continue  # one mismatch signal per call is enough

        # Order-ID mismatch.
        if expected_order is not None:
            arg_name, observed = _first_arg(args, config.order_id_arg_names)
            if (
                arg_name is not None
                and observed is not None
                and str(observed).lower() != expected_order.lower()
            ):
                signals.append(
                    DetectionSignal(
                        session_id=session.session_id,
                        signal_type=SignalType.PARAMETER_MISMATCH,
                        source=SignalSource.RULE,
                        severity_hint=80,
                        confidence=0.85,
                        details={
                            "tool_name": call.tool_name,
                            "parameter_name": arg_name,
                            "expected": expected_order,
                            "observed": observed,
                        },
                        evidence_event_ids=[user_event.id, call.id],
                    )
                )
    return signals


# ---------------------------------------------------------------------------
# Rule 5 — SUCCESS_CLAIM candidate (US-E2-005) -> requires judge
# ---------------------------------------------------------------------------


def detect_success_claim_candidate(
    session: NormalizedSession, config: DetectorConfig = DEFAULT_CONFIG
) -> list[DetectionSignal]:
    """A tool failed AND the final answer claims success -> candidate for the judge.

    This is NEVER auto-confirmed as a failure (doc/01 §8, doc/09 §7): it is flagged
    `requires_judge` with modest confidence for the semantic cascade.
    """
    errored = [r for r in session.tool_results() if r.is_tool_error]
    if not errored:
        return []

    final = session.final_event()
    final_text = (final.content or "").lower() if final else ""
    if not final_text:
        return []

    matched = [w for w in config.success_words if w in final_text]
    if not matched:
        return []

    evidence = [errored[0].id]
    if final is not None:
        evidence.append(final.id)

    return [
        DetectionSignal(
            session_id=session.session_id,
            signal_type=SignalType.SUCCESS_CLAIM_AFTER_ERROR,
            source=SignalSource.RULE,
            severity_hint=80,
            confidence=0.5,  # candidate only — judge decides
            details={
                "failed_tool": errored[0].tool_name,
                "failed_status": errored[0].status,
                "success_words": matched,
            },
            evidence_event_ids=evidence,
            requires_judge=True,
        )
    ]


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------


ALL_RULES = (
    detect_tool_error,
    detect_duplicate_action,
    detect_loop_retry,
    detect_parameter_mismatch,
    detect_success_claim_candidate,
)


def run_rules(
    session: NormalizedSession, config: DetectorConfig = DEFAULT_CONFIG
) -> list[DetectionSignal]:
    """Run every rule over one session and return the combined signals."""
    signals: list[DetectionSignal] = []
    for rule in ALL_RULES:
        signals.extend(rule(session, config))
    return signals


def run_rules_safe(
    session: NormalizedSession, config: DetectorConfig = DEFAULT_CONFIG
) -> tuple[list[DetectionSignal], str | None]:
    """Resilient wrapper: one bad session never crashes the run (US-E12-004).

    Returns (signals, error_message). On failure signals is empty and the error
    string can be recorded against the session without aborting the analysis run.
    """
    try:
        return run_rules(session, config), None
    except Exception as exc:  # noqa: BLE001 — deliberate catch-all for run resilience
        return [], f"{type(exc).__name__}: {exc}"


def requires_judge(signals: list[DetectionSignal]) -> bool:
    """True when at least one signal needs semantic adjudication (Step 3 cascade)."""
    return any(s.requires_judge for s in signals)
