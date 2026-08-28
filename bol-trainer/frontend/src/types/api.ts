
/**
 * Types for the Riyaaz backend API.
 *
 * Phase 5: adds the transcription and Kathak bol-recognition
 * response shapes used after a recording passes the Phase 4
 * audio-quality gate.
 */

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export interface Composition {
  id: number;
  name: string;
  bols: string[];
  taal: string;
  tempo: string;
  difficulty: string;
  duration_seconds: number;
  skill_focus: string;
  /**
   * Null until a real reference recording exists.
   * Components must treat null as "no audio available".
   */
  reference_audio_url: string | null;
}

/**
 * One token returned by the Phase 5 bol-recognition pipeline.
 *
 * `text` is what appeared in the speech-to-text transcript.
 * `matched_bol` is the Kathak bol it was matched to, or null
 * when no suitable vocabulary match was found.
 */
export interface RecognizedBolToken {
  text: string;
  matched_bol: string | null;
  confidence: number;
  match_type: "exact" | "fuzzy" | "unmatched" | string;
}

/**
 * Response returned by POST /api/practice/transcribe.
 */
export interface TranscriptionResponse {
  transcript: string;
  recognized_bols: RecognizedBolToken[];
}
