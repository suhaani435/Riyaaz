import type { CountdownDisplayValue } from "@/lib/bol/audio/types";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * Countdown
 *
 * Phase 3: REAL MICROPHONE RECORDING
 * Plays the 3-2-1-GO beat before recording starts. Purely visual —
 * no microphone access happens here or during this component's
 * lifetime; that's requested only after "GO" completes (see
 * useAudioRecorder). Respects prefers-reduced-motion by skipping the
 * scale/fade animation entirely.
 */

interface CountdownProps {
    value: CountdownDisplayValue;
}

export default function Countdown({ value }: CountdownProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const label = value === "go" ? "GO" : String(value);

    return (
        <div role="status" aria-live="assertive" className="flex flex-col items-center gap-2 py-6">
            <span
                key={label}
                className={`font-display text-7xl font-medium text-oxblood ${prefersReducedMotion ? "" : "animate-riyaaz-countdown"
                    }`}
            >
                {label}
            </span>
            <p className="font-body text-xs uppercase tracking-[0.2em] text-khaali">Get ready</p>
        </div>
    );
}