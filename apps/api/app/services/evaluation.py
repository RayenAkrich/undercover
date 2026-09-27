"""Benchmark evaluation. Person 4 owns. US-E9-002.

ONLY this module reads ground_truth_labels, and ONLY after discovery completes.
compare() is pure and final — covered by tests/test_evaluation.py.
DB persistence (evaluate_run) is wired at integration (3:00).
"""

from uuid import UUID

from app.repositories import runs as run_repo


def compare(predicted_failed: set[str], actual_failed: set[str]) -> dict:
    """Precision/recall/F1 over session-id sets. Handles empty edge cases."""
    tp = len(predicted_failed & actual_failed)
    fp = len(predicted_failed - actual_failed)
    fn = len(actual_failed - predicted_failed)
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "false_positives": fp,
        "false_negatives": fn,
    }


def evaluate_run(run_id: UUID) -> dict:
    """Run AFTER discovery completes. Only reader of ground_truth_labels."""
    run = run_repo.get_run(run_id)
    if run is None:
        raise KeyError(f"Unknown run {run_id}")
    predicted = run_repo.get_failure_session_ids(run_id)
    actual = run_repo.get_ground_truth_session_ids(run["dataset_id"])
    metrics = compare(predicted, actual)
    return run_repo.upsert_evaluation(run_id, metrics)
