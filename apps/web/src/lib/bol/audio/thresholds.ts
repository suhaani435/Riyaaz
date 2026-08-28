/**
 * Centralized thresholds for Phase 4 audio-quality analysis.
 *
 * These are initial engineering heuristics chosen to catch obviously
 * unusable recordings (silence, clipping, too quiet, too noisy, too
 * short). They are NOT scientifically calibrated Kathak standards —
 * we expect to tune these once we have a body of real Kathak
 * practice recordings to test against. Keep every magic number here
 * so nothing is scattered across components or calculation modules.
 */
export const AUDIO_QUALITY_THRESHOLDS = {
    /** Recordings shorter than this are rejected outright — not enough audio to evaluate. */
    minDurationSeconds: 0.6,

    /** Frame size used to estimate noise floor / signal level / voice activity. */
    frameSizeMs: 20,

    /** Overall RMS (0-1 float samples) below this, combined with near-zero voice activity, means "no meaningful signal". */
    silenceRmsThreshold: 0.01,

    /** Overall RMS below this (but above the silence threshold) means the voice is present but too quiet. */
    tooQuietRmsThreshold: 0.03,

    /** A sample at/above this absolute amplitude is considered "at the limit" for clipping purposes. */
    clippingSampleThreshold: 0.99,

    /** Fraction of all samples at the limit that's enough to call the recording "clipping". */
    clippingRatioThreshold: 0.001,

    /** Fraction of all samples at the limit that's severe enough to call it "severe distortion" outright. */
    severeDistortionRatioThreshold: 0.01,

    /** A single continuous run of clipped samples longer than this (ms) indicates sustained flat-topping/distortion rather than isolated peaks. */
    severeDistortionRunMs: 15,

    /** Percentile (0-1) of sorted frame-RMS values used as the noise-floor estimate. */
    noiseFloorPercentile: 0.1,

    /** Percentile (0-1) of sorted frame-RMS values used as the "useful signal" level estimate. */
    signalLevelPercentile: 0.9,

    /** Estimated signal-to-noise ratio (dB) below this means "excessive background noise". */
    minSnrDb: 8,

    /** A frame counts as "voice activity" when its RMS exceeds the noise floor by at least this multiple. */
    voiceActivityMultiplier: 2.5,

    /** Below this fraction of frames counted as voice activity, combined with low overall RMS, the recording is treated as silence. */
    minVoiceActivityRatio: 0.05,
} as const;

export type AudioQualityThresholds = typeof AUDIO_QUALITY_THRESHOLDS;