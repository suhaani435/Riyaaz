"""
Idempotent seed data for compositions.

Phase 2: SELECT BOL -> LISTEN

These four compositions are placeholders built to spec (bols /
difficulty / duration / skill_focus / tempo / taal) — they are not
verified traditional repertoire. Edit COMPOSITIONS below once real,
verified compositions are available.

reference_audio_url is null for all of them: no reference recordings
exist yet, and none should be fabricated.
"""

from sqlalchemy.orm import Session

from app.models import Composition

COMPOSITIONS: list[dict] = [
    {
        "name": "Ta Thai Thai Tat",
        "bols": "Ta,Thai,Thai,Tat",
        "taal": "Teentaal",
        "tempo": "Madhya (medium)",
        "difficulty": "Beginner",
        "duration_seconds": 8,
        "skill_focus": "Basic bol articulation",
        "reference_audio_url": None,
    },
    {
        "name": "Dha Ta Ka Thunga",
        "bols": "Dha,Ta,Ka,Thunga",
        "taal": "Teentaal",
        "tempo": "Madhya (medium)",
        "difficulty": "Beginner",
        "duration_seconds": 8,
        "skill_focus": "Consonant clarity",
        "reference_audio_url": None,
    },
    {
        "name": "Tat Tat Thai",
        "bols": "Tat,Tat,Thai",
        "taal": "Teentaal",
        "tempo": "Vilambit (slow)",
        "difficulty": "Beginner",
        "duration_seconds": 6,
        "skill_focus": "Even spacing between bols",
        "reference_audio_url": None,
    },
    {
        "name": "Dig Dig Ta",
        "bols": "Dig,Dig,Ta",
        "taal": "Teentaal",
        "tempo": "Drut (fast)",
        "difficulty": "Intermediate",
        "duration_seconds": 5,
        "skill_focus": "Speed control",
        "reference_audio_url": None,
    },
]


def seed_compositions(db: Session) -> None:
    """
    Insert the seed compositions if they don't already exist.

    Idempotent by `name`: safe to call on every app startup, across
    any number of process restarts, without creating duplicates or
    overwriting existing rows.
    """
    existing_names = {row[0] for row in db.query(Composition.name).all()}

    for entry in COMPOSITIONS:
        if entry["name"] in existing_names:
            continue
        db.add(Composition(**entry))

    db.commit()