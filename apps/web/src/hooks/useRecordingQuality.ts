import { useCallback, useRef, useState } from "react";
import { decodeRecordingToSamples } from "@/lib/bol/audio/decode";
import { evaluateRecordingQuality } from "@/lib/bol/audio/evaluate";
import { computeAudioQualityMeasurements } from "@/lib/bol/audio/measurements";
import type { RecordingQualityResult } from "@/lib/bol/audio/qualityTypes";
import type { CapturedRecording } from "@/lib/bol/audio/types";

export type RecordingQualityPhase = "idle" | "analyzing" | "done" | "error";

export interface UseRecordingQualityResult {
    phase: RecordingQualityPhase;
    result: RecordingQualityResult | null;
    errorMessage: string | null;
    /** Decodes the real captured Blob and runs the real quality calculations against it. */
    analyze: (recording: CapturedRecording) => void;
    reset: () => void;
}

/**
 * useRecordingQuality
 *
 * Phase 4: REAL AUDIO QUALITY ANALYSIS
 * Bridges the real Blob produced by Phase 3's useAudioRecorder to the
 * pure calculation modules in lib/audio. This hook owns only React
 * state (phase/result/error) and the async decode step — every
 * number in the resulting RecordingQualityResult comes from decoding
 * and measuring the actual recorded audio, never from a guess or a
 * placeholder value.
 */
export function useRecordingQuality(): UseRecordingQualityResult {
    const [phase, setPhase] = useState<RecordingQualityPhase>("idle");
    const [result, setResult] = useState<RecordingQualityResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Guards against a stale analysis from an earlier recording landing
    // after the student has already started a new one.
    const requestIdRef = useRef(0);

    const analyze = useCallback((recording: CapturedRecording) => {
        const requestId = ++requestIdRef.current;
        setPhase("analyzing");
        setErrorMessage(null);
        setResult(null);

        void decodeRecordingToSamples(recording.blob)
            .then(({ samples, sampleRate }) => {
                if (requestIdRef.current !== requestId) return;
                const measurements = computeAudioQualityMeasurements(samples, sampleRate);
                const quality = evaluateRecordingQuality(measurements);
                setResult(quality);
                setPhase("done");
            })
            .catch((err: unknown) => {
                if (requestIdRef.current !== requestId) return;
                const message = err instanceof Error ? err.message : "This recording could not be analyzed. Please try again.";
                setErrorMessage(message);
                setPhase("error");
            });
    }, []);

    const reset = useCallback(() => {
        requestIdRef.current++;
        setPhase("idle");
        setResult(null);
        setErrorMessage(null);
    }, []);

    return { phase, result, errorMessage, analyze, reset };
}