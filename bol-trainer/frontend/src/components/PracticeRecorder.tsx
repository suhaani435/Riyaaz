
import { useEffect, useMemo, useState } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import {
    useRecordingQuality,
    type RecordingQualityPhase,
} from "../hooks/useRecordingQuality";
import { useBolRecognition } from "../hooks/useBolRecognition";
import type { Composition } from "../types/api";
import BolNotation from "./BolNotation";
import BolRecognitionResult from "./BolRecognitionResult";
import Countdown from "./Countdown";
import RecordingQuality from "./RecordingQuality";
import RecordingTimer from "./RecordingTimer";
import Waveform from "./Waveform";

const ERROR_FALLBACK_MESSAGES: Record<string, string> = {
    permission_denied: "Microphone access is required to practice.",
    no_microphone: "No microphone was detected.",
    unsupported_browser:
        "Your browser does not support microphone recording.",
    recording_error:
        "Recording could not be completed. Please try again.",
};

function announcementFor(phase: string): string | null {
    switch (phase) {
        case "requesting_permission":
            return "Requesting microphone access.";
        case "countdown":
            return "Get ready.";
        case "recording":
            return "Recording started.";
        case "stopping":
            return "Finishing recording.";
        case "captured":
            return "Recording captured.";
        default:
            return null;
    }
}

interface PracticeRecorderProps {
    composition: Composition;
}

