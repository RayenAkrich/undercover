import { z } from "zod";

import {
  ClusterItem,
  EvaluationResult,
  RunSummary,
  type ClusterItem as ClusterItemT,
  type EvaluationResult as EvaluationResultT,
  type RunSummary as RunSummaryT,
} from "./api-types";
import { MOCK_CLUSTERS, MOCK_EVALUATION, MOCK_SUMMARY } from "./mock-clusters";

// Data layer: fetch from FastAPI, Zod-validate, fall back to mocks on ANY
// failure (network, 404, schema). Pages always render; integration flips
// mocks to live data with zero page changes (Phase 4, T11).

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function get<T>(
  schema: z.ZodType<T>,
  path: string,
  fallback: T
): Promise<T> {
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

export async function getEvaluation(
  runId: string
): Promise<EvaluationResultT | null> {
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
