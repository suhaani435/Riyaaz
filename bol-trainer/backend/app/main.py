"""
Riyaaz AI Bol Trainer — Backend entrypoint.

Phase 5: SARVAM AI STT + KATHAK BOL RECOGNITION
Exposes:
    GET  /api/health
    GET  /api/compositions
    POST /api/practice/transcribe

No bol matching against an expected sequence, no performance/
pronunciation scoring, and no persisted recordings or transcripts
exist yet — those are later phases.
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.bol_recognition import recognize_bols
from app.config import get_settings
from app.database import Base, SessionLocal, engine, get_db
from app.models import Composition
from app.sarvam_client import SarvamAPIError, transcribe_audio
from app.schemas import CompositionOut, RecognizedBolTokenOut, TranscriptionOut
from app.seed import seed_compositions

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Create tables (if not already present) and seed compositions
    # idempotently on every startup.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_compositions(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Riyaaz AI Bol Trainer — API",
    description="Backend for the Riyaaz AI Bol Trainer (Kathak padhant practice).",
    version="0.5.0",
    lifespan=lifespan,
)

# Local dev CORS: allow the Vite frontend to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    """
    Basic liveness/health check.

    Returns static, non-fabricated status information only.
    """
    return {
        "status": "ok",
        "service": "riyaaz-bol-trainer-backend",
        "version": app.version,
    }


@app.get("/api/compositions", response_model=list[CompositionOut])
def list_compositions(db: Session = Depends(get_db)) -> list[Composition]:
    """
    Return all seeded compositions, ordered by name.

    Each composition's reference_audio_url is null until real
    reference recordings exist — the frontend must not fake playback.
    """
    return db.query(Composition).order_by(Composition.name).all()


@app.post("/api/practice/transcribe", response_model=TranscriptionOut)
async def transcribe_practice_recording(file: UploadFile = File(...)) -> TranscriptionOut:
    """
    Accepts a real recorded audio file (the Blob produced by the
    frontend's Phase 3 recorder — WebM/MP4/etc., no transcoding
    needed), sends it to Sarvam AI's speech-to-text API, and returns
    the real transcript plus token-by-token bol recognition over it.

    Nothing is persisted: the audio bytes are held in memory only for
    the duration of the outbound request to Sarvam, then discarded.
    This endpoint does not compare recognized bols against any
    specific composition's expected sequence, and does not produce a
    correctness or performance score — see Phase 6 for that.
    """
    audio_bytes = await file.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="No audio data was received.")
    if len(audio_bytes) > settings.max_upload_bytes:
        raise HTTPException(status_code=413, detail="Recording is too large to transcribe.")

    async with httpx.AsyncClient() as client:
        try:
            result = await transcribe_audio(
                client=client,
                settings=settings,
                audio_bytes=audio_bytes,
                filename=file.filename or "recording.webm",
                content_type=file.content_type or "application/octet-stream",
            )
        except SarvamAPIError as exc:
            raise HTTPException(status_code=exc.status_hint, detail=str(exc)) from exc

    recognized = recognize_bols(result.transcript)

    return TranscriptionOut(
        request_id=result.request_id,
        transcript=result.transcript,
        language_code=result.language_code,
        recognized_bols=[
            RecognizedBolTokenOut(
                raw_token=token.raw_token,
                matched_bol=token.matched_bol,
                match_confidence=token.match_confidence,
            )
            for token in recognized
        ],
    )