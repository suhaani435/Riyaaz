from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..models import ClickLog, Feedback

router = APIRouter(prefix="/api", tags=["feedback"])


@router.post("/click")
def log_click(payload: schemas.ClickRequest, db: Session = Depends(get_db)):
    row = ClickLog(
        session_id=payload.session_id,
        query_id=payload.query_id,
        result_id=payload.result_id,
        video_id=payload.video_id,
        timestamp_seconds=payload.timestamp_seconds,
    )
    db.add(row)
    db.commit()
    return {"ok": True}


@router.post("/feedback")
def log_feedback(payload: schemas.FeedbackRequest, db: Session = Depends(get_db)):
    row = Feedback(
        session_id=payload.session_id,
        query_id=payload.query_id,
        result_id=payload.result_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(row)
    db.commit()
    return {"ok": True}
