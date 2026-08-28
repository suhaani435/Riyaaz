import { useCallback, useEffect, useRef, useState } from "react";
import type { AudioRecorderError } from "../lib/audio/recorder";
import { AudioRecorderService, isRecordingSupported } from "../lib/audio/recorder";
import type { CapturedRecording, CountdownDisplayValue, RecorderPhase } from "../lib/audio/types";

const COUNTDOWN_STEP_MS = 900;
const GO_HOLD_MS = 500;

export interface UseAudioRecorderResult {
    phase: RecorderPhase;
    countdownValue: CountdownDisplayValue | null;
    elapsedSeconds: number;
    analyserNode: AnalyserNode | null;
    recording: CapturedRecording | null;
    errorMessage: string | null;
    /** Kicks off countdown -> permission -> recording. Also used to retry after an error or re-record. */
    startPractice: () => void;
    stopRecording: () => void;
}

/**
 * useAudioRecorder
 *
 * Phase 3: REAL MICROPHONE RECORDING
 * Owns the practice-recording state machine:
 *
 *   idle -> countdown -> requesting_permission -> recording -> stopping -> captured
 *
 * with permission_denied / no_microphone / unsupported_browser /
 * recording_error as explicit error phases at any point along the
 * way. All actual microphone/MediaRecorder work is delegated to
 * AudioRecorderService; this hook only owns React state, timers, and
 * the AnalyserNode used for the live waveform.
 *
 * Per the spec, the countdown (3-2-1-GO) always finishes fully
 * before microphone permission is even requested, and real recording
 * only ever starts after that permission is granted — never before.
 */
export function useAudioRecorder(): UseAudioRecorderResult {
    const [phase, setPhase] = useState<RecorderPhase>("idle");
    const [countdownValue, setCountdownValue] = useState<CountdownDisplayValue | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
    const [recording, setRecording] = useState<CapturedRecording | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const serviceRef = useRef<AudioRecorderService | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const timersRef = useRef<number[]>([]);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    if (!serviceRef.current) {
        serviceRef.current = new AudioRecorderService();
    }

    const clearTimers = useCallback(() => {
        timersRef.current.forEach((id) => window.clearTimeout(id));
        timersRef.current = [];
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const releaseAudioContext = useCallback(() => {
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => undefined);
            audioContextRef.current = null;
        }
        setAnalyserNode(null);
    }, []);

    const fullReset = useCallback(() => {
        clearTimers();
        serviceRef.current?.cleanup();
        releaseAudioContext();
        setCountdownValue(null);
        setElapsedSeconds(0);
        setRecording(null);
        setErrorMessage(null);
    }, [clearTimers, releaseAudioContext]);

    // Release the microphone and clean up on unmount.
    useEffect(() => {
        return () => {
            fullReset();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUnexpectedStreamEnd = useCallback(() => {
        setPhase((current) => (current === "recording" || current === "stopping" ? "recording_error" : current));
        setErrorMessage("Recording could not be completed. Please try again.");
        clearTimers();
        serviceRef.current?.cleanup();
        releaseAudioContext();
    }, [clearTimers, releaseAudioContext]);

    const beginRecording = useCallback(async () => {
        setPhase("requesting_permission");
        setErrorMessage(null);

        try {
            const stream = await serviceRef.current!.requestMicrophoneStream();
            serviceRef.current!.prepareRecorder(stream);

            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 1024;
            source.connect(analyser);
            audioContextRef.current = audioContext;
            setAnalyserNode(analyser);

            serviceRef.current!.start(handleUnexpectedStreamEnd);
            startTimeRef.current = Date.now();
            setElapsedSeconds(0);
            setPhase("recording");

            intervalRef.current = window.setInterval(() => {
                setElapsedSeconds((Date.now() - startTimeRef.current) / 1000);
            }, 200);
        } catch (err) {
            serviceRef.current?.cleanup();
            releaseAudioContext();
            const classified: AudioRecorderError =
                err && typeof err === "object" && "kind" in err
                    ? (err as AudioRecorderError)
                    : { kind: "recording_error", message: "Recording could not be completed. Please try again." };
            setErrorMessage(classified.message);
            setPhase(classified.kind);
        }
    }, [handleUnexpectedStreamEnd, releaseAudioContext]);

    const startPractice = useCallback(() => {
        fullReset();

        if (!isRecordingSupported()) {
            setPhase("unsupported_browser");
            setErrorMessage("Your browser does not support microphone recording.");
            return;
        }

        setPhase("countdown");
        setCountdownValue(3);

        const step2 = window.setTimeout(() => setCountdownValue(2), COUNTDOWN_STEP_MS);
        const step1 = window.setTimeout(() => setCountdownValue(1), COUNTDOWN_STEP_MS * 2);
        const stepGo = window.setTimeout(() => setCountdownValue("go"), COUNTDOWN_STEP_MS * 3);
        const stepStart = window.setTimeout(() => {
            setCountdownValue(null);
            void beginRecording();
        }, COUNTDOWN_STEP_MS * 3 + GO_HOLD_MS);

        timersRef.current = [step2, step1, stepGo, stepStart];
    }, [beginRecording, fullReset]);

    const stopRecording = useCallback(() => {
        if (phase !== "recording") return;
        setPhase("stopping");
        clearTimers();

        serviceRef
            .current!.stop()
            .then((captured) => {
                releaseAudioContext();
                setRecording(captured);
                setPhase("captured");
            })
            .catch((err: unknown) => {
                const message =
                    err && typeof err === "object" && "message" in err
                        ? String((err as { message: unknown }).message)
                        : "Recording could not be completed. Please try again.";
                setErrorMessage(message);
                setPhase("recording_error");
            });
    }, [phase, clearTimers, releaseAudioContext]);

    return {
        phase,
        countdownValue,
        elapsedSeconds,
        analyserNode,
        recording,
        errorMessage,
        startPractice,
        stopRecording,
    };
}