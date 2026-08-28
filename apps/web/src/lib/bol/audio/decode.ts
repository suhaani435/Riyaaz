/**
 * decodeRecordingToSamples
 *
 * Phase 4: REAL AUDIO QUALITY ANALYSIS
 * The only module that talks to AudioContext/decodeAudioData for
 * quality analysis. Takes the real Blob produced by the Phase 3
 * recorder (AudioRecorderService) and turns it into a plain
 * Float32Array of samples + sample rate that the pure measurement
 * functions in measurements.ts can work with. Nothing here uploads,
 * persists, or transmits the audio — decoding happens fully in
 * memory and the AudioContext is closed immediately after use.
 */

export interface DecodedAudio {
    samples: Float32Array;
    sampleRate: number;
}

export class AudioDecodeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AudioDecodeError";
    }
}

function resolveAudioContextClass(): typeof AudioContext | undefined {
    if (typeof window === "undefined") return undefined;
    return (
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    );
}

/**
 * Decodes a recorded Blob into mono PCM samples for analysis. If the
 * recording has more than one channel, channels are averaged down to
 * mono — quality analysis doesn't need stereo separation, just the
 * actual waveform energy.
 */
export async function decodeRecordingToSamples(blob: Blob): Promise<DecodedAudio> {
    const AudioContextClass = resolveAudioContextClass();

    if (!AudioContextClass) {
        throw new AudioDecodeError("Audio analysis is not supported in this browser.");
    }

    const audioContext = new AudioContextClass();

    try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const { numberOfChannels, length, sampleRate } = audioBuffer;
        const mixed = new Float32Array(length);

        for (let channel = 0; channel < numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                mixed[i] += channelData[i] / numberOfChannels;
            }
        }

        return { samples: mixed, sampleRate };
    } catch {
        throw new AudioDecodeError("This recording could not be analyzed. Please try again.");
    } finally {
        await audioContext.close().catch(() => undefined);
    }
}