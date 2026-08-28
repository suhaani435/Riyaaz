"""
Test for the /api/health endpoint.

Phase: Project Foundation — this is the only endpoint that exists.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/api/health")
    assert response.status_code == 200

    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "riyaaz-bol-trainer-backend"
    assert "version" in body
