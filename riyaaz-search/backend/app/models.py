import datetime as dt

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, Text, DateTime
)
from sqlalchemy.orm import relationship

from .database import Base


def now():
    return dt.datetime.utcnow()


class Video(Base):
    __tablename__ = "videos"

    id = Column(String, primary_key=True)  # YouTube video id
    title = Column(String, nullable=False)
    channel_title = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    published_at = Column(String, nullable=True)
    transcript_fetched_at = Column(DateTime, nullable=True)
    transcript_available = Column(Boolean, nullable=True)  # None = not yet checked
    created_at = Column(DateTime, default=now)

    segments = relationship("TranscriptSegment", back_populates="video", cascade="all, delete-orphan")


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_id = Column(String, ForeignKey("videos.id"), nullable=False, index=True)
    start_seconds = Column(Float, nullable=False)
    duration_seconds = Column(Float, nullable=True)
    text = Column(Text, nullable=False)

    video = relationship("Video", back_populates="segments")


class KathakTerm(Base):
    __tablename__ = "kathak_terms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    canonical = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=True)  # e.g. composition, technique
    description = Column(String, nullable=True)

    variations = relationship("TermVariation", back_populates="term", cascade="all, delete-orphan")


class TermVariation(Base):
    __tablename__ = "term_variations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    term_id = Column(Integer, ForeignKey("kathak_terms.id"), nullable=False, index=True)
    variation = Column(String, nullable=False, index=True)

    term = relationship("KathakTerm", back_populates="variations")


class SearchQuery(Base):
    __tablename__ = "search_queries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=True, index=True)
    query_type = Column(String, nullable=False)  # 'term' | 'video_url'
    raw_query = Column(String, nullable=True)
    normalized_term = Column(String, nullable=True)
    guru_filter = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    result_count = Column(Integer, default=0)
    succeeded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)


class SearchResultLog(Base):
    __tablename__ = "search_result_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query_id = Column(Integer, ForeignKey("search_queries.id"), nullable=False, index=True)
    video_id = Column(String, ForeignKey("videos.id"), nullable=False)
    timestamp_seconds = Column(Float, nullable=False)
    match_score = Column(Float, nullable=True)
    rank_position = Column(Integer, nullable=True)
    snippet = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now)


class ClickLog(Base):
    __tablename__ = "click_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=True, index=True)
    query_id = Column(Integer, ForeignKey("search_queries.id"), nullable=True)
    result_id = Column(Integer, ForeignKey("search_result_logs.id"), nullable=True)
    video_id = Column(String, nullable=False)
    timestamp_seconds = Column(Float, nullable=False)
    created_at = Column(DateTime, default=now)


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, nullable=True, index=True)
    query_id = Column(Integer, ForeignKey("search_queries.id"), nullable=True)
    result_id = Column(Integer, ForeignKey("search_result_logs.id"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1 = not helpful, 5 = helpful
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=now)
