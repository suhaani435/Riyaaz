import { describe, expect, it } from "vitest";
import { computeAudioQualityMeasurements } from "./measurements";
import { AUDIO_QUALITY_THRESHOLDS } from "./thresholds";

/**
 * These tests exercise the actual RMS/peak/clipping/noise-floor/
 * voice-activity calculations against synthetic signals we construct
 * by hand (sine waves, silence, a deterministic pseudo-noise
 * generator). They prove the math is correct for known inputs — they
 * do NOT prove anything about how a real microphone or a real voice
 * behaves in practice. That still has to be verified manually with
 * an actual recording.
 */

const SAMPLE_RATE = 16000;

function silence(durationSeconds: number): Float32Array {
    return new Float32Array(Math.round(durationSeconds * SAMPLE_RATE));
}

function sineWave(durationSeconds: number, amplitude: number, frequencyHz = 200): Float32Array {
    const length = Math.round(durationSeconds * SAMPLE_RATE);
    const samples = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        samples[i] = amplitude * Math.sin((2 * Math.PI * frequencyHz * i) / SAMPLE_RATE);
    }
    return samples;
}

/** Deterministic pseudo-noise (a fixed-seed LCG, not Math.random) so tests are reproducible. */
function pseudoNoise(durationSeconds: number, amplitude: number, seed = 12345): Float32Array {
    const length = Math.round(durationSeconds * SAMPLE_RATE);
    const samples = new Float32Array(length);
    let state = seed;
    for (let i = 0; i < length; i++) {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        samples[i] = amplitude * ((state / 0x7fffffff) * 2 - 1);
    }
    return samples;
}

function mix(...signals: Float32Array[]): Float32Array {
    const length = Math.max(...signals.map((s) => s.length));
    const out = new Float32Array(length);
    for (const signal of signals) {
        for (let i = 0; i < signal.length; i++) out[i] += signal[i];
    }
    return out;
}

/**
 * Speech-like signal: alternating "voiced" and "pause" segments, the
 * way real padhant recitation actually sounds (short bursts with
 * gaps between them) — not a single continuous tone. The noise-floor
 * estimate needs that contrast to mean anything.
 */
function speechLikeSignal(totalSeconds: number, amplitude: number, onSeconds = 0.4, offSeconds = 0.2): Float32Array {
    const length = Math.round(totalSeconds * SAMPLE_RATE);
    const out = new Float32Array(length);
    const onSamples = Math.round(onSeconds * SAMPLE_RATE);
    const offSamples = Math.round(offSeconds * SAMPLE_RATE);
    let i = 0;
    let cycle = 0;
    while (i < length) {
        const isOn = cycle % 2 === 0;
        const segmentLength = isOn ? onSamples : offSamples;
        for (let j = 0; j < segmentLength && i < length; j++, i++) {
            out[i] = isOn ? amplitude * Math.sin((2 * Math.PI * 200 * i) / SAMPLE_RATE) : 0;
        }
        cycle++;
    }
    return out;
}

describe("computeAudioQualityMeasurements", () => {
    it("reports near-zero RMS and voice activity for true silence", () => {
        const result = computeAudioQualityMeasurements(silence(2), SAMPLE_RATE, AUDIO_QUALITY_THRESHOLDS);
        expect(result.rms).toBeLessThan(AUDIO_QUALITY_THRESHOLDS.silenceRmsThreshold);
        expect(result.voiceActivityRatio).toBe(0);
        expect(result.durationSeconds).toBeCloseTo(2, 1);
    });

    it("reports a healthy RMS and peak for a normal voice-like signal", () => {
        const signal = mix(speechLikeSignal(2.1, 0.25), pseudoNoise(2.1, 0.003));
        const result = computeAudioQualityMeasurements(signal, SAMPLE_RATE, AUDIO_QUALITY_THRESHOLDS);
        expect(result.rms).toBeGreaterThan(AUDIO_QUALITY_THRESHOLDS.tooQuietRmsThreshold);
        expect(result.peak).toBeGreaterThan(0.2);
        expect(result.clippedSampleRatio).toBe(0);
    });

    it("reports low RMS for a very quiet tone", () => {
        const result = computeAudioQualityMeasurements(sineWave(2, 0.02), SAMPLE_RATE, AUDIO_QUALITY_THRESHOLDS);
        expect(result.rms).toBeGreaterThan(AUDIO_QUALITY_THRESHOLDS.silenceRmsThreshold);
        expect(result.rms).toBeLessThan(AUDIO_QUALITY_THRESHOLDS.tooQuietRmsThreshold);
    });

    it("detects a moderate, isolated clipping pattern", () => {
        const signal = sineWave(2, 0.3);
        // Deterministically force ~0.5% of samples to the amplitude limit,
        // scattered as isolated single samples rather than a sustained run.
        for (let i = 0; i < signal.length; i += 200) {
            signal[i] = 1.0;
        }
        const result = computeAudioQualityMeasurements(signal, SAMPLE_RATE, AUDIO_QUALITY_THRESHOLDS);
        expect(result.clippedSampleRatio).toBeGreaterThan(AUDIO_QUALITY_THRESHOLDS.clippingRatioThreshold);
        expect(result.clippedSampleRatio).toBeLessThan(AUDIO_QUALITY_THRESHOLDS.severeDistortionRatioThreshold);
        expect(result.maxClippedRunSeconds * 1000).toBeLessThan(AUDIO_QUALITY_THRESHOLDS.severeDistortionRunMs);
    });

    it("detects a sustained clipped run as more severe than isolated clipping", () => {
        const signal = sineWave(2, 0.3);
        // A continuous flat-topped run of clipped samples, simulating hard limiting/distortion.
        for (let i = 1000; i < 1000 + Math.round(SAMPLE_RATE * 0.05); i++) {
            signal[i] = 1.0;
        }
        const result = computeAudioQualityMeasurements(signal, SAMPLE_RATE, AUDIO_QUALITY_THRESHOLDS);
        expect(result.maxClippedRunSeconds * 1000).toBeGreaterThan(AUDIO_QUALITY_THRESHOLDS.severeDistortionRunMs);
    });

    it("estimates a low SNR when a noise floor sits close to the signal level", () => {
        // Speech-like envelope: loud segments alternating with quiet gaps,
        // plus noise that's nearly as loud as the "loud" segments.
        const loud = sineWave(0.5, 0.2);
        const gap = silence(0.5);
        const envelope = new Float32Array(SAMPLE_RATE * 2);
        envelope.set(loud, 0);
        envelope.set(gap, loud.length);
        envelope.set(loud, loud.length + gap.length);
        envelope.set(gap, loud.length * 2 + gap.length);
        const noisy = mix(envelope, pseudoNoise(2, 0.12));

        const result = computeAudioQualityMeasurements(noisy, SAMPLE_RATE, AUDIO_QUALITY_THRESHOLDS);
        expect(result.estimatedSnrDb).toBeLessThan(AUDIO_QUALITY_THRESHOLDS.minSnrDb);
    });

    it("reports the actual sample-derived duration for a short clip", () => {
        const result = computeAudioQualityMeasurements(sineWave(0.2, 0.3), SAMPLE_RATE, AUDIO_QUALITY_THRESHOLDS);
        expect(result.durationSeconds).toBeCloseTo(0.2, 2);
        expect(result.durationSeconds).toBeLessThan(AUDIO_QUALITY_THRESHOLDS.minDurationSeconds);
    });
});