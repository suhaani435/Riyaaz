"""
Tests for GET /api/compositions and idempotent seeding.

Phase 2: SELECT BOL -> LISTEN
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.main import app
from app.models import Composition
from app.seed import COMPOSITIONS, seed_compositions

EXPECTED_NAMES = {
    "Ta Thai Thai Tat",
    "Dha Ta Ka Thunga",
    "Tat Tat Thai",
    "Dig Dig Ta",
}


@pytest.fixture()
def client():
    # Used as a context manager so the app's lifespan (startup)
    # actually runs: this creates tables and seeds the configured
    # database before any request is made.
    with TestClient(app) as test_client:
        yield test_client


def test_list_compositions_returns_seeded_data(client: TestClient):
    response = client.get("/api/compositions")
    assert response.status_code == 200

    body = response.json()
    assert len(body) == 4

    names = {item["name"] for item in body}
    assert names == EXPECTED_NAMES

    for item in body:
        assert item["reference_audio_url"] is None
        assert isinstance(item["bols"], list)
        assert len(item["bols"]) > 0
        assert "id" in item
        assert "taal" in item
        assert "tempo" in item
        assert "difficulty" in item
        assert "duration_seconds" in item
        assert "skill_focus" in item


def test_compositions_are_ordered_by_name(client: TestClient):
    response = client.get("/api/compositions")
    body = response.json()
    names = [item["name"] for item in body]
    assert names == sorted(names)


def test_seed_compositions_is_idempotent():
    # Use an isolated in-memory database so this test doesn't depend
    # on ordering relative to the other tests in this file.
    engine = create_engine(
        "sqlite:///:memory:", connect_args={"check_same_thread": False}
    )
    TestSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestSession()
    try:
        # Call seed_compositions three times, simulating three
        # separate app startups against the same database.
        seed_compositions(db)
        seed_compositions(db)
        seed_compositions(db)

        count = db.query(Composition).count()
        assert count == len(COMPOSITIONS)

        names = {row[0] for row in db.query(Composition.name).all()}
        assert names == EXPECTED_NAMES
    finally:
        db.close()