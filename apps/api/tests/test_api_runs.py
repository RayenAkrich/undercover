"""Runs API smoke tests — read-only paths only (no DB writes). Person 4 owns."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

UNKNOWN = "00000000-0000-4000-8000-000000000000"


def test_health_shape():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["database"] in ("ok", "degraded")
    assert "version" in body


def test_create_run_unknown_dataset_404():
    r = client.post("/analysis-runs", json={"dataset_id": UNKNOWN})
    assert r.status_code == 404
    assert r.json()["detail"]["code"] == "INVALID_DATASET"


def test_get_unknown_run_404():
    assert client.get(f"/analysis-runs/{UNKNOWN}").status_code == 404
    assert client.get(f"/analysis-runs/{UNKNOWN}/summary").status_code == 404
