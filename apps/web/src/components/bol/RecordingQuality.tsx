
import { useState } from "react";
import type {
    QualityStatus,
    RecordingQualityResult,
} from "@/lib/bol/audio/qualityTypes";

/**
 * RecordingQuality
 *
 * Phase 4: REAL AUDIO QUALITY ANALYSIS
 *
 * Displays the technical usability result for the student's
 * recorded audio.
 *
 * Phase 5:
 * This component remains the quality gate. It does NOT perform
 * speech recognition or call Sarvam. If the recording is usable,
 * onContinue allows PracticeRecorder to move to the next step,
 * where Phase 5 transcription/bol recognition can take place.
 *
 * This component does not score:
 * - pronunciation
 * - clarity
 * - rhythm
 * - bol accuracy
 * - performance
 */

const COPY: Record<QualityStatus, { heading: string; body: string }> = {
    acceptable: {
        heading: "✓ Good recording quality",
        body: "Your recording is ready for analysis.",
    },

    too_quiet: {
        heading: "Your voice is too quiet.",
        body: "Move closer to the microphone and try again.",
    },

    too_noisy: {
        heading: "Too much background noise was detected.",
        body: "Try a quieter environment and record again.",
    },

    clipping: {
        heading: "The recording is clipping.",
        body: "Move slightly farther from the microphone and try again.",
    },

    severe_distortion: {
        heading: "The recording is distorted.",
        body: "Move slightly farther from the microphone and try again.",
    },

    silence: {
        heading: "No clear voice signal was detected.",
        body: "Try recording again.",
    },

    too_short: {
        heading: "The recording is too short.",
        body: "Complete the phrase and try again.",
    },
};

interface RecordingQualityProps {
    result: RecordingQualityResult;
    onContinue: () => void;
    onRetry: () => void;
}

export default function RecordingQuality({
    result,
    onContinue,
    onRetry,
}: RecordingQualityProps) {
    const [showDetails, setShowDetails] = useState(false);

    const copy = COPY[result.status];

    return (
        <div
            role="status"
            aria-live="polite"
            className="flex w-full flex-col items-center gap-4 text-center"
        >
            <p className="font-body text-xs uppercase tracking-[0.2em] text-khaali">
                Recording Quality
            </p>

            <div className="space-y-1">
                <p
                    className={`font-display text-xl ${result.isUsable ? "text-ink" : "text-oxblood"
                        }`}
                >
                    {copy.heading}
                </p>

                <p className="font-body text-sm text-ink/70">
                    {copy.body}
                </p>
            </div>

            {result.isUsable ? (
                <button
                    type="button"
                    onClick={onContinue}
                    className="rounded-full bg-oxblood px-6 py-2.5 font-body text-sm text-cream transition-colors hover:bg-oxblood/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                    Continue
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onRetry}
                    className="rounded-full border border-oxblood px-5 py-2 font-body text-sm text-oxblood transition-colors hover:bg-oxblood hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                    Try Again
                </button>
            )}

            <button
                type="button"
                onClick={() => setShowDetails((previous) => !previous)}
                className="font-body text-xs text-khaali underline decoration-khaali/40 underline-offset-4 hover:decoration-khaali"
                aria-expanded={showDetails}
            >
                {showDetails
                    ? "Hide technical details"
                    : "Show technical details"}
            </button>

            {showDetails && (
                <dl className="grid w-full max-w-sm grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-khaali/30 bg-white/30 p-4 text-left font-body text-xs text-ink/70">
                    <dt>Duration</dt>
                    <dd>
                        {result.measurements.durationSeconds.toFixed(2)}s
                    </dd>

                    <dt>Peak level</dt>
                    <dd>{result.measurements.peak.toFixed(3)}</dd>

                    <dt>RMS (loudness)</dt>
                    <dd>{result.measurements.rms.toFixed(4)}</dd>

                    <dt>Clipped samples</dt>
                    <dd>
                        {(
                            result.measurements.clippedSampleRatio * 100
                        ).toFixed(2)}
                        %
                    </dd>

                    <dt>Est. noise floor</dt>
                    <dd>
                        {result.measurements.noiseFloorRms.toFixed(4)}
                    </dd>

                    <dt>Est. SNR</dt>
                    <dd>
                        {result.measurements.estimatedSnrDb.toFixed(1)}dB
                    </dd>

                    <dt>Voice activity</dt>
                    <dd>
                        {(
                            result.measurements.voiceActivityRatio * 100
                        ).toFixed(1)}
                        %
                    </dd>
                </dl>
            )}
        </div>
    );
}
