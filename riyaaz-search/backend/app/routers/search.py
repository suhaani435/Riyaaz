from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import schemas, search_service
from ..database import get_db

router = APIRouter(prefix="/api", tags=["search"])


@router.post("/search", response_model=schemas.SearchResponse)
def search_term(payload: schemas.TermSearchRequest, db: Session = Depends(get_db)):
    query_row, normalized, results = search_service.search_by_term(
        db, payload.query, payload.guru, payload.session_id
    )
    message = None
    if not results:
        message = "No matches found. Try a different spelling, or drop the guru filter."
    return schemas.SearchResponse(
        query_id=query_row.id,
        normalized_term=normalized.canonical if normalized else payload.query,
        matched_variations=normalized.matched_variations if normalized else [],
        results=results,
        message=message,
    )


@router.post("/search/video", response_model=schemas.VideoSearchResponse)
def search_video(payload: schemas.VideoSearchRequest, db: Session = Depends(get_db)):
    query_row, video, has_transcript, results = search_service.search_in_video(
        db, payload.url, payload.term, payload.session_id
    )

    if video is None:
        return schemas.VideoSearchResponse(
            query_id=query_row.id,
            video=None,
            transcript_available=False,
            results=[],
            message="That doesn't look like a valid YouTube link.",
        )

    video_info = schemas.VideoInfo(
        video_id=video.id,
        title=video.title,
        channel_title=video.channel_title,
        thumbnail_url=video.thumbnail_url,
        watch_url=f"https://www.youtube.com/watch?v={video.id}",
    )

    message = None
    if not has_transcript:
        message = "No transcript is available for this video, so it can't be searched yet."
    elif not results:
        message = "The transcript is available, but no Kathak terms were found in it."

    return schemas.VideoSearchResponse(
        query_id=query_row.id,
        video=video_info,
        transcript_available=has_transcript,
        results=results,
        message=message,
    )
