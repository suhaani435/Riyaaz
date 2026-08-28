import { useEffect, useRef, useState } from "react";
import SpeedControl, { PLAYBACK_SPEEDS, type PlaybackSpeed } from "./SpeedControl";

/**
 * ReferenceAudioPlayer
 *
 * Phase 2: SELECT BOL -> LISTEN
 * Plays a composition's reference audio when a URL exists. When
 * `audioUrl` is null (true for all seeded compositions right now,
 * since no recordings exist yet), this renders an honest
 * "not available" state — it never simulates, mocks, or fakes
 * playback, a progress bar, or a waveform.
 */

interface ReferenceAudioPlayerProps {
    audioUrl: string | null;
}

export default function ReferenceAudioPlayer({
    audioUrl,
}: ReferenceAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState<PlaybackSpeed>(PLAYBACK_SPEEDS[2]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    }, [speed]);

    // Reset transient state whenever the composition (and therefore
    // the audio URL) changes.
    useEffect(() => {
        setIsPlaying(false);
        setError(null);
    }, [audioUrl]);

    if (!audioUrl) {
        return (
            <div
                role="status"
                className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-khaali/50 bg-white/30 px-6 py-8 text-center"
            >
                <p className="font-body text-sm text-ink/80">
                    Reference recording coming soon.
                </p>
                <p className="font-body text-xs text-khaali">
                    This composition doesn't have a reference audio recording yet.
                </p>
            </div>
        );
    }

    const togglePlayback = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch((err: unknown) => {
                const message = err instanceof Error ? err.message : "Unknown error";
                setError(message);
            });
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={() => setError("This recording could not be loaded.")}
            />

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={togglePlayback}
                    aria-pressed={isPlaying}
                    className="rounded-full bg-oxblood px-5 py-2 font-body text-sm text-cream transition-colors hover:bg-oxblood/90"
                >
                    {isPlaying ? "Pause" : "Play reference"}
                </button>

                <SpeedControl speed={speed} onChange={setSpeed} />
            </div>

            {error && (
                <p role="alert" className="font-body text-sm text-oxblood">
                    {error}
                </p>
            )}
        </div>
    );
}