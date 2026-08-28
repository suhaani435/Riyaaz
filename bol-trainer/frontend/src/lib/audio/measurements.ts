import { AUDIO_QUALITY_THRESHOLDS, type AudioQualityThresholds } from "./thresholds";
import type { AudioQualityMeasurements } from "./qualityTypes";

/**
 * Pure, deterministic audio measurement calculations.
 *
 * Phase 4: REAL AUDIO QUALITY ANALYSIS
 * Everything in this file operates on plain Float32Array sample data
 * and produces real numbers computed from those samples — nothing
 * here is randomly generated or estimated without basis in the
 * actual waveform. No React, no browser APIs: this is what makes the
 * calculations independently testable with synthetic signals.
 */

function frameRmsValues(samples: Float32Array, sampleRate: number, frameSizeMs: number): number[] {
    const frameSize = Math.max(1, Math.round((frameSizeMs / 1000) * sampleRate));
    const frames: number[] = [];

    for (let start = 0; start < samples.length; start += frameSize) {
        const end = Math.min(start + frameSize, samples.length);
        let sumSquares = 0;
        for (let i = start; i < end; i++) {
            sumSquares += samples[i] * samples[i];
        }
        frames.push(Math.sqrt(sumSquares / (end - start)));
    }

    return frames;
}

function percentile(sortedValues: number[], fraction: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.min(sortedValues.length - 1, Math.max(0, Math.floor(fraction * (sortedValues.length - 1))));
    return sortedValues[index];
}

/**
 * Computes real, deterministic measurements from decoded PCM samples.
 * Given the same samples and thresholds, this always returns the
 * same numbers — there is no randomness or simulation anywhere here.
 */
export function computeAudioQualityMeasurements(
    samples: Float32Array,
    sampleRate: number,
    thresholds: AudioQualityThresholds = AUDIO_QUALITY_THRESHOLDS,
): AudioQualityMeasurements {
    const durationSeconds = sampleRate > 0 ? samples.length / sampleRate : 0;

    let sumSquares = 0;
    let peak = 0;
    let clippedCount = 0;
    let currentClippedRun = 0;
    let maxClippedRun = 0;

    for (let i = 0; i < samples.length; i++) {
        const value = samples[i];
        const abs = Math.abs(value);

        sumSquares += value * value;
        if (abs > peak) peak = abs;

        if (abs >= thresholds.clippingSampleThreshold) {
            clippedCount++;
            currentClippedRun++;
            if (currentClippedRun > maxClippedRun) maxClippedRun = currentClippedRun;
        } else {
            currentClippedRun = 0;
        }
    }

    const rms = samples.length > 0 ? Math.sqrt(sumSquares / samples.length) : 0;
    const clippedSampleRatio = samples.length > 0 ? clippedCount / samples.length : 0;
    const maxClippedRunSeconds = sampleRate > 0 ? maxClippedRun / sampleRate : 0;

    const frames = frameRmsValues(samples, sampleRate, thresholds.frameSizeMs);
    const sortedFrames = [...frames].sort((a, b) => a - b);

    const noiseFloorRms = percentile(sortedFrames, thresholds.noiseFloorPercentile);
    const signalLevelRms = percentile(sortedFrames, thresholds.signalLevelPercentile);

    const eps = 1e-6;
    const estimatedSnrDb = 20 * Math.log10((signalLevelRms + eps) / (noiseFloorRms + eps));

    const activityFloor = Math.max(noiseFloorRms * thresholds.voiceActivityMultiplier, eps);
    const activeFrameCount = frames.filter((frame) => frame > activityFloor).length;
    const voiceActivityRatio = frames.length > 0 ? activeFrameCount / frames.length : 0;

    return {
        durationSeconds,
        sampleRate,
        rms,
        peak,
        clippedSampleRatio,
        maxClippedRunSeconds,
        noiseFloorRms,
        signalLevelRms,
        estimatedSnrDb,
        voiceActivityRatio,
    };
}