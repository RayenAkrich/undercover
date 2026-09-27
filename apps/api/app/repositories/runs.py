"""Run persistence. Person 4 owns. All Supabase writes go through here."""

from uuid import UUID

from app.core.supabase import get_client

TABLE = "analysis_runs"


def create_run(dataset_id: UUID, config: dict) -> dict:
    row = (
        get_client()
        .table(TABLE)
        .insert({"dataset_id": str(dataset_id), "status": "QUEUED", "config": config})
        .execute()
        .data[0]
    )
    return row


def get_run(run_id: UUID) -> dict | None:
    rows = get_client().table(TABLE).select("*").eq("id", str(run_id)).execute().data
    return rows[0] if rows else None


def update_run(run_id: UUID, patch: dict) -> dict:
    return (
        get_client()
        .table(TABLE)
        .update(patch)
        .eq("id", str(run_id))
        .execute()
        .data[0]
    )


def dataset_exists(dataset_id: UUID) -> bool:
    rows = (
        get_client()
        .table("datasets")
        .select("id")
        .eq("id", str(dataset_id))
        .limit(1)
        .execute()
        .data
    )
    return bool(rows)


def get_failure_session_ids(run_id: UUID) -> set[str]:
    rows = (
        get_client()
        .table("failure_events")
        .select("session_id")
        .eq("analysis_run_id", str(run_id))
        .execute()
        .data
    )
    return {r["session_id"] for r in rows}


def get_ground_truth_session_ids(dataset_id: UUID) -> set[str]:
    rows = (
        get_client()
        .table("ground_truth_labels")
        .select("session_id")
        .eq("dataset_id", str(dataset_id))
        .eq("is_failure", True)
        .execute()
        .data
    )
    return {r["session_id"] for r in rows}


def upsert_evaluation(run_id: UUID, metrics: dict) -> dict:
    client = get_client()
    client.table("evaluation_results").delete().eq("analysis_run_id", str(run_id)).execute()
    return (
        client
        .table("evaluation_results")
        .insert({"analysis_run_id": str(run_id), **metrics})
        .execute()
        .data[0]
    )


def get_evaluation(run_id: UUID) -> dict | None:
    rows = (
        get_client()
        .table("evaluation_results")
        .select("*")
        .eq("analysis_run_id", str(run_id))
        .order("created_at", desc=True)
        .limit(1)
        .execute()
        .data
    )
    return rows[0] if rows else None
