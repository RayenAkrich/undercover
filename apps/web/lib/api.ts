// Data layer for the FastAPI analysis service.
//
// Two families of calls, merged from Slice 2 (session evidence) and Slice 4
// (runs / clusters / benchmark):
//   - Session calls resolve to null on failure so the caller can fall back to the
//     deterministic demo bundle (doc/12 jury-demo mode).
//   - Run/cluster/benchmark calls Zod-validate and fall back to mocks on ANY failure,
//     so pages always render and integration flips mocks to live data with no page edits.
//
// NOTE (cross-slice): Slice 2 endpoints live under `/api/v1/...` while Slice 4's run
// endpoints are served at `/analysis-runs/...`. Each family keeps its own base constant
// below. Aligning `NEXT_PUBLIC_API_URL` and the router prefixes is an integration task.

import { z } from "zod";

import type { FailureEvent, SessionEvent, SessionMeta } from "@/types/session";
import {
  ClusterItem,
  EvaluationResult,
  RunSummary,
  type ClusterItem as ClusterItemT,
  type EvaluationResult as EvaluationResultT,
  type RunSummary as RunSummaryT,
} from "./api-types";
import { MOCK_CLUSTERS, MOCK_EVALUATION, MOCK_SUMMARY } from "./mock-clusters";

// -----------------------------------------------------------------------------
// Session evidence (Slice 2) — base includes the /api/v1 prefix.
// -----------------------------------------------------------------------------

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000/api/v1";

async function safeGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getSession(id: string): Promise<SessionMeta | null> {
  return safeGet<SessionMeta>(`/sessions/${encodeURIComponent(id)}`);
}

export async function getSessionEvents(id: string): Promise<SessionEvent[] | null> {
  const data = await safeGet<{ items: SessionEvent[] }>(
    `/sessions/${encodeURIComponent(id)}/events`
  );
  return data?.items ?? null;
}

export async function getSessionFailures(id: string): Promise<FailureEvent[] | null> {
  const data = await safeGet<{ items: FailureEvent[] }>(
    `/sessions/${encodeURIComponent(id)}/failures`
  );
  return data?.items ?? null;
}

// -----------------------------------------------------------------------------
// Runs / clusters / benchmark (Slice 4) — Zod-validated with mock fallback.
// -----------------------------------------------------------------------------

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(schema: z.ZodType<T>, path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return schema.parse(await res.json());
  } catch {
    return fallback;
  }
}

export function getClusters(runId: string): Promise<ClusterItemT[]> {
  return get(z.object({ items: ClusterItem.array() }), `/analysis-runs/${runId}/clusters`, {
    items: MOCK_CLUSTERS,
  }).then((d) => d.items);
}

export function getSummary(runId: string): Promise<RunSummaryT> {
  return get(RunSummary, `/analysis-runs/${runId}/summary`, MOCK_SUMMARY);
}

export async function getEvaluation(runId: string): Promise<EvaluationResultT | null> {
  try {
    const res = await fetch(`${BASE}/analysis-runs/${runId}/evaluation`, {
      cache: "no-store",
    });
    if (res.status === 404) return null; // unevaluated run -> empty state (honest, pack §6)
    if (!res.ok) return MOCK_EVALUATION;
    return EvaluationResult.parse(await res.json());
  } catch {
    return MOCK_EVALUATION;
  }
}
