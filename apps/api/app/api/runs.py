"""Run orchestration endpoints. Person 4 owns. Shapes: team/CONTRACTS.md §5."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field

from app.repositories import runs as run_repo
from app.services import pipeline as pipeline_svc
from app.services.evaluation import evaluate_run as evaluate_run_svc


class AnalysisRunConfig(BaseModel):
    judge_model: str = "configured-model"
    loop_threshold: int = 4
    clustering_algorithm: str = "hdbscan"
    min_cluster_size: int = 5


class CreateRunRequest(BaseModel):
    dataset_id: UUID
    config: AnalysisRunConfig = Field(default_factory=AnalysisRunConfig)


class CreateRunResponse(BaseModel):
    id: UUID
    status: str = "QUEUED"


class RunProgress(BaseModel):
    id: UUID
    status: str
    sessions_total: int = 0
    sessions_processed: int = 0
    failure_events_count: int = 0
    clusters_count: int = 0


class RunSummary(BaseModel):
    sessions_analyzed: int = 0
    candidate_sessions: int = 0
    failure_events: int = 0
    clusters: int = 0
    noise_failures: int = 0
    highest_priority_cluster_id: UUID | None = None


class EvaluationResult(BaseModel):
    precision: float = 0.0
    recall: float = 0.0
    f1: float = 0.0
    false_positives: int = 0
    false_negatives: int = 0
    ari: float | None = None  # P1, cut in 4h
    nmi: float | None = None  # P1, cut in 4h


router = APIRouter(prefix="/analysis-runs", tags=["runs"])


def _to_progress(row: dict) -> RunProgress:
    return RunProgress(
        id=row["id"],
        status=row["status"],
        sessions_total=row.get("sessions_total", 0),
        sessions_processed=row.get("sessions_processed", 0),
        failure_events_count=row.get("failure_events_count", 0),
        clusters_count=row.get("clusters_count", 0),
    )


def _execute_run(run_id: UUID, dataset_id: UUID) -> None:
    """Background task: RUNNING -> COMPLETED/FAILED, counts persisted."""
    run_repo.update_run(
        run_id, {"status": "RUNNING", "started_at": datetime.now(timezone.utc).isoformat()}
    )
    try:
        result = pipeline_svc.run_pipeline(dataset_id, run_id)
        run_repo.update_run(
            run_id,
            {
                "status": "COMPLETED",
                "sessions_processed": result["processed"],
                "failure_events_count": result["events"],
                "clusters_count": result["clusters"],
                "completed_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    except Exception as exc:  # noqa: BLE001 — run must record failure, never hang
        run_repo.update_run(
            run_id,
            {
                "status": "FAILED",
                "error_message": str(exc)[:500],
                "completed_at": datetime.now(timezone.utc).isoformat(),
            },
        )


@router.post("", status_code=202, response_model=CreateRunResponse)
def create_run(body: CreateRunRequest, background: BackgroundTasks) -> CreateRunResponse:
    if not run_repo.dataset_exists(body.dataset_id):
        raise HTTPException(
            status_code=404,
            detail={"code": "INVALID_DATASET", "message": f"Unknown dataset {body.dataset_id}"},
        )
    row = run_repo.create_run(body.dataset_id, body.config.model_dump())
    background.add_task(_execute_run, row["id"], body.dataset_id)
    return CreateRunResponse(id=row["id"], status=row["status"])


@router.get("/{run_id}", response_model=RunProgress)
def get_run(run_id: UUID) -> RunProgress:
    row = run_repo.get_run(run_id)
    if row is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "RUN_NOT_FOUND", "message": f"Unknown run {run_id}"},
        )
    return _to_progress(row)


@router.get("/{run_id}/summary", response_model=RunSummary)
def get_summary(run_id: UUID) -> RunSummary:
    row = run_repo.get_run(run_id)
    if row is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "RUN_NOT_FOUND", "message": f"Unknown run {run_id}"},
        )
    return RunSummary(
        sessions_analyzed=row.get("sessions_total", 0),
        candidate_sessions=0,  # wired when detection reports candidate counts
        failure_events=row.get("failure_events_count", 0),
        clusters=row.get("clusters_count", 0),
        noise_failures=0,  # wired when clustering reports noise
        highest_priority_cluster_id=None,  # wired when clusters persist
    )


@router.post("/{run_id}/evaluate")
def evaluate_run(run_id: UUID) -> dict:
    """Must run AFTER discovery completes; only reader of ground_truth_labels."""
    try:
        evaluate_run_svc(run_id)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail={"code": "RUN_NOT_FOUND", "message": f"Unknown run {run_id}"},
        )
    return {"status": "completed"}


@router.get("/{run_id}/evaluation", response_model=EvaluationResult)
def get_evaluation(run_id: UUID) -> EvaluationResult:
    row = run_repo.get_evaluation(run_id)
    if row is None:
        raise HTTPException(
            status_code=404,
            detail={"code": "EVALUATION_NOT_FOUND", "message": f"Run {run_id} not evaluated yet"},
        )
    return EvaluationResult(
        precision=row.get("precision") or 0.0,
        recall=row.get("recall") or 0.0,
        f1=row.get("f1") or 0.0,
        false_positives=row.get("false_positives", 0),
        false_negatives=row.get("false_negatives", 0),
        ari=row.get("ari"),
        nmi=row.get("nmi"),
    )
