
/**
 * API client for the Riyaaz backend.
 *
 * Phase 5:
 * - Fetch compositions
 * - Send real recorded audio to the backend
 * - Receive Sarvam transcription + Kathak bol recognition
 */

import type {
  Composition,
  HealthResponse,
  TranscriptionResponse,
} from "../types/api";

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health");

  if (!response.ok) {
    throw new Error(
      `Health check failed with status ${response.status} `,
    );
  }

  return response.json() as Promise<HealthResponse>;
}

export async function fetchCompositions(): Promise<Composition[]> {
  const response = await fetch("/api/compositions");

  if (!response.ok) {
    throw new Error(
      `Failed to load compositions(status ${response.status})`,
    );
  }

  return response.json() as Promise<Composition[]>;
}

/**
 * Send a real browser recording to the Phase 5 transcription endpoint.
 *
 * The recording is uploaded as multipart/form-data.
 * WebM audio can be sent directly from the browser.
 */
export async function transcribeRecording(
  blob: Blob,
  vocabulary?: string[],
): Promise<TranscriptionResponse> {
  const formData = new FormData();

  const filename =
    blob.type === "audio/webm"
      ? "riyaaz-recording.webm"
      : "riyaaz-recording";

  formData.append("file", blob, filename);

  if (vocabulary && vocabulary.length > 0) {
    formData.append("vocabulary", vocabulary.join(","));
  }

  const response = await fetch(
    "/api/practice/transcribe",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    let detail = `Transcription failed with status ${response.status} `;

    try {
      const body = (await response.json()) as {
        detail?: string;
      };

      if (typeof body.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // Keep the generic error when the response isn't JSON.
    }

    throw new Error(detail);
  }

  return response.json() as Promise<TranscriptionResponse>;
}
