import { SearchResponse, VideoSearchResponse, ResultItem } from "./types";

const MOCK_RESULTS: ResultItem[] = [
  {
    video_id: "dQw4w9WgXcQ",
    title: "Pandit Birju Maharaj — Teentaal Drut Laya Tukda Demonstration",
    channel_title: "Kathak Kendra Archive",
    thumbnail_url: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&auto=format&fit=crop&q=60",
    snippet: "Dha Tin Tin Ta Ta Dhin Dhin Dha — demonstrating the crisp tatkar footwork and the chakkardar tukda finish on Sam.",
    matched_term: "tukda",
    timestamp_seconds: 135,
    watch_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=135s",
    match_score: 0.96,
    result_id: 1,
  },
  {
    video_id: "example2",
    title: "Saswati Sen — Abhinaya & Hasta Mudra Precision in Thaat",
    channel_title: "Kalashram Classical",
    thumbnail_url: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&auto=format&fit=crop&q=60",
    snippet: "Opening with Pataka and Ardhachandra mudras to portray the rising moon and serene sthayi bhava.",
    matched_term: "mudra",
    timestamp_seconds: 240,
    watch_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=240s",
    match_score: 0.91,
    result_id: 2,
  },
  {
    video_id: "example3",
    title: "Ustad Zakir Hussain & Birju Maharaj — Jugalbandi in Jhaptaal",
    channel_title: "Sangeet Natak Akademi",
    thumbnail_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=60",
    snippet: "The rhythmic dialogue between tabla and padhant: Dhi Na Dhi Dhi Na leading to a 3-tier Tihai.",
    matched_term: "tihai",
    timestamp_seconds: 432,
    watch_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=432s",
    match_score: 0.88,
    result_id: 3,
  }
];

function getSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  const key = "riyaaz_session_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export async function searchTerm(query: string, guru?: string): Promise<SearchResponse> {
  try {
    const res = await fetch("/api/v1/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, guru: guru || null, session_id: getSessionId() }),
    });
    if (res.ok) {
      return (await res.json()) as SearchResponse;
    }
  } catch {
    // fallback
  }

  const filtered = MOCK_RESULTS.filter((r) => {
    const matchQuery =
      r.snippet.toLowerCase().includes(query.toLowerCase()) ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes("tukda") ||
      query.toLowerCase().includes("mudra") ||
      query.toLowerCase().includes("taal") ||
      query.toLowerCase().includes("birju");
    const matchGuru = !guru || (r.channel_title && r.channel_title.toLowerCase().includes(guru.toLowerCase()));
    return matchQuery && matchGuru;
  });

  return {
    query_id: 1,
    normalized_term: query,
    matched_variations: [query, `${query}s`, `shudh ${query}`],
    results: filtered.length > 0 ? filtered : MOCK_RESULTS,
    message: filtered.length > 0 ? null : "Showing recommended master performances",
  };
}

export async function searchVideo(url: string, term?: string): Promise<VideoSearchResponse> {
  try {
    const res = await fetch("/api/v1/search/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, term: term || null, session_id: getSessionId() }),
    });
    if (res.ok) {
      return (await res.json()) as VideoSearchResponse;
    }
  } catch {
    // fallback
  }

  return {
    query_id: 2,
    video: {
      video_id: "dQw4w9WgXcQ",
      title: "Kathak Masterclass & Performance Composition",
      channel_title: "Kathak Kendra Archive",
      thumbnail_url: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&auto=format&fit=crop&q=60",
      watch_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    transcript_available: true,
    results: MOCK_RESULTS.slice(0, 2),
    message: null,
  };
}

export function logClick(
  videoId: string,
  timestampSeconds: number,
  queryId?: number | null,
  resultId?: number | null,
) {
  // best effort
}

export function logFeedback(
  rating: number,
  queryId?: number | null,
  resultId?: number | null,
  comment?: string,
) {
  // best effort
}
