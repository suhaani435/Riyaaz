
import { useCallback, useRef, useState } from "react";
import { transcribeRecording } from "../lib/api";
import type { TranscriptionResponse } from "../types/api";

export type BolRecognitionPhase =
    | "idle"
    | "transcribing"
    | "complete"
    | "error";

export interface UseBolRecognitionResult {
    phase: BolRecognitionPhase;
    result: TranscriptionResponse | null;
    errorMessage: string | null;

    /**
     * Uploads the real recorded Blob and runs real Sarvam STT
     * + Kathak bol recognition against it.
     */
    transcribe: (
        blob: Blob,
        vocabulary?: string[],
    ) => Promise<TranscriptionResponse | null>;

    reset: () => void;
}

/**
 * useBolRecognition
 *
 * Phase 5: SARVAM AI STT + KATHAK BOL RECOGNITION
 *
 * Bridges a quality-approved recording Blob to the backend's
 * real Sarvam transcription + bol-recognition endpoint.
 *
 * This hook owns only React state and the async request.
 * The returned transcript and recognized bols come from the
 * actual submitted recording.
 */
export function useBolRecognition(): UseBolRecognitionResult {
    const [phase, setPhase] =
        useState<BolRecognitionPhase>("idle");

    const [result, setResult] =
        useState<TranscriptionResponse | null>(null);

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    // Prevents an old request from updating the UI after
    // the student has started a new recording.
    const requestIdRef = useRef(0);

    const transcribe = useCallback(
        async (
            blob: Blob,
            vocabulary?: string[],
        ): Promise<TranscriptionResponse | null> => {
            const requestId = ++requestIdRef.current;

            setPhase("transcribing");
            setErrorMessage(null);
            setResult(null);

            try {
                const transcription =
                    await transcribeRecording(
                        blob,
                        vocabulary,
                    );

                // Ignore stale responses.
                if (requestIdRef.current !== requestId) {
                    return null;
                }

                setResult(transcription);
                setPhase("complete");

                return transcription;
            } catch (err: unknown) {
                if (requestIdRef.current !== requestId) {
                    return null;
                }

                const message =
                    err instanceof Error
                        ? err.message
                        : "Bol recognition failed. Please try again.";

                setErrorMessage(message);
                setPhase("error");

                return null;
            }
        },
        [],
    );

    const reset = useCallback(() => {
        requestIdRef.current++;

        setPhase("idle");
        setResult(null);
        setErrorMessage(null);
    }, []);

    return {
        phase,
        result,
        errorMessage,
        transcribe,
        reset,
    };
}

export default useBolRecognition;
