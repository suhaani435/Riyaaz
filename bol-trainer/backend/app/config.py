"""
Application configuration.

Phase 5: SARVAM AI STT + KATHAK BOL RECOGNITION
Adds Sarvam AI settings (API key + endpoint/model/mode/language
knobs) alongside the existing DB/CORS config. Every Sarvam-related
value is centralized here rather than scattered across
sarvam_client.py or main.py, the same convention the frontend's
thresholds.ts follows for audio-quality constants.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # SQLite file lives inside backend/ during local development.
    database_url: str = "sqlite:///./riyaaz.db"

    # Vite's default dev server ports.
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # --- Sarvam AI (Phase 5) -------------------------------------------
    # Left unset by default. Never log this value. When unset, the
    # /api/practice/transcribe endpoint returns a clear 503 rather than
    # silently failing or fabricating a transcript.
    sarvam_api_key: str | None = None

    sarvam_api_base_url: str = "https://api.sarvam.ai"

    # saaras:v3 is the current recommended model per Sarvam's docs
    # (saaras:v4 also exists; kept configurable via env if needed).
    sarvam_stt_model: str = "saaras:v3"

    # "translit" romanizes the transcript (e.g. "dha ta ka thunga"),
    # which is far easier to match against our Roman-script bol
    # vocabulary than Devanagari output from "transcribe" mode.
    sarvam_stt_mode: str = "translit"

    # Kathak padhant bols are chanted with Hindi/Sanskrit-origin
    # phonetics, so hi-IN is a reasonable default. This is a starting
    # heuristic, not a verified claim about every student's speech —
    # override via env if a different language fits better.
    sarvam_stt_language_code: str = "hi-IN"

    # REST endpoint is documented for short (<30s) clips; all seeded
    # compositions are well under that, but this keeps a check anchored
    # in this file, not scattered elsewhere.
    max_upload_bytes: int = 15 * 1024 * 1024  # 15 MB


@lru_cache
def get_settings() -> Settings:
    return Settings()