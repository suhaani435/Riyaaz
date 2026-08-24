from typing import Optional

from sqlalchemy.orm import Session

from . import youtube_client, transcript_service, normalization
from .models import SearchQuery, SearchResultLog
from .config import get_settings

settings = get_settings()

CONTEXT_PAD = 1  # neighboring caption segments stitched into a readable snippet


def _snippet_for(segments, index: int) -> str:
    lo = max(0, index - CONTEXT_PAD)
    hi = min(len(segments), index + CONTEXT_PAD + 1)
    return " ".join(s.text.strip() for s in segments[lo:hi]).strip()


def search_by_term(db: Session, raw_query: str, guru: Optional[str], session_id: Optional[str]):
    normalized = normalization.normalize_query_term(db, raw_query)
    variations = normalization.all_variations_for(db, normalized.canonical) if normalized else [raw_query.lower()]

    yt_query = f"{normalized.canonical} kathak" if normalized else f"{raw_query} kathak"
    if guru:
        yt_query += f" {guru}"

    candidates = youtube_client.search_videos(yt_query, max_results=settings.max_candidate_videos)

    query_row = SearchQuery(
        session_id=session_id,
        query_type="term",
        raw_query=raw_query,
        normalized_term=normalized.canonical if normalized else raw_query,
        guru_filter=guru,
    )
    db.add(query_row)
    db.commit()
    db.refresh(query_row)

    all_results = []
    for cand in candidates:
        video = transcript_service.get_or_fetch_video(db, cand["video_id"], hint=cand)
        has_transcript = transcript_service.ensure_transcript(db, video)
        if not has_transcript:
            continue

        segments = transcript_service.get_segments(db, video.id)
        guru_bonus = 15.0 if guru and guru.lower() in (video.channel_title or "").lower() else 0.0

        video_matches = []
        for i, seg in enumerate(segments):
            score = normalization.text_matches_term(seg.text, variations)
            if score is None:
                continue
            video_matches.append((score, i, seg))

        video_matches.sort(key=lambda m: m[0], reverse=True)
        for score, i, seg in video_matches[:2]:  # up to 2 best hits per video
            all_results.append({
                "video": video,
                "score": score + guru_bonus,
                "timestamp_seconds": seg.start_seconds,
                "snippet": _snippet_for(segments, i),
            })

    all_results.sort(key=lambda r: r["score"], reverse=True)
    top_results = all_results[:12]

    response_items = []
    for rank, r in enumerate(top_results, start=1):
        video = r["video"]
        log = SearchResultLog(
            query_id=query_row.id,
            video_id=video.id,
            timestamp_seconds=r["timestamp_seconds"],
            match_score=r["score"],
            rank_position=rank,
            snippet=r["snippet"],
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        response_items.append({
            "video_id": video.id,
            "title": video.title,
            "channel_title": video.channel_title,
            "thumbnail_url": video.thumbnail_url,
            "snippet": r["snippet"],
            "matched_term": normalized.canonical if normalized else raw_query,
            "timestamp_seconds": r["timestamp_seconds"],
            "watch_url": f"https://www.youtube.com/watch?v={video.id}&t={int(r['timestamp_seconds'])}s",
            "match_score": round(r["score"], 1),
            "result_id": log.id,
        })

    query_row.result_count = len(response_items)
    query_row.succeeded = len(response_items) > 0
    db.add(query_row)
    db.commit()

    return query_row, normalized, response_items


def search_in_video(db: Session, url: str, term: Optional[str], session_id: Optional[str]):
    video_id = youtube_client.extract_video_id(url)
    query_row = SearchQuery(
        session_id=session_id,
        query_type="video_url",
        raw_query=term,
        video_url=url,
    )
    db.add(query_row)
    db.commit()
    db.refresh(query_row)

    if not video_id:
        query_row.succeeded = False
        db.add(query_row)
        db.commit()
        return query_row, None, False, []

    video = transcript_service.get_or_fetch_video(db, video_id)
    has_transcript = transcript_service.ensure_transcript(db, video)

    if not has_transcript:
        query_row.succeeded = False
        db.add(query_row)
        db.commit()
        return query_row, video, False, []

    segments = transcript_service.get_segments(db, video.id)
    results = []

    if term:
        normalized = normalization.normalize_query_term(db, term)
        variations = normalization.all_variations_for(db, normalized.canonical)
        for i, seg in enumerate(segments):
            score = normalization.text_matches_term(seg.text, variations)
            if score is None:
                continue
            results.append((score, normalized.canonical, i))
    else:
        for kterm in normalization.all_known_terms(db):
            variations = [v.variation for v in kterm.variations] or [kterm.canonical]
            for i, seg in enumerate(segments):
                score = normalization.text_matches_term(seg.text, variations)
                if score is None:
                    continue
                results.append((score, kterm.canonical, i))

    results.sort(key=lambda r: r[0], reverse=True)
    top = results[:15]

    response_items = []
    for rank, (score, matched_term, i) in enumerate(top, start=1):
        seg = segments[i]
        log = SearchResultLog(
            query_id=query_row.id,
            video_id=video.id,
            timestamp_seconds=seg.start_seconds,
            match_score=score,
            rank_position=rank,
            snippet=_snippet_for(segments, i),
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        response_items.append({
            "video_id": video.id,
            "title": video.title,
            "channel_title": video.channel_title,
            "thumbnail_url": video.thumbnail_url,
            "snippet": _snippet_for(segments, i),
            "matched_term": matched_term,
            "timestamp_seconds": seg.start_seconds,
            "watch_url": f"https://www.youtube.com/watch?v={video.id}&t={int(seg.start_seconds)}s",
            "match_score": round(score, 1),
            "result_id": log.id,
        })

    query_row.result_count = len(response_items)
    query_row.succeeded = len(response_items) > 0
    db.add(query_row)
    db.commit()

    return query_row, video, True, response_items
