"""Run pipeline: Slice 1 -> Slice 2 -> Slice 3. Person 4 owns the glue.

Stage function signatures were frozen at the 0:15 meeting (team/CONTRACTS.md §4).
Until real stage functions land, orchestrate() runs against stubs; swap at 3:00.
One bad session must never crash a run: wrap per-session work in try/except.
"""

from uuid import UUID


def load_sessions(dataset_id: UUID) -> list[dict]:
    """Slice 1: normalized sessions + events. STUB (returns []) until Slice 1 delivers."""
    # SWAP(3:00): from app.services.ingestion import load_sessions as _load; return _load(dataset_id)
    return []


def detect(session_events: list[dict]) -> list[dict]:
    """Slice 2: deterministic signals. STUB (returns []) until Slice 2 delivers."""
    # SWAP(3:00): from app.detectors.rules import detect_session as _d; return _d(session_events)
    return []


def build_events(signals: list[dict]) -> list[dict]:
    """Slice 2: FailureEvents + evidence. STUB (returns []) until Slice 2 delivers."""
    # SWAP(3:00): from app.services.failures import build_events as _b; return _b(signals)
    return []


def cluster(events: list[dict]) -> list[dict]:
    """Slice 3: clusters + members + priority. STUB (returns []) until Slice 3 delivers."""
    # SWAP(3:00): from app.clustering.cluster import cluster_events as _c; return _c(events)
    return []


def run_pipeline(dataset_id: UUID, run_id: UUID) -> dict:
    """Background-task entrypoint: returns final counts for the run row."""
    sessions = load_sessions(dataset_id)
    processed, events = 0, []
    for session in sessions:
        try:
            signals = detect(session.get("events", []))
            events.extend(build_events(signals))
            processed += 1
        except Exception:
            continue  # US-E12-004: never crash the run on one bad session
    clusters = cluster(events)
    return {"processed": processed, "events": len(events), "clusters": len(clusters)}
