export interface ResultItem {
  video_id: string;
  title: string;
  channel_title?: string | null;
  thumbnail_url?: string | null;
  snippet: string;
  matched_term: string;
  timestamp_seconds: number;
  watch_url: string;
  match_score: number;
  result_id?: number | null;
}

export interface SearchResponse {
  query_id?: number | null;
  normalized_term?: string | null;
  matched_variations: string[];
  results: ResultItem[];
  message?: string | null;
}

export interface VideoInfo {
  video_id: string;
  title: string;
  channel_title?: string | null;
  thumbnail_url?: string | null;
  watch_url: string;
}

export interface VideoSearchResponse {
  query_id?: number | null;
  video: VideoInfo | null;
  transcript_available: boolean;
  results: ResultItem[];
  message?: string | null;
}