export default function PracticeRecorder({
    composition,
}: PracticeRecorderProps) {
    const {
        phase,
        countdownValue,
        elapsedSeconds,
        analyserNode,
        recording,
        errorMessage,
        startPractice,
        stopRecording,
    } = useAudioRecorder();

    const {
        phase: qualityPhase,
        result: qualityResult,
        errorMessage: qualityError,
        analyze: analyzeQuality,
        reset: resetQuality,
    } = useRecordingQuality();

    const {
        phase: recognitionPhase,
        result: recognitionResult,
        errorMessage: recognitionError,
        transcribe,
        reset: resetRecognition,
    } = useBolRecognition();

    const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!recording) {
            setPlaybackUrl(null);
            return;
        }

        const url = URL.createObjectURL(recording.blob);
        setPlaybackUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [recording]);

    /*
     * Phase 4:
     * As soon as the real recording is captured, analyze the actual Blob.
     */
    useEffect(() => {
        if (phase === "captured" && recording) {
            resetRecognition();
            analyzeQuality(recording);
        }
    }, [
        phase,
        recording,
        analyzeQuality,
        resetRecognition,
    ]);

    /*
     * Timer-based pacing guide only.
     * This does NOT recognize speech.
     */
    const activeBolIndex = useMemo(() => {
        if (
            phase !== "recording" ||
            composition.bols.length === 0
        ) {
            return undefined;
        }

        const perBol =
            composition.duration_seconds /
            composition.bols.length;

        if (!(perBol > 0)) {
            return undefined;
        }

        return Math.min(
            composition.bols.length - 1,
            Math.floor(elapsedSeconds / perBol),
        );
    }, [
        phase,
        elapsedSeconds,
        composition.bols.length,
        composition.duration_seconds,
    ]);

    const announcement = announcementFor(phase);

    const isErrorPhase =
        phase === "permission_denied" ||
        phase === "no_microphone" ||
        phase === "unsupported_browser" ||
        phase === "recording_error";

    const handleStartPractice = () => {
        resetQuality();
        resetRecognition();
        startPractice();
    };

    /*
     * Phase 5:
     * Only send the recording to Sarvam after the Phase 4
     * quality gate says the recording is usable.
     */
    const handleContinueToRecognition = () => {
        if (!recording || !qualityResult?.isUsable) {
            return;
        }

        void transcribe(
            recording.blob,
            composition.bols,
        );
    };

    const renderQuality = () => {
        if (qualityPhase === "analyzing") {
            return (
                <div
                    role="status"
                    aria-live="polite"
                    className="flex flex-col items-center gap-2 text-center"
                >
                    <p className="font-body text-xs uppercase tracking-[0.2em] text-khaali">
                        Recording Quality
                    </p>

                    <p className="font-display text-xl text-ink">
                        Checking your recording…
                    </p>

                    <p className="font-body text-sm text-ink/70">
                        Analyzing the audio before sending it for recognition.
                    </p>
                </div>
            );
        }

        if (qualityPhase === "error") {
            return (
                <div
                    role="alert"
                    className="flex flex-col items-center gap-4 text-center"
                >
                    <p className="font-display text-xl text-oxblood">
                        Recording could not be analyzed
                    </p>

                    <p className="font-body text-sm text-ink/70">
                        {qualityError ??
                            "This recording could not be analyzed. Please try again."}
                    </p>

                    <button
                        type="button"
                        onClick={handleStartPractice}
                        className="rounded-full border border-oxblood px-5 py-2 font-body text-sm text-oxblood transition-colors hover:bg-oxblood hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                        Record Again
                    </button>
                </div>
            );
        }

        if (qualityPhase === "done" && qualityResult) {
            return (
                <RecordingQuality
                    result={qualityResult}
                    onContinue={handleContinueToRecognition}
                    onRetry={handleStartPractice}
                />
            );
        }

        return null;
    };

    return (
        <div className="flex w-full flex-col items-center gap-6 rounded-lg border border-khaali/30 bg-white/30 px-6 py-8">
            <div
                aria-live="polite"
                className="sr-only"
            >
                {announcement}
            </div>

            <h3 className="font-display text-xl text-ink">
                Practice Recording
            </h3>

            {phase === "idle" && (
                <div className="flex flex-col items-center gap-3 text-center">
                    <p className="max-w-sm font-body text-sm text-ink/70">
                        Record yourself saying the bols above using your
                        microphone.
                    </p>

                    <button
                        type="button"
                        onClick={handleStartPractice}
                        className="rounded-full bg-oxblood px-6 py-2.5 font-body text-sm text-cream transition-colors hover:bg-oxblood/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                        Start Practice
                    </button>
                </div>
            )}

            {phase === "countdown" &&
                countdownValue !== null && (
                    <Countdown value={countdownValue} />
                )}

            {phase === "requesting_permission" && (
                <p
                    role="status"
                    className="font-body text-sm text-ink/70"
                >
                    Requesting microphone access…
                </p>
            )}

            {(phase === "recording" ||
                phase === "stopping") && (
                    <div className="flex w-full flex-col items-center gap-5">
                        <div className="flex flex-col items-center gap-2">
                            <p className="font-body text-xs uppercase tracking-[0.2em] text-khaali">
                                Current bol
                            </p>

                            <p className="font-display text-4xl text-oxblood">
                                {
                                    composition.bols[
                                    activeBolIndex ?? 0
                                    ] ??
                                    composition.bols[0]
                                }
                            </p>
                        </div>

                        <BolNotation
                            bols={composition.bols}
                            activeIndex={activeBolIndex}
                        />

                        <p className="font-body text-xs uppercase tracking-[0.2em] text-khaali">
                            Live voice
                        </p>

                        <Waveform analyserNode={analyserNode} />

                        <div className="flex items-center gap-4">
                            <RecordingTimer
                                elapsedSeconds={elapsedSeconds}
                            />

                            <button
                                type="button"
                                onClick={stopRecording}
                                disabled={phase === "stopping"}
                                className="rounded-full border border-oxblood px-5 py-2 font-body text-sm text-oxblood transition-colors hover:bg-oxblood hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {phase === "stopping"
                                    ? "Stopping…"
                                    : "Stop Recording"}
                            </button>
                        </div>
                    </div>
                )}

            {phase === "captured" && recording && (
                <div className="flex w-full flex-col items-center gap-6">
                    <div className="flex w-full flex-col items-center gap-4 text-center">
                        <p
                            role="status"
                            className="font-body text-sm text-ink"
                        >
                            Recording captured —{" "}
                            {Math.round(
                                recording.durationSeconds,
                            )}
                            s,{" "}
                            {(
                                recording.sizeBytes / 1024
                            ).toFixed(0)}
                            KB.
                        </p>

                        {playbackUrl && (
                            <audio
                                controls
                                src={playbackUrl}
                                className="w-full max-w-sm"
                            >
                                Your browser does not support
                                playing back this recording.
                            </audio>
                        )}
                    </div>

                    {qualityPhase !== "done" &&
                        qualityPhase !== "error" && (
                            <div className="w-full">
                                {renderQuality()}
                            </div>
                        )}

                    {qualityPhase === "done" &&
                        qualityResult &&
                        recognitionPhase === "idle" && (
                            <div className="w-full">
                                {renderQuality()}
                            </div>
                        )}

                    {qualityPhase === "done" &&
                        qualityResult &&
                        !qualityResult.isUsable && (
                            <div className="w-full">
                                {renderQuality()}
                            </div>
                        )}

                    {recognitionPhase !== "idle" && (
                        <BolRecognitionResult
                            phase={
                                recognitionPhase === "complete"
                                    ? "complete"
                                    : recognitionPhase === "error"
                                        ? "error"
                                        : "transcribing"
                            }
                            result={recognitionResult}
                            errorMessage={recognitionError}
                            onRetry={
                                qualityResult?.isUsable
                                    ? handleContinueToRecognition
                                    : handleStartPractice
                            }
                        />
                    )}

                    {recognitionPhase === "complete" && (
                        <button
                            type="button"
                            onClick={handleStartPractice}
                            className="rounded-full border border-oxblood px-5 py-2 font-body text-sm text-oxblood transition-colors hover:bg-oxblood hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                        >
                            Record Again
                        </button>
                    )}
                </div>
            )}

            {isErrorPhase && (
                <div
                    role="alert"
                    className="flex w-full flex-col items-center gap-4 text-center"
                >
                    <p className="font-body text-sm text-oxblood">
                        {errorMessage ??
                            ERROR_FALLBACK_MESSAGES[phase]}
                    </p>

                    <button
                        type="button"
                        onClick={handleStartPractice}
                        className="rounded-full border border-oxblood px-5 py-2 font-body text-sm text-oxblood transition-colors hover:bg-oxblood hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
}
