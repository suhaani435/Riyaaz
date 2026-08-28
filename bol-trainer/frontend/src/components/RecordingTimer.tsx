/**
 * RecordingTimer
 *
 * Phase 3: REAL MICROPHONE RECORDING
 * Shows a "REC 00:03" style indicator driven by the real elapsed
 * recording time (from useAudioRecorder, which times the actual
 * MediaRecorder session). aria-live is intentionally "off" here —
 * announcing every tick would be noisy; phase transitions (recording
 * started/stopped) are announced separately by PracticeRecorder.
 */

interface RecordingTimerProps {
    elapsedSeconds: number;
}

function formatTime(totalSeconds: number): string {
    const clamped = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function RecordingTimer({ elapsedSeconds }: RecordingTimerProps) {
    return (
        <div
            role="status"
            aria-live="off"
            className="inline-flex items-center gap-2 rounded-full border border-oxblood/40 bg-white/40 px-4 py-1.5 font-body text-sm text-oxblood"
        >
            <span className="h-2 w-2 animate-pulse rounded-full bg-oxblood" aria-hidden="true" />
            <span className="font-semibold tracking-wide">REC</span>
            <span aria-label={`Recording time ${formatTime(elapsedSeconds)}`}>{formatTime(elapsedSeconds)}</span>
        </div>
    );
}