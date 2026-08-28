import { describe, expect, it } from "vitest";
import { computeAudioQualityMeasurements } from "./measurements";
import { evaluateRecordingQuality } from "./evaluate";
import { AUDIO_QUALITY_THRESHOLDS } from "./thresholds";

/**
 * These tests cover the seven required categories end-to-end (real
 * measurement calculation -> real gate evaluation) using synthetic
 * signals. They prove the decision logic is correct for known
 * inputs — they do NOT prove real-world microphone/voice behavior;
 * that still requires manual testing with an actual recording.
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

function pseudoNoise(durationSeconds: number, amplitude: number, seed = 98765): Float32Array {
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
 * way real padhant recitation actually sounds — not a single
 * continuous tone. The noise-floor estimate needs that contrast to
 * mean anything.
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

function evaluate(samples: Float32Array) {
    const measurements = computeAudioQualityMeasurements(samples, SAMPLE_RATE, AUDIO_QUALITY_THRESHOLDS);
    return evaluateRecordingQuality(measurements, AUDIO_QUALITY_THRESHOLDS);
}

describe("evaluateRecordingQuality", () => {
    it("1. flags true silence", () => {
        const result = evaluate(silence(2));
        expect(result.status).toBe("silence");
        expect(result.isUsable).toBe(false);
    });

    it("2. accepts a normal voice-like signal", () => {
        const result = evaluate(mix(speechLikeSignal(2.1, 0.25), pseudoNoise(2.1, 0.003)));
        expect(result.status).toBe("acceptable");
        expect(result.isUsable).toBe(true);
    });

    it("3. flags a very quiet signal", () => {
        const result = evaluate(sineWave(2, 0.02));
        expect(result.status).toBe("too_quiet");
        expect(result.isUsable).toBe(false);
    });

    it("4. flags a clipped signal", () => {
        const signal = sineWave(2, 0.3);
        for (let i = 0; i < signal.length; i += 200) {
            signal[i] = 1.0;
        }
        const result = evaluate(signal);
        expect(result.status).toBe("clipping");
        expect(result.isUsable).toBe(false);
    });

    it("4b. flags a sustained clipped run as severe distortion", () => {
        const signal = sineWave(2, 0.3);
        for (let i = 1000; i < 1000 + Math.round(SAMPLE_RATE * 0.05); i++) {
            signal[i] = 1.0;
        }
        const result = evaluate(signal);
        expect(result.status).toBe("severe_distortion");
        expect(result.isUsable).toBe(false);
    });

    it("5. flags a noisy signal", () => {
        const loud = sineWave(0.5, 0.2);
        const gap = silence(0.5);
        const envelope = new Float32Array(SAMPLE_RATE * 2);
        envelope.set(loud, 0);
        envelope.set(gap, loud.length);
        envelope.set(loud, loud.length + gap.length);
        envelope.set(gap, loud.length * 2 + gap.length);
        const noisy = mix(envelope, pseudoNoise(2, 0.12));

        const result = evaluate(noisy);
        expect(result.status).toBe("too_noisy");
        expect(result.isUsable).toBe(false);
    });

    it("6. flags a recording that's too short", () => {
        const result = evaluate(sineWave(0.2, 0.3));
        expect(result.status).toBe("too_short");
        expect(result.isUsable).toBe(false);
    });

    it("7. acceptable recordings report every threshold as unviolated", () => {
        const result = evaluate(mix(speechLikeSignal(2.1, 0.25), pseudoNoise(2.1, 0.003)));
        expect(result.reasons).toHaveLength(0);
    });
});