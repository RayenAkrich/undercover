// Presentation helpers for failure types, evidence tiers, and value formatting.
// Kept out of components so the mapping is testable and consistent across the page.

import type { EventType, FailureType } from "@/types/session";

interface FailureStyle {
  label: string;
  // Tailwind classes for the failure chip (uses brand p0-p3 tokens, doc/12).
  chip: string;
  dot: string;
}

const FAILURE_STYLES: Record<FailureType, FailureStyle> = {
  WRONG_PARAMETER: {
    label: "WRONG_PARAMETER",
    chip: "bg-p0/15 text-red-300 border border-red-800/60",
    dot: "bg-p0",
  },
  DUPLICATE_ACTION: {
    label: "DUPLICATE_ACTION",
    chip: "bg-p0/15 text-red-300 border border-red-800/60",
    dot: "bg-p0",
  },
  FALSE_SUCCESS: {
    label: "FALSE_SUCCESS",
    chip: "bg-p1/15 text-orange-300 border border-orange-800/60",
    dot: "bg-p1",
  },
  WRONG_TOOL: {
    label: "WRONG_TOOL",
    chip: "bg-p1/15 text-orange-300 border border-orange-800/60",
    dot: "bg-p1",
  },
  LOOP_RETRY: {
    label: "LOOP_RETRY",
    chip: "bg-p2/15 text-amber-300 border border-amber-800/60",
    dot: "bg-p2",
  },
  OTHER: {
    label: "OTHER",
    chip: "bg-slate-800 text-slate-300 border border-slate-700/60",
    dot: "bg-slate-500",
  },
};

export function failureStyle(type: FailureType): FailureStyle {
  return FAILURE_STYLES[type] ?? FAILURE_STYLES.OTHER;
}

// Evidence tiers: 1 strongest (outcome/state) .. 4 weakest (semantic judge) — doc/01 §11.
const TIER_LABELS: Record<number, string> = {
  1: "Outcome / state",
  2: "Tool execution",
  3: "Structured trace",
  4: "Semantic judge",
};

export function tierLabel(tier: number): string {
  return TIER_LABELS[tier] ?? "Unknown";
}

export const EVENT_META: Record<
  EventType,
  { label: string; icon: string }
> = {
  USER_MESSAGE: { label: "User", icon: "person" },
  ASSISTANT_MESSAGE: { label: "Agent", icon: "psychology" },
  TOOL_CALL: { label: "Tool call", icon: "build" },
  TOOL_RESULT: { label: "Tool result", icon: "dns" },
  ASSISTANT_FINAL: { label: "Final answer", icon: "chat" },
};

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// Numeric delta for the diff card, when both sides are numbers.
export function numericDelta(
  expected: unknown,
  observed: unknown
): { delta: number; pct: number | null } | null {
  if (typeof expected !== "number" || typeof observed !== "number") return null;
  const delta = observed - expected;
  const pct = expected !== 0 ? (delta / expected) * 100 : null;
  return { delta, pct };
}

// Render tool arguments / result payload as key=value lines for the timeline.
export function toolArgs(payload?: Record<string, unknown>): Record<string, unknown> {
  if (!payload) return {};
  const args = (payload.arguments ?? payload.args) as Record<string, unknown> | undefined;
  if (args && typeof args === "object") return args;
  return payload;
}

export function toolResult(payload?: Record<string, unknown>): unknown {
  if (!payload) return {};
  return payload.result ?? payload;
}
