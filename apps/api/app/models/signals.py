"""Detection-signal model — the output of the deterministic detectors (Slice 2, Step 2).

Maps onto the `detection_signals` table (doc/02 §7). Signals are low-level evidence,
not final failures: the FailureEvent builder (Step 4) merges signals + judge output
into canonical `failure_events`.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class SignalSource(str, Enum):
    RULE = "RULE"
    STATISTICAL = "STATISTICAL"
    JUDGE = "JUDGE"


class SignalType(str, Enum):
    """Deterministic signal types emitted by rules.py (doc/02 §7 examples)."""

    TOOL_ERROR = "TOOL_ERROR"
    DUPLICATE_ACTION = "DUPLICATE_ACTION"
    LOOP_RETRY = "LOOP_RETRY"
    PARAMETER_MISMATCH = "PARAMETER_MISMATCH"
    SUCCESS_CLAIM_AFTER_ERROR = "SUCCESS_CLAIM_AFTER_ERROR"


class DetectionSignal(BaseModel):
    """One deterministic finding for one session.

    `requires_judge` marks a candidate whose adjudication needs semantic reasoning
    (the success-claim candidate) — it must never be auto-confirmed as a failure
    (doc/01 §8, doc/09 §7).
    """

    session_id: str
    signal_type: SignalType
    source: SignalSource = SignalSource.RULE
    severity_hint: int | None = None  # 0..100 rough hint, not the final score
    confidence: float = 0.0  # 0..1; deterministic facts are high-confidence
    details: dict[str, Any] = Field(default_factory=dict)
    evidence_event_ids: list[str] = Field(default_factory=list)
    requires_judge: bool = False

    def to_row(self, analysis_run_id: str) -> dict[str, Any]:
        """Shape for insertion into `detection_signals` (repository layer, Step 4)."""
        return {
            "analysis_run_id": analysis_run_id,
            "session_id": self.session_id,
            "signal_type": self.signal_type.value,
            "source": self.source.value,
            "severity_hint": self.severity_hint,
            "confidence": self.confidence,
            "details": self.details,
            "evidence_event_ids": self.evidence_event_ids,
        }
