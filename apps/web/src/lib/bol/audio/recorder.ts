import type { CapturedRecording } from "@/lib/bol/audio/types";

/**
 * AudioRecorderService
 *
 * Phase 3: REAL MICROPHONE RECORDING
 * The only module that talks directly to navigator.mediaDevices and
 * MediaRecorder. UI components never touch these browser APIs
 * directly — they go through this service, which is the single place
 * responsible for:
 *
 * - requesting microphone permission
 * - creating the MediaRecorder and picking a supported MIME type
 * - starting/stopping recording and collecting real audio chunks
 * - building the final Blob
 * - releasing MediaStream tracks
 * - surfacing permission/device/recording errors
 * - detecting unexpected stream termination (e.g. the OS revokes mic
 *   access, or a Bluetooth headset disconnects mid-recording)
 *
 * Nothing in this file simulates microphone input or generates fake
 * audio. Every value returned to the caller comes from a real
 * MediaRecorder/MediaStream callback.
 */

export interface AudioRecorderError {
    kind: "permission_denied" | "no_microphone" | "unsupported_browser" | "recording_error";
    message: string;
}

/**
 * Candidate MediaRecorder MIME types, in preference order. Chrome/
 * Firefox/Edge support opus-in-webm; Safari (as of writing) only
 * supports audio/mp4. We never hard-code a single type — the first
 * one the current browser reports as supported wins.
 */
const CANDIDATE_MIME_TYPES = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
];

/** True only if this browser exposes everything needed to record. */
export function isRecordingSupported(): boolean {
    return (
        typeof navigator !== "undefined" &&
        !!navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function" &&
        typeof MediaRecorder !== "undefined"
    );
}

/**
 * Picks the first MediaRecorder MIME type this browser actually
 * supports, or null if none of the candidates are supported (or the
 * browser has no MediaRecorder at all).
 */
export function pickSupportedMimeType(): string | null {
    if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
        return null;
    }
    return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

function classifyGetUserMediaError(err: unknown): AudioRecorderError {
    const name = err instanceof DOMException ? err.name : "";

    if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
        return {
            kind: "permission_denied",
            message: "Microphone access is required to practice.",
        };
    }

    if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
        return {
            kind: "no_microphone",
            message: "No microphone was detected.",
        };
    }

    return {
        kind: "recording_error",
        message: "Recording could not be completed. Please try again.",
    };
}

export class AudioRecorderService {
    private stream: MediaStream | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private chunks: BlobPart[] = [];
    private mimeType: string | null = null;
    private startedAt = 0;
    private unexpectedEndHandler: (() => void) | null = null;

    /** Requests real microphone access. Throws a classified AudioRecorderError on failure. */
    async requestMicrophoneStream(): Promise<MediaStream> {
        if (!isRecordingSupported()) {
            throw {
                kind: "unsupported_browser",
                message: "Your browser does not support microphone recording.",
            } satisfies AudioRecorderError;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.stream = stream;
            return stream;
        } catch (err) {
            throw classifyGetUserMediaError(err);
        }
    }

    /**
     * Creates the MediaRecorder for an already-granted stream. Must be
     * called before start(). Throws if no supported MIME type exists.
     */
    prepareRecorder(stream: MediaStream): void {
        const mimeType = pickSupportedMimeType();
        if (!mimeType) {
            throw {
                kind: "unsupported_browser",
                message: "Your browser does not support microphone recording.",
            } satisfies AudioRecorderError;
        }

        this.mimeType = mimeType;
        this.chunks = [];
        this.mediaRecorder = new MediaRecorder(stream, { mimeType });

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) {
                this.chunks.push(event.data);
            }
        };
    }

    /**
     * Starts real recording. `onUnexpectedEnd` fires if any microphone
     * track ends on its own (device unplugged, OS revokes permission,
     * etc.) while we believe we're still recording.
     */
    start(onUnexpectedEnd: () => void): void {
        if (!this.mediaRecorder || !this.stream) {
            throw {
                kind: "recording_error",
                message: "Recording could not be completed. Please try again.",
            } satisfies AudioRecorderError;
        }

        this.unexpectedEndHandler = onUnexpectedEnd;
        this.stream.getTracks().forEach((track) => {
            track.addEventListener("ended", () => this.unexpectedEndHandler?.());
        });

        this.chunks = [];
        this.startedAt = Date.now();
        // A timeslice keeps ondataavailable firing periodically instead of
        // relying solely on the final flush at stop().
        this.mediaRecorder.start(250);
    }

    /**
     * Stops recording, assembles the real captured chunks into a Blob,
     * and releases the microphone tracks. Resolves with everything the
     * next phase needs (blob, mimeType, duration, size) without
     * uploading or persisting anything.
     */
    stop(): Promise<CapturedRecording> {
        const mediaRecorder = this.mediaRecorder;
        const mimeType = this.mimeType;
        const startedAt = this.startedAt;

        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            return Promise.reject({
                kind: "recording_error",
                message: "Recording could not be completed. Please try again.",
            } satisfies AudioRecorderError);
        }

        return new Promise((resolve, reject) => {
            mediaRecorder.onstop = () => {
                try {
                    const blob = new Blob(this.chunks, { type: mimeType ?? "audio/webm" });
                    const durationSeconds = Math.max(0, (Date.now() - startedAt) / 1000);
                    this.releaseStream();

                    resolve({
                        blob,
                        mimeType: mimeType ?? blob.type,
                        durationSeconds,
                        sizeBytes: blob.size,
                    });
                } catch {
                    reject({
                        kind: "recording_error",
                        message: "Recording could not be completed. Please try again.",
                    } satisfies AudioRecorderError);
                }
            };

            mediaRecorder.stop();
        });
    }

    private releaseStream(): void {
        this.stream?.getTracks().forEach((track) => track.stop());
        this.stream = null;
    }

    /** Safe to call any time, including when nothing is active. */
    cleanup(): void {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
            try {
                this.mediaRecorder.stop();
            } catch {
                // Already stopped or stopping — nothing to do.
            }
        }
        this.releaseStream();
        this.mediaRecorder = null;
        this.chunks = [];
        this.unexpectedEndHandler = null;
    }
}