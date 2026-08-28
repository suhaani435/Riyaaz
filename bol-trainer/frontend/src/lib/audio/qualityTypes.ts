import type { AudioQualityThresholds } from "./thresholds";

/**
 * Phase 4: REAL AUDIO QUALITY ANALYSIS
 *
 * These types describe only technical audio-quality measurements and
 * the pass/fail gate derived from them. There is no "score" concept
 * here — no clarity, pronunciation, rhythm, or overall performance
 * number. Whether the student said the right bol, or said it well,
 * is not something this phase measures or claims to know.
 */

export type QualityStatus =
    | "acceptable"
    | "too_short"
    | "silence"
    | "severe_distortion"
    | "clipping"
    | "too_quiet"
    | "too_noisy";

/** Raw, real measurements computed directly from the decoded audio samples. */
export interface AudioQualityMeasurements {
    durationSeconds: number;
    sampleRate: number;
    /** Root-mean-square amplitude across the whole recording (0-1 float scale). */
    rms: number;
    /** Peak absolute amplitude across the whole recording (0-1 float scale). */
    peak: number;
    /** Fraction of all samples at/above the clipping threshold. */
    clippedSampleRatio: number;
    /** Longest continuous run of clipped samples, in seconds. */
    maxClippedRunSeconds: number;
    /** Estimated noise floor, from the quietest frames. */
    noiseFloorRms: number;
    /** Estimated useful signal level, from the loudest frames. */
    signalLevelRms: number;
    /** Estimated signal-to-noise ratio in dB (signalLevelRms vs noiseFloorRms). */
    estimatedSnrDb: number;
    /** Fraction of frames counted as voice activity (well above the noise floor). */
    voiceActivityRatio: number;
}

export interface RecordingQualityResult {
    status: QualityStatus;
    /** True only for "acceptable" — convenience so UI doesn't need a switch just to gate the Continue button. */
    isUsable: boolean;
    measurements: AudioQualityMeasurements;
    /** Every threshold actually violated, in plain technical language — for optional secondary display, not the primary message. */
    reasons: string[];
    thresholds: AudioQualityThresholds;
}