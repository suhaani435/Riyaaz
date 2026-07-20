from fastapi.testclient import TestClient

from riyaaz_api.main import create_app


def test_health_endpoint_returns_liveness_contract() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
