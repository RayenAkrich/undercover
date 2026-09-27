"""Agent-as-Judge DTO (Slice 2, Step 3 — doc/03 §10, doc/01 §9, doc/09 §1).

Provider-neutral: the rest of the product consumes `JudgeDecision`, never a vendor
response (doc/03 §10). Persisted to `judge_outputs` (doc/02 §8).
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class DeviationType(str, Enum):
    """Allowed deviation values for P0 (doc/09 §1)."""

    WRONG_PARAMETER = "WRONG_PARAMETER"
    FALSE_SUCCESS = "FALSE_SUCCESS"
    DUPLICATE_ACTION = "DUPLICATE_ACTION"
    WRONG_TOOL = "WRONG_TOOL"
    LOOP_RETRY = "LOOP_RETRY"
    OTHER = "OTHER"
    NONE = "NONE"


class JudgeDecision(BaseModel):
    """Structured judge output (doc/03 §10). Validated by Pydantic (US-E12-003)."""

    intent: dict[str, Any] = Field(default_factory=dict)
    expected_action: dict[str, Any] | None = None
    observed_action: dict[str, Any] | None = None
    observed_outcome: dict[str, Any] | None = None
    is_failure: bool = False
    deviation_type: DeviationType | None = None
    reason: str = ""
    confidence: float = 0.0  # 0..1

    # Provenance (not part of the model's own reasoning; filled by the adapter).
    source: str = "JUDGE"  # JUDGE | HEURISTIC
    model_name: str = ""
    prompt_version: str = ""

    def to_row(self, analysis_run_id: str, session_id: str, input_hash: str) -> dict[str, Any]:
        """Shape for insertion into `judge_outputs` (doc/02 §8)."""
        return {
            "analysis_run_id": analysis_run_id,
            "session_id": session_id,
            "prompt_version": self.prompt_version,
            "model_name": self.model_name,
            "input_hash": input_hash,
            "intent": self.intent,
            "expected_action": self.expected_action,
            "observed_action": self.observed_action,
            "observed_outcome": self.observed_outcome,
            "is_failure": self.is_failure,
            "deviation_type": self.deviation_type.value if self.deviation_type else None,
            "reason": self.reason,
            "confidence": self.confidence,
        }
