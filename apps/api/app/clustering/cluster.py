"""Cluster FailureEvents into recurring issues."""

from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any
from uuid import uuid5, NAMESPACE_URL

import numpy as np
from sklearn.cluster import AgglomerativeClustering

from app.clustering.embed import embed_texts
from app.clustering.fingerprint import make_fingerprint, semantic_summary
from app.clustering.labeling import label_cluster
from app.clustering.representatives import representative_ids
from app.clustering.services.prioritization import score_cluster


def _hdbscan_labels(vectors: np.ndarray) -> list[int]:
    try:
        import hdbscan

        labels = list(hdbscan.HDBSCAN(min_cluster_size=5, metric="euclidean").fit_predict(vectors))
        if labels and all(label == -1 for label in labels):
            raise ValueError("all points marked noise")
        return labels
    except Exception:
        if len(vectors) < 10:
            return [0] * len(vectors)
        model = AgglomerativeClustering(n_clusters=5, metric="cosine", linkage="average")
        return list(model.fit_predict(vectors))


def _stable_cluster_id(run_id: str, key: str) -> str:
    return str(uuid5(NAMESPACE_URL, f"undercover:{run_id}:{key}"))


def cluster_failure_events(events: list[dict[str, Any]]) -> dict[str, Any]:
    fingerprints = {event["id"]: make_fingerprint(event) for event in events}
    grouped: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    noise: list[dict[str, Any]] = []

    for event in events:
        key = (
            str(event.get("workflow") or "unknown"),
            str(event.get("failure_type") or "unknown"),
            str(event.get("tool_name") or event.get("tool") or "unknown"),
        )
        grouped[key].append(event)

    raw_clusters: list[list[dict[str, Any]]] = []
    for group_events in grouped.values():
        if len(group_events) < 5:
            noise.extend(group_events)
            continue
        vectors = embed_texts(semantic_summary(event) for event in group_events)
        labels = _hdbscan_labels(vectors)
        by_label: dict[int, list[dict[str, Any]]] = defaultdict(list)
        for event, label in zip(group_events, labels, strict=True):
            if label == -1:
                noise.append(event)
            else:
                by_label[label].append(event)
        for members in by_label.values():
            if len(members) >= 5:
                raw_clusters.append(members)
            else:
                noise.extend(members)

    max_count = max((len(cluster) for cluster in raw_clusters), default=1)
    clusters = []
    members = []

    for index, cluster_events in enumerate(raw_clusters):
        run_id = str(cluster_events[0]["analysis_run_id"])
        cluster_key = fingerprints[cluster_events[0]["id"]]["fingerprint_hash"]
        cluster_id = _stable_cluster_id(run_id, cluster_key)
        labels = label_cluster(cluster_events)
        scores = score_cluster(cluster_events, max_count)
        versions = Counter(event.get("agent_version") or "unknown" for event in cluster_events)
        top_tool = Counter(event.get("tool_name") or "unknown" for event in cluster_events).most_common(1)[0][0]
        vectors = embed_texts(semantic_summary(event) for event in cluster_events)
        reps = representative_ids(cluster_events, vectors)
        created = [event.get("created_at") for event in cluster_events if event.get("created_at")]

        cluster = {
            "id": cluster_id,
            "analysis_run_id": run_id,
            "cluster_key": cluster_key,
            **labels,
            "title": labels["generated_title"],
            "summary": labels["generated_summary"],
            "occurrence_count": len(cluster_events),
            "affected_sessions": len({event.get("session_id") for event in cluster_events}),
            "first_seen": min(created) if created else None,
            "last_seen": max(created) if created else None,
            "top_tools": [top_tool],
            "agent_versions": dict(versions),
            "representative_failure_ids": [event["id"] for event in cluster_events if event["id"] in reps],
            "rank": index + 1,
            **scores,
        }
        cluster["priority"] = {
            "impact": cluster["impact_score"],
            "frequency": cluster["frequency_score"],
            "severity": cluster["severity_score"],
            "reach": cluster["reach_score"],
            "confidence": cluster["confidence_score"],
            "score": cluster["priority_score"],
            "label": cluster["priority_label"],
        }
        clusters.append(cluster)
        for event in cluster_events:
            members.append(
                {
                    "cluster_id": cluster_id,
                    "failure_event_id": event["id"],
                    "is_representative": event["id"] in reps,
                    "distance": None,
                    "event": event,
                    "fingerprint": fingerprints[event["id"]],
                }
            )

    clusters.sort(key=lambda item: (-item["priority_score"], -item["occurrence_count"], item["title"]))
    return {"clusters": clusters, "members": members, "noise": noise, "fingerprints": fingerprints}
