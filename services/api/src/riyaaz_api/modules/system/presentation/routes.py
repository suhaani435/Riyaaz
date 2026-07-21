"""System health and operational endpoints."""

from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from riyaaz_api.database import db_manager

router = APIRouter(tags=["system"])


class HealthResponse(BaseModel):
    """Public liveness response contract."""

    status: Literal["ok"]


class ReadinessResponse(BaseModel):
    """Public readiness response contract including dependency status."""

    status: Literal["ok", "degraded"]
    database: Literal["connected", "unavailable"]


@router.get("/health", response_model=HealthResponse, summary="Report API liveness")
def get_health() -> HealthResponse:
    """Return an intentionally minimal response suitable for liveness probes.

    This endpoint confirms the HTTP process is running.  It does not check
    downstream dependencies; use ``/health/ready`` for that.
    """
    return HealthResponse(status="ok")


@router.get(
    "/health/ready",
    response_model=ReadinessResponse,
    summary="Report API readiness including dependencies",
)
async def get_readiness(
    session: AsyncSession = Depends(db_manager.session),
) -> ReadinessResponse:
    """Verify the API can serve requests that depend on infrastructure.

    Executes a lightweight database probe.  Returns ``degraded`` status
    if any dependency is unreachable, but still responds with HTTP 200
    so orchestrators can distinguish between a crashed process and one
    with a recoverable downstream issue.
    """
    try:
        await session.execute(text("SELECT 1"))
        return ReadinessResponse(status="ok", database="connected")
    except Exception:
        return ReadinessResponse(status="degraded", database="unavailable")
