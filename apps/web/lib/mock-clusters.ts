import type { ClusterItem, EvaluationResult, RunSummary } from "./api-types";

// Mock data for inbox development until real APIs land (~3:15).
// Shapes match team/CONTRACTS.md §5. Swap to fetch() calls, keep components.

export const MOCK_CLUSTERS: ClusterItem[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Duplicate refunds after retry",
    priority_label: "P0",
    priority_score: 91,
    occurrence_count: 32,
    affected_sessions: 28,
    confidence_score: 97,
    first_seen: "2026-09-20T10:00:00Z",
    last_seen: "2026-09-27T09:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "False success after refund rejection",
    priority_label: "P0",
    priority_score: 85,
    occurrence_count: 19,
    affected_sessions: 19,
    confidence_score: 94,
    first_seen: "2026-09-21T10:00:00Z",
    last_seen: "2026-09-27T08:00:00Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Wrong refund amounts",
    priority_label: "P1",
    priority_score: 72,
    occurrence_count: 45,
    affected_sessions: 42,
    confidence_score: 89,
    first_seen: "2026-09-19T10:00:00Z",
    last_seen: "2026-09-27T07:00:00Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "Wrong tool: cancel instead of address change",
    priority_label: "P1",
    priority_score: 64,
    occurrence_count: 14,
    affected_sessions: 14,
    confidence_score: 91,
    first_seen: "2026-09-22T10:00:00Z",
    last_seen: "2026-09-26T07:00:00Z",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    title: "Retry loop on order lookup",
    priority_label: "P2",
    priority_score: 48,
    occurrence_count: 58,
    affected_sessions: 51,
    confidence_score: 83,
    first_seen: "2026-09-18T10:00:00Z",
    last_seen: "2026-09-27T06:00:00Z",
  },
];

export const MOCK_SUMMARY: RunSummary = {
  sessions_analyzed: 300,
  candidate_sessions: 84,
  failure_events: 168,
  clusters: 5,
  noise_failures: 9,
  highest_priority_cluster_id: "11111111-1111-4111-8111-111111111111",
};

export const MOCK_EVALUATION: EvaluationResult = {
  precision: 0.94,
  recall: 0.89,
  f1: 0.91,
  false_positives: 12,
  false_negatives: 17,
  ari: null,
  nmi: null,
};
