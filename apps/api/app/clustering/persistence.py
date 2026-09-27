"""Supabase persistence for Slice 3 clustering results."""

from __future__ import annotations

from typing import Any


def persist_clustering_result(client: Any, result: dict[str, Any]) -> None:
    fingerprints = [
        {
            "failure_event_id": event_id,
            "workflow": fingerprint["workflow"],
            "failure_type": fingerprint["failure_type"].upper(),
            "tool_name": fingerprint["tool"],
            "parameter_name": fingerprint["parameter"] or None,
            "outcome_category": fingerprint["outcome_category"] or None,
            "agent_version": fingerprint["agent_version"] or None,
            "fingerprint_hash": fingerprint["fingerprint_hash"],
        }
        for event_id, fingerprint in result["fingerprints"].items()
    ]
    clusters = [
        {
            "id": cluster["id"],
            "analysis_run_id": cluster["analysis_run_id"],
            "cluster_key": cluster["cluster_key"],
            "generated_title": cluster["generated_title"],
            "generated_summary": cluster["generated_summary"],
            "likely_contributing_factor": cluster["likely_contributing_factor"],
            "occurrence_count": cluster["occurrence_count"],
            "affected_sessions": cluster["affected_sessions"],
            "first_seen": cluster["first_seen"],
            "last_seen": cluster["last_seen"],
            "impact_score": cluster["impact_score"],
            "frequency_score": cluster["frequency_score"],
            "severity_score": cluster["severity_score"],
            "reach_score": cluster["reach_score"],
            "confidence_score": cluster["confidence_score"],
            "priority_score": cluster["priority_score"],
            "priority_label": cluster["priority_label"],
        }
        for cluster in result["clusters"]
    ]
    members = [
        {
            "cluster_id": member["cluster_id"],
            "failure_event_id": member["failure_event_id"],
            "distance": member["distance"],
            "is_representative": member["is_representative"],
        }
        for member in result["members"]
    ]

    if fingerprints:
        client.table("failure_fingerprints").upsert(fingerprints).execute()
    if clusters:
        client.table("failure_clusters").upsert(clusters).execute()
    if members:
        client.table("cluster_members").upsert(members).execute()
