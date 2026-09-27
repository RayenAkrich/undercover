// Session/evidence DTOs — mirror the FastAPI contract (doc/08) and the Slice 2
// backend models (apps/api/app/models/session.py, .../failures builder in Step 4).

export type EventType =
  | "USER_MESSAGE"
  | "ASSISTANT_MESSAGE"
  | "TOOL_CALL"
  | "TOOL_RESULT"
  | "ASSISTANT_FINAL";

// Failure taxonomy (doc/01 §7). Signal names PARAMETER_MISMATCH /
// SUCCESS_CLAIM_AFTER_ERROR map to WRONG_PARAMETER / FALSE_SUCCESS here.
export type FailureType =
  | "WRONG_PARAMETER"
  | "FALSE_SUCCESS"
  | "DUPLICATE_ACTION"
  | "WRONG_TOOL"
  | "LOOP_RETRY"
  | "OTHER";

// GET /sessions/{sessionId}
export interface SessionMeta {
  id: string;
  external_session_id: string;
  agent_version?: string | null;
  model_name?: string | null;
  metadata?: Record<string, unknown>;
}

// GET /sessions/{sessionId}/events -> { items: SessionEvent[] }
export interface SessionEvent {
  id: string;
  sequence_no: number;
  event_type: EventType;
  tool_name?: string | null;
  content?: string | null;
  payload?: Record<string, unknown>;
  status?: string | null;
  occurred_at?: string | null;
}

// One evidence anchor tying a failure to an immutable session event.
export interface FailureEvidence {
  label: string;
  event_id: string;
  // 1 (strongest, outcome/state) .. 4 (weakest, semantic judge) — doc/01 §11.
  evidence_tier?: number;
}

// GET /sessions/{sessionId}/failures -> { items: FailureEvent[] }
export interface FailureEvent {
  id: string;
  failure_type: FailureType;
  tool_name?: string | null;
  parameter_name?: string | null;
  expected_value?: unknown;
  observed_value?: unknown;
  confidence: number; // 0..1
  evidence_tier: number; // 1..4, 1 strongest
  evidence: FailureEvidence[];
  // Deviation summary / AI hypothesis text (judge reason or semantic summary).
  semantic_summary?: string | null;
  // True when the finding rests on the semantic judge rather than deterministic facts.
  is_hypothesis?: boolean;
}

export interface SessionBundle {
  session: SessionMeta;
  events: SessionEvent[];
  failures: FailureEvent[];
  isDemo: boolean;
}
