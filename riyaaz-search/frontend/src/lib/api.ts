import { SearchResponse, VideoSearchResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function getSessionId(): string {
  const key = 'riyaaz_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

export function searchTerm(query: string, guru?: string): Promise<SearchResponse> {
  return post('/api/search', { query, guru: guru || null, session_id: getSessionId() });
}

export function searchVideo(url: string, term?: string): Promise<VideoSearchResponse> {
  return post('/api/search/video', { url, term: term || null, session_id: getSessionId() });
}

export function logClick(videoId: string, timestampSeconds: number, queryId?: number | null, resultId?: number | null) {
  return post('/api/click', {
    video_id: videoId,
    timestamp_seconds: timestampSeconds,
    query_id: queryId ?? null,
    result_id: resultId ?? null,
    session_id: getSessionId(),
  }).catch(() => {});
}

export function logFeedback(rating: number, queryId?: number | null, resultId?: number | null, comment?: string) {
  return post('/api/feedback', {
    rating,
    query_id: queryId ?? null,
    result_id: resultId ?? null,
    comment: comment || null,
    session_id: getSessionId(),
  }).catch(() => {});
}
