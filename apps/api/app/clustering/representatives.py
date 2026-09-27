"""Representative member selection."""

from __future__ import annotations

from typing import Any

import numpy as np


def representative_ids(
    events: list[dict[str, Any]], vectors: np.ndarray, limit: int = 5
) -> set[str]:
    if not events:
        return set()
    if len(events) <= 3 or vectors.size == 0:
        return {str(event["id"]) for event in events[:limit]}

    centroid = vectors.mean(axis=0)
    distances = np.linalg.norm(vectors - centroid, axis=1)
    ordered = np.argsort(distances)[:limit]
    return {str(events[index]["id"]) for index in ordered}
