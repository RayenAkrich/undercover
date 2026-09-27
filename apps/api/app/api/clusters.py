"""Cluster API endpoints."""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.clustering.cluster import cluster_failure_events
from app.clustering.demo_data import RUN_ID, synthetic_failure_events

router = APIRouter()


@lru_cache(maxsize=1)
def demo_cluster_store() -> dict[str, Any]:
    return cluster_failure_events(synthetic_failure_events())


@router.get("/analysis-runs/{run_id}/clusters")
def list_clusters(
    run_id: str,
    priority: str | None = Query(default=None),
    tool: str | None = Query(default=None),
    sort: str = Query(default="priority"),
):
    if run_id != RUN_ID:
        raise HTTPException(status_code=404, detail="analysis run not found")

    items = list(demo_cluster_store()["clusters"])
    if priority:
        items = [item for item in items if item["priority_label"] == priority]
    if tool:
        items = [item for item in items if tool in item["top_tools"]]

    if sort == "occurrences":
        items.sort(key=lambda item: item["occurrence_count"], reverse=True)
    elif sort == "recent":
        items.sort(key=lambda item: item["last_seen"] or "", reverse=True)
    else:
        items.sort(key=lambda item: item["priority_score"], reverse=True)

    return {"items": [_cluster_summary(item) for item in items]}


@router.get("/clusters/{cluster_id}")
def get_cluster(cluster_id: str):
    for cluster in demo_cluster_store()["clusters"]:
        if cluster["id"] == cluster_id:
            return cluster
    raise HTTPException(status_code=404, detail="cluster not found")


@router.get("/clusters/{cluster_id}/members")
def get_cluster_members(cluster_id: str):
    cluster_ids = {cluster["id"] for cluster in demo_cluster_store()["clusters"]}
    if cluster_id not in cluster_ids:
        raise HTTPException(status_code=404, detail="cluster not found")

    members = [
        member
        for member in demo_cluster_store()["members"]
        if member["cluster_id"] == cluster_id
    ]
    return {"items": members}


def _cluster_summary(cluster: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": cluster["id"],
        "title": cluster["title"],
        "priority_label": cluster["priority_label"],
        "priority_score": cluster["priority_score"],
        "occurrence_count": cluster["occurrence_count"],
        "affected_sessions": cluster["affected_sessions"],
        "confidence_score": cluster["confidence_score"],
        "first_seen": cluster["first_seen"],
        "last_seen": cluster["last_seen"],
        "top_tools": cluster["top_tools"],
    }
