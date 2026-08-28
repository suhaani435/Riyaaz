/**
 * SpeedControl
 *
 * Phase 2: SELECT BOL -> LISTEN
 * A simple set of playback-speed options. It only reports the
 * selected speed to its parent — it does not touch audio itself,
 * since ReferenceAudioPlayer owns the actual <audio> element (or its
 * absence, when no reference audio exists).
 */

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

interface SpeedControlProps {
    speed: PlaybackSpeed;
    onChange: (speed: PlaybackSpeed) => void;
    disabled?: boolean;
}

export default function SpeedControl({
    speed,
    onChange,
    disabled = false,
}: SpeedControlProps) {
    return (
        <div
            role="group"
            aria-label="Playback speed"
            className="inline-flex items-center gap-1 rounded-full border border-khaali/40 bg-white/40 p-1"
        >
            {PLAYBACK_SPEEDS.map((option) => {
                const isSelected = option === speed;
                return (
                    <button
                        key={option}
                        type="button"
                        disabled={disabled}
                        aria-pressed={isSelected}
                        onClick={() => onChange(option)}
                        className={`rounded-full px-3 py-1 font-body text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isSelected
                                ? "bg-oxblood text-cream"
                                : "text-ink hover:bg-khaali/20"
                            }`}
                    >
                        {option}x
                    </button>
                );
            })}
        </div>
    );
}