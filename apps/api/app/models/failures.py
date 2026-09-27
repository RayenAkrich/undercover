"""FailureEvent + evidence models (Slice 2, Step 4 — doc/01 §10-11, doc/02 §9-10).

`BuiltFailure` is the builder's output before persistence (no DB ids yet). It exposes
`to_event_row` / `to_evidence_rows` for the repository and `to_out` for the API
(`GET /sessions/{id}/failures`, doc/08).
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EvidenceType(str, Enum):
    USER_INTENT = "USER_INTENT"
    TOOL_ARGUMENT = "TOOL_ARGUMENT"
    TOOL_RESULT = "TOOL_RESULT"
    DUPLICATE_EXECUTION = "DUPLICATE_EXECUTION"
    LOOP_SEQUENCE = "LOOP_SEQUENCE"
    FINAL_RESPONSE = "FINAL_RESPONSE"
    JUDGE = "JUDGE"


# Evidence strength per type — lower is stronger (doc/01 §11: 1 outcome .. 4 semantic).
EVIDENCE_TIER_BY_TYPE: dict[EvidenceType, int] = {
    EvidenceType.USER_INTENT: 3,
    EvidenceType.TOOL_ARGUMENT: 2,
    EvidenceType.TOOL_RESULT: 2,
    EvidenceType.DUPLICATE_EXECUTION: 2,
    EvidenceType.LOOP_SEQUENCE: 3,
    EvidenceType.FINAL_RESPONSE: 4,
    EvidenceType.JUDGE: 4,
}


class BuiltEvidence(BaseModel):
    event_id: str | None  # references session_events.id; None for JUDGE evidence
    evidence_type: EvidenceType
    evidence_tier: int
    label: str
    excerpt: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)


class FailureEvidenceOut(BaseModel):
    label: str
    event_id: str | None
    evidence_tier: int


class FailureEventOut(BaseModel):
    """API response item for GET /sessions/{sessionId}/failures (doc/08)."""

    id: str
    failure_type: str
    tool_name: str | None = None
    parameter_name: str | None = None
    expected_value: Any | None = None
    observed_value: Any | None = None
    confidence: float
    evidence_tier: int
    evidence: list[FailureEvidenceOut]
    semantic_summary: str | None = None
    is_hypothesis: bool = False


class BuiltFailure(BaseModel):
    session_id: str
    failure_type: str
    workflow: str | None = None
    tool_name: str | None = None
    parameter_name: str | None = None
    expected_value: Any | None = None
    observed_value: Any | None = None
    impact_category: str | None = None
    severity_score: int = 0
    confidence: float = 0.0
    semantic_summary: str = ""
    evidence_tier: int = 4
    is_hypothesis: bool = False
    evidence: list[BuiltEvidence] = Field(default_factory=list)

    def to_event_row(self, analysis_run_id: str) -> dict[str, Any]:
        """Row for `failure_events` (doc/02 §9)."""
        return {
            "analysis_run_id": analysis_run_id,
            "session_id": self.session_id,
            "failure_type": self.failure_type,
            "workflow": self.workflow,
            "tool_name": self.tool_name,
            "parameter_name": self.parameter_name,
            "expected_value": self.expected_value,
            "observed_value": self.observed_value,
            "impact_category": self.impact_category,
            "severity_score": self.severity_score,
            "confidence": self.confidence,
            "semantic_summary": self.semantic_summary,
            "evidence_tier": self.evidence_tier,
        }

    def to_evidence_rows(self, failure_event_id: str) -> list[dict[str, Any]]:
        """Rows for `failure_evidence` (doc/02 §10)."""
        return [
            {
                "failure_event_id": failure_event_id,
                "event_id": ev.event_id,
                "evidence_type": ev.evidence_type.value,
                "evidence_tier": ev.evidence_tier,
                "label": ev.label,
                "excerpt": ev.excerpt,
                "details": ev.details,
            }
            for ev in self.evidence
        ]

    def to_out(self, failure_id: str) -> FailureEventOut:
        return FailureEventOut(
            id=failure_id,
            failure_type=self.failure_type,
            tool_name=self.tool_name,
            parameter_name=self.parameter_name,
            expected_value=self.expected_value,
            observed_value=self.observed_value,
            confidence=self.confidence,
            evidence_tier=self.evidence_tier,
            semantic_summary=self.semantic_summary,
            is_hypothesis=self.is_hypothesis,
            evidence=[
                FailureEvidenceOut(
                    label=ev.label, event_id=ev.event_id, evidence_tier=ev.evidence_tier
                )
                for ev in self.evidence
            ],
        )
