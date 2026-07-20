from fastapi import FastAPI

from riyaaz_api.modules.system.presentation.routes import router as system_router


def create_app() -> FastAPI:
    """Create the HTTP application and compose its presentation modules."""
    app = FastAPI(title="RIYAAZ API", version="0.1.0")
    app.include_router(system_router, prefix="/api/v1")
    return app


app = create_app()
