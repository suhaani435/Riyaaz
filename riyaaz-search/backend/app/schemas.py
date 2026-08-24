from typing import Optional, List
from pydantic import BaseModel


class TermSearchRequest(BaseModel):
    query: str
    guru: Optional[str] = None
    session_id: Optional[str] = None


class VideoSearchRequest(BaseModel):
    url: str
    term: Optional[str] = None
    session_id: Optional[str] = None


class ResultItem(BaseModel):
    video_id: str
    title: str
    channel_title: Optional[str] = None
    thumbnail_url: Optional[str] = None
    snippet: str
    matched_term: str
    timestamp_seconds: float
    watch_url: str
    match_score: float
    result_id: Optional[int] = None


class SearchResponse(BaseModel):
    query_id: Optional[int] = None
    normalized_term: Optional[str] = None
    matched_variations: List[str] = []
    results: List[ResultItem] = []
    message: Optional[str] = None


class VideoInfo(BaseModel):
    video_id: str
    title: str
    channel_title: Optional[str] = None
    thumbnail_url: Optional[str] = None
    watch_url: str


class VideoSearchResponse(BaseModel):
    query_id: Optional[int] = None
    video: Optional[VideoInfo] = None
    transcript_available: bool = False
    results: List[ResultItem] = []
    message: Optional[str] = None


class ClickRequest(BaseModel):
    session_id: Optional[str] = None
    query_id: Optional[int] = None
    result_id: Optional[int] = None
    video_id: str
    timestamp_seconds: float


class FeedbackRequest(BaseModel):
    session_id: Optional[str] = None
    query_id: Optional[int] = None
    result_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None
