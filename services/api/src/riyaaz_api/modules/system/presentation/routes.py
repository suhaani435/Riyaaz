from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["system"])


class HealthResponse(BaseModel):
    """Public liveness response contract."""

    status: Literal["ok"]


@router.get("/health", response_model=HealthResponse, summary="Report API liveness")
def get_health() -> HealthResponse:
    """Return an intentionally minimal response suitable for liveness probes."""
    return HealthResponse(status="ok")
