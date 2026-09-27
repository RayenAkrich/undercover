"""Dataset import and read endpoints."""

from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.repositories.datasets import DatasetRepository
from app.repositories.sessions import SessionRepository
from app.services.ingestion import import_sessions


router = APIRouter(prefix="/api/v1/datasets", tags=["datasets"])


def repos() -> tuple[DatasetRepository, SessionRepository]:
    try:
        return DatasetRepository(), SessionRepository()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/import", status_code=status.HTTP_201_CREATED)
async def import_dataset(file: UploadFile = File(...), name: str = Form("Imported Dataset")):
    dataset_repo, session_repo = repos()
    return await import_sessions(await file.read(), name, dataset_repo, session_repo)


@router.get("")
async def list_datasets():
    dataset_repo, _ = repos()
    return {"items": await dataset_repo.list()}


@router.get("/{dataset_id}")
async def get_dataset(dataset_id: str):
    dataset_repo, _ = repos()
    dataset = await dataset_repo.get(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset
