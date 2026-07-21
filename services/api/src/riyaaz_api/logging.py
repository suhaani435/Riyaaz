"""Structured logging configuration.

Produces JSON log output in deployed environments for machine consumption
and human-friendly console output during local development.  A correlation
ID is bound to every log entry emitted during a request lifecycle.
"""

import uuid
from collections.abc import Awaitable, Callable

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


def configure_logging(*, json_output: bool, log_level: str) -> None:
    """Set up structlog processors and output format.

    Args:
        json_output: ``True`` for JSON lines (staging/production),
            ``False`` for coloured console output (local development).
        log_level: Standard Python log level name (e.g. ``"INFO"``).
    """
    shared_processors: list[structlog.types.Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    if json_output:
        renderer: structlog.types.Processor = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer()

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.processors.format_exc_info,
            renderer,
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            structlog.stdlib.NAME_TO_LEVEL[log_level.lower()],
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(**initial_bindings: object) -> structlog.stdlib.BoundLogger:
    """Return a bound logger with optional initial context."""
    return structlog.get_logger(**initial_bindings)


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Attach a unique correlation ID to every request.

    The ID is added to the structlog context so all log entries within a
    request share the same identifier, and it is returned in the
    ``X-Correlation-ID`` response header for client-side tracing.
    """

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        correlation_id = request.headers.get(
            "X-Correlation-ID",
            str(uuid.uuid4()),
        )
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(correlation_id=correlation_id)

        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response
