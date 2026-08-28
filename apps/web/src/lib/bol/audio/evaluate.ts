import { AUDIO_QUALITY_THRESHOLDS, type AudioQualityThresholds } from "@/lib/bol/audio/thresholds";
import type { AudioQualityMeasurements, QualityStatus, RecordingQualityResult } from "@/lib/bol/audio/qualityTypes";

/**
 * evaluateRecordingQuality
 *
 * Phase 4: REAL AUDIO QUALITY ANALYSIS
 * Turns real measurements into a single pass/fail gate. This answers
 * exactly one question: "is this recording technically usable for
 * the next step in the pipeline?" It does not — and cannot — know
 * whether the student recited the bol correctly; that's a separate,
 * later phase.
 *
 * Checks are evaluated in priority order (most fundamental first) and
 * the first one that fails becomes the primary status shown to the
 * student. Every violated threshold is still recorded in `reasons`
 * for optional secondary/technical display.
 */
export function evaluateRecordingQuality(
    measurements: AudioQualityMeasurements,
    thresholds: AudioQualityThresholds = AUDIO_QUALITY_THRESHOLDS,
): RecordingQualityResult {
    const reasons: string[] = [];

    const tooShort = measurements.durationSeconds < thresholds.minDurationSeconds;
    if (tooShort) {
        reasons.push(
            `Duration ${measurements.durationSeconds.toFixed(2)}s is below the minimum ${thresholds.minDurationSeconds}s.`,
        );
    }

    const isSilent =
        measurements.rms < thresholds.silenceRmsThreshold &&
        measurements.voiceActivityRatio < thresholds.minVoiceActivityRatio;
    if (isSilent) {
        reasons.push(
            `RMS ${measurements.rms.toFixed(4)} and voice activity ${(measurements.voiceActivityRatio * 100).toFixed(
                1,
            )}% indicate no meaningful signal.`,
        );
    }

    const isSevereDistortion =
        measurements.clippedSampleRatio > thresholds.severeDistortionRatioThreshold ||
        measurements.maxClippedRunSeconds * 1000 > thresholds.severeDistortionRunMs;
    if (isSevereDistortion) {
        reasons.push(
            `Clipped ${(measurements.clippedSampleRatio * 100).toFixed(2)}% of samples with a continuous clipped run of ${(
                measurements.maxClippedRunSeconds * 1000
            ).toFixed(1)}ms.`,
        );
    }

    const isClipping = !isSevereDistortion && measurements.clippedSampleRatio > thresholds.clippingRatioThreshold;
    if (isClipping) {
        reasons.push(`Clipped ${(measurements.clippedSampleRatio * 100).toFixed(2)}% of samples.`);
    }

    const isTooQuiet = !isSilent && measurements.rms < thresholds.tooQuietRmsThreshold;
    if (isTooQuiet) {
        reasons.push(
            `RMS ${measurements.rms.toFixed(4)} is below the usable threshold ${thresholds.tooQuietRmsThreshold}.`,
        );
    }

    const isTooNoisy = measurements.estimatedSnrDb < thresholds.minSnrDb;
    if (isTooNoisy) {
        reasons.push(
            `Estimated SNR ${measurements.estimatedSnrDb.toFixed(1)}dB is below the usable threshold ${thresholds.minSnrDb}dB.`,
        );
    }

    let status: QualityStatus = "acceptable";
    if (tooShort) status = "too_short";
    else if (isSilent) status = "silence";
    else if (isSevereDistortion) status = "severe_distortion";
    else if (isClipping) status = "clipping";
    else if (isTooQuiet) status = "too_quiet";
    else if (isTooNoisy) status = "too_noisy";

    return {
        status,
        isUsable: status === "acceptable",
        measurements,
        reasons,
        thresholds,
    };
}