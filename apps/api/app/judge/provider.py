"""Provider-neutral judge (Slice 2, Step 3 — doc/03 §10, doc/09 §1-2/§6-7).

`judge_session()` adjudicates ONE candidate session and returns a JudgeDecision.

Order of operations:
1. If a provider key is configured, call an OpenAI-compatible chat endpoint, validate
   the JSON with Pydantic, and retry once on invalid output (US-E3-002).
2. Otherwise — or if the call fails — fall back to the heuristic stub that maps the
   deterministic signals to a low-confidence JudgeDecision (the 20-minute rule).

No product logic depends on a specific vendor SDK; the LLM path is a thin HTTP call.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field

from app.judge.context import CompactContext
from app.judge.prompts import PROMPT_VERSION, SYSTEM_PROMPT, USER_TEMPLATE
from app.models.judge import DeviationType, JudgeDecision
from app.models.signals import DetectionSignal, SignalType


@dataclass
class JudgeConfig:
    model_name: str = field(default_factory=lambda: os.getenv("JUDGE_MODEL", "configured-model"))
    api_key: str | None = field(
        default_factory=lambda: os.getenv("JUDGE_API_KEY") or os.getenv("OPENAI_API_KEY")
    )
    base_url: str = field(
        default_factory=lambda: os.getenv("JUDGE_BASE_URL", "https://api.openai.com/v1")
    )
    timeout_s: float = 20.0

    @property
    def provider_configured(self) -> bool:
        return bool(self.api_key)


# Deterministic signal -> deviation mapping for the heuristic fallback.
_SIGNAL_TO_DEVIATION: dict[SignalType, DeviationType] = {
    SignalType.SUCCESS_CLAIM_AFTER_ERROR: DeviationType.FALSE_SUCCESS,
    SignalType.PARAMETER_MISMATCH: DeviationType.WRONG_PARAMETER,
    SignalType.DUPLICATE_ACTION: DeviationType.DUPLICATE_ACTION,
    SignalType.LOOP_RETRY: DeviationType.LOOP_RETRY,
    SignalType.TOOL_ERROR: DeviationType.OTHER,
}
# Priority when several signals exist — most behaviorally significant first.
_SIGNAL_PRIORITY = (
    SignalType.SUCCESS_CLAIM_AFTER_ERROR,
    SignalType.PARAMETER_MISMATCH,
    SignalType.DUPLICATE_ACTION,
    SignalType.LOOP_RETRY,
    SignalType.TOOL_ERROR,
)


def judge_session(
    context: CompactContext,
    signals: list[DetectionSignal] | None = None,
    config: JudgeConfig | None = None,
) -> JudgeDecision:
    cfg = config or JudgeConfig()
    if cfg.provider_configured:
        decision = _judge_via_llm(context, cfg)
        if decision is not None:
            return decision
    return heuristic_decision(context, signals or [], cfg)


# ---------------------------------------------------------------------------
# Heuristic fallback (the 20-minute rule)
# ---------------------------------------------------------------------------


def heuristic_decision(
    context: CompactContext,
    signals: list[DetectionSignal],
    config: JudgeConfig | None = None,
) -> JudgeDecision:
    """Map deterministic signals to a low-confidence JudgeDecision.

    A working deterministic pipeline beats a broken LLM call: when the judge is
    unavailable we still return a schema-valid decision marked "heuristic fallback".
    """
    cfg = config or JudgeConfig()
    chosen: DetectionSignal | None = None
    for stype in _SIGNAL_PRIORITY:
        for sig in signals:
            if sig.signal_type == stype:
                chosen = sig
                break
        if chosen:
            break

    if chosen is None:
        return JudgeDecision(
            is_failure=False,
            deviation_type=DeviationType.NONE,
            reason="heuristic fallback: no deterministic signal to adjudicate",
            confidence=0.3,
            source="HEURISTIC",
            model_name=cfg.model_name,
            prompt_version=PROMPT_VERSION,
            intent={"goal": context.user_request[:280]},
        )

    deviation = _SIGNAL_TO_DEVIATION.get(chosen.signal_type, DeviationType.OTHER)
    # Behavioral families are treated as failures; a bare tool error is not, on its own.
    is_failure = deviation not in (DeviationType.OTHER, DeviationType.NONE)
    confidence = 0.6 if is_failure else 0.4

    return JudgeDecision(
        is_failure=is_failure,
        deviation_type=deviation,
        reason=f"heuristic fallback: {chosen.signal_type.value} detected deterministically",
        confidence=confidence,
        source="HEURISTIC",
        model_name=cfg.model_name,
        prompt_version=PROMPT_VERSION,
        intent={"goal": context.user_request[:280]},
        observed_action={"detail": chosen.details},
    )


# ---------------------------------------------------------------------------
# LLM path (OpenAI-compatible chat completions)
# ---------------------------------------------------------------------------


def _judge_via_llm(context: CompactContext, cfg: JudgeConfig) -> JudgeDecision | None:
    """Call the provider, validate, retry once. Returns None on unrecoverable failure
    so the caller can fall back to the heuristic (US-E3-002)."""
    user_prompt = USER_TEMPLATE.format(
        user_request=context.user_request,
        assistant_context=context.assistant_context,
        tool_trace=context.tool_trace,
        final_answer=context.final_answer,
    )
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    for attempt in range(2):  # initial + one retry
        try:
            raw = _post_chat(messages, cfg)
            data = _extract_json(raw)
            decision = JudgeDecision(**data)
            decision.source = "JUDGE"
            decision.model_name = cfg.model_name
            decision.prompt_version = PROMPT_VERSION
            return decision
        except Exception:  # noqa: BLE001 — network/parse/validation all fall back
            if attempt == 1:
                return None
    return None


def _post_chat(messages: list[dict], cfg: JudgeConfig) -> str:
    import httpx  # imported lazily so the module loads without httpx installed

    resp = httpx.post(
        f"{cfg.base_url.rstrip('/')}/chat/completions",
        headers={"Authorization": f"Bearer {cfg.api_key}", "Content-Type": "application/json"},
        json={
            "model": cfg.model_name,
            "messages": messages,
            "temperature": 0,
            "response_format": {"type": "json_object"},
        },
        timeout=cfg.timeout_s,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def _extract_json(text: str) -> dict:
    """Parse a JSON object from the model output, tolerating code fences."""
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lstrip().lower().startswith("json"):
            text = text.lstrip()[4:]
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object found in judge output")
    return json.loads(text[start : end + 1])
