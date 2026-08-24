from typing import List, Optional, Dict

from youtube_transcript_api import YouTubeTranscriptApi
from sqlalchemy.orm import Session

from .models import Video, TranscriptSegment
from . import youtube_client


def get_or_fetch_video(db: Session, video_id: str, hint: Optional[Dict] = None) -> Video:
    video = db.get(Video, video_id)
    if video:
        return video

    meta = hint or youtube_client.fetch_video_metadata(video_id) or {}
    video = Video(
        id=video_id,
        title=meta.get("title") or "Untitled",
        channel_title=meta.get("channel_title"),
        thumbnail_url=meta.get("thumbnail_url") or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        published_at=meta.get("published_at"),
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def ensure_transcript(db: Session, video: Video) -> bool:
    """Fetch + cache transcript segments for a video if not already done.
    Returns True if a usable transcript exists. Never raises -- any
    transcript-fetch failure (disabled captions, private video, region
    lock, etc.) is treated as 'no transcript', not an error."""
    if video.transcript_available is not None:
        return bool(video.transcript_available)

    try:
        raw = YouTubeTranscriptApi.get_transcript(video.id, languages=["en", "en-IN", "hi"])
    except Exception:
        video.transcript_available = False
        db.add(video)
        db.commit()
        return False

    for seg in raw:
        db.add(TranscriptSegment(
            video_id=video.id,
            start_seconds=seg.get("start", 0.0),
            duration_seconds=seg.get("duration", 0.0),
            text=seg.get("text", ""),
        ))
    video.transcript_available = True
    db.add(video)
    db.commit()
    return True


def get_segments(db: Session, video_id: str) -> List[TranscriptSegment]:
    return (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.video_id == video_id)
        .order_by(TranscriptSegment.start_seconds)
        .all()
    )
