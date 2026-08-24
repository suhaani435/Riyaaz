import re
from typing import List, Optional, Dict

import httpx
from googleapiclient.discovery import build

from .config import get_settings

settings = get_settings()

YOUTUBE_ID_PATTERNS = [
    r"(?:v=|/videos/|embed/|youtu\.be/|/shorts/)([A-Za-z0-9_-]{11})",
]


def extract_video_id(url: str) -> Optional[str]:
    for pattern in YOUTUBE_ID_PATTERNS:
        m = re.search(pattern, url)
        if m:
            return m.group(1)
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", url.strip()):
        return url.strip()
    return None


def search_videos(query: str, max_results: int = 8) -> List[Dict]:
    """Search YouTube for candidate videos. Requires YOUTUBE_API_KEY."""
    if not settings.youtube_api_key:
        return []
    youtube = build("youtube", "v3", developerKey=settings.youtube_api_key)
    resp = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        maxResults=max_results,
        relevanceLanguage="en",
    ).execute()

    results = []
    for item in resp.get("items", []):
        vid = item["id"]["videoId"]
        snippet = item["snippet"]
        thumb = (
            snippet.get("thumbnails", {}).get("high")
            or snippet.get("thumbnails", {}).get("medium")
            or snippet.get("thumbnails", {}).get("default")
            or {}
        )
        results.append({
            "video_id": vid,
            "title": snippet.get("title"),
            "channel_title": snippet.get("channelTitle"),
            "thumbnail_url": thumb.get("url"),
            "published_at": snippet.get("publishedAt"),
        })
    return results


def fetch_video_metadata(video_id: str) -> Optional[Dict]:
    """Lightweight metadata via YouTube's public oEmbed endpoint -- no API
    key or quota needed. Used when a user pastes a specific link."""
    try:
        resp = httpx.get(
            "https://www.youtube.com/oembed",
            params={"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"},
            timeout=8.0,
        )
        if resp.status_code != 200:
            return None
        data = resp.json()
        return {
            "video_id": video_id,
            "title": data.get("title"),
            "channel_title": data.get("author_name"),
            "thumbnail_url": data.get("thumbnail_url"),
        }
    except httpx.HTTPError:
        return None
