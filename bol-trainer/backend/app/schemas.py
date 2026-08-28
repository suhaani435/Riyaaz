"""
Pydantic schemas.

Phase 2: SELECT BOL -> LISTEN
Adds CompositionOut, the response shape for GET /api/compositions.
"""

from pydantic import BaseModel, ConfigDict, field_validator


class CompositionOut(BaseModel):
    """
    API response shape for a single composition.

    `bols` is stored on the model as a comma-separated string
    (e.g. "Ta,Thai,Thai,Tat") and is exposed here as a list of
    individual bol tokens, since that's what the frontend notation
    component needs to render.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    bols: list[str]
    taal: str
    tempo: str
    difficulty: str
    duration_seconds: int
    skill_focus: str
    reference_audio_url: str | None

    @field_validator("bols", mode="before")
    @classmethod
    def split_bols(cls, value: object) -> list[str]:
        if isinstance(value, str):
            return [token.strip() for token in value.split(",") if token.strip()]
        return value  # already a list (e.g. constructed directly in tests)


class RecognizedBolTokenOut(BaseModel):
    """
    One transcript word mapped (or not) to a canonical bol.

    `match_confidence` is a lexical string-similarity score between
    the transcribed word and the matched bol's spelling — it is NOT a
    pronunciation, clarity, or performance score. It says nothing
    about how well the student said anything, only how closely the
    ASR's text output resembles a known bol.
    """

    model_config = ConfigDict(from_attributes=True)

    raw_token: str
    matched_bol: str | None
    match_confidence: float


class TranscriptionOut(BaseModel):
    """
    Response shape for POST /api/practice/transcribe.

    Phase 5: SARVAM AI STT + KATHAK BOL RECOGNITION
    `transcript` is Sarvam's real (romanized) output for the actual
    submitted audio. `recognized_bols` is the token-by-token bol
    recognition over that transcript. There is no comparison here
    against a specific composition's expected bol sequence, and no
    correctness/performance score — that's Phase 6.
    """

    request_id: str | None
    transcript: str
    language_code: str | None
    recognized_bols: list[RecognizedBolTokenOut]