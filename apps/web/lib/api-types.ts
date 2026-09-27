import { z } from "zod";

// Zod schemas mirroring team/CONTRACTS.md §5 + doc/08. Person 4 owns these.

export const PriorityLabel = z.enum(["P0", "P1", "P2", "P3"]);

export const ClusterItem = z.object({
  id: z.string().uuid(),
  title: z.string(),
  priority_label: PriorityLabel,
  priority_score: z.number().min(0).max(100),
  occurrence_count: z.number().int().nonnegative(),
  affected_sessions: z.number().int().nonnegative(),
  confidence_score: z.number().min(0).max(100),
  first_seen: z.string(),
  last_seen: z.string(),
});
export type ClusterItem = z.infer<typeof ClusterItem>;

export const RunStatus = z.enum(["QUEUED", "RUNNING", "COMPLETED", "FAILED"]);

export const AnalysisRun = z.object({
  id: z.string().uuid(),
  status: RunStatus,
  sessions_total: z.number().int().nonnegative(),
  sessions_processed: z.number().int().nonnegative(),
  failure_events_count: z.number().int().nonnegative(),
  clusters_count: z.number().int().nonnegative(),
});
export type AnalysisRun = z.infer<typeof AnalysisRun>;

export const RunSummary = z.object({
  sessions_analyzed: z.number().int().nonnegative(),
  candidate_sessions: z.number().int().nonnegative(),
  failure_events: z.number().int().nonnegative(),
  clusters: z.number().int().nonnegative(),
  noise_failures: z.number().int().nonnegative(),
  highest_priority_cluster_id: z.string().uuid(),
});
export type RunSummary = z.infer<typeof RunSummary>;

export const EvaluationResult = z.object({
  precision: z.number().min(0).max(1),
  recall: z.number().min(0).max(1),
  f1: z.number().min(0).max(1),
  false_positives: z.number().int().nonnegative(),
  false_negatives: z.number().int().nonnegative(),
  ari: z.number().nullable(),
  nmi: z.number().nullable(),
});
export type EvaluationResult = z.infer<typeof EvaluationResult>;
