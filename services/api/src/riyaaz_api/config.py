"""Application settings validated at startup.

All configuration enters the application through this module. Environment
variables are the canonical source; a ``.env`` file is loaded as a convenience
for local development but must never be committed.
"""

from enum import StrEnum
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(StrEnum):
    """Deployment environment selector."""

    LOCAL = "local"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Validated application settings.

    Pydantic Settings reads values from the process environment and, when
    present, a ``.env`` file at the API service root.  Missing required values
    cause a startup error with a clear message.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Core ---
    environment: Environment = Environment.LOCAL
    log_level: str = "INFO"

    # --- Database ---
    database_url: str = Field(
        ...,
        description="Async PostgreSQL connection string (postgresql+asyncpg://...).",
    )

    # --- CORS ---
    cors_origins: Annotated[list[str], Field(default_factory=list)]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, value: object) -> list[str]:
        """Accept a comma-separated string or an already-parsed list."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return list(value)  # type: ignore[arg-type]

    # --- Supabase (placeholder for Phase 1) ---
    supabase_url: str = ""
    supabase_anon_key: str = ""
