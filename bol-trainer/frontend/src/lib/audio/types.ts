/**
 * Shared types for the Phase 3 microphone recording pipeline.
 *
 * Phase 3: REAL MICROPHONE RECORDING
 * These describe real captured audio and real recorder state only —
 * there is no "score" or "quality" shape here. Audio-quality analysis
 * is an explicitly later phase.
 */

/** The result of a completed, real microphone recording. */
export interface CapturedRecording {
    /** The actual recorded audio data. */
    blob: Blob;
    /** The MIME type MediaRecorder actually used for this recording. */
    mimeType: string;
    /** Wall-clock duration of the recording, in seconds. */
    durationSeconds: number;
    /** Size of the recorded Blob, in bytes. */
    sizeBytes: number;
}

export type RecorderPhase =
    | "idle"
    | "requesting_permission"
    | "countdown"
    | "recording"
    | "stopping"
    | "captured"
    | "permission_denied"
    | "no_microphone"
    | "unsupported_browser"
    | "recording_error";

/** 3, 2, 1, then "go" — never anything else. */
export type CountdownDisplayValue = 3 | 2 | 1 | "go";