import type { Composition } from "../types/api";
import BolNotation from "./BolNotation";
import PracticeRecorder from "./PracticeRecorder";
import ReferenceAudioPlayer from "./ReferenceAudioPlayer";

/**
 * ListenScreen
 *
 * Phase 2: SELECT BOL -> LISTEN
 * Phase 3: REAL MICROPHONE RECORDING
 * Shown after a composition is selected. Displays the bol notation
 * and reference audio player for that composition, followed by the
 * real practice-recording flow (PracticeRecorder). Scoring/bol
 * recognition still don't exist yet — those are later phases.
 */

interface ListenScreenProps {
    composition: Composition;
    onBack: () => void;
}

export default function ListenScreen({ composition, onBack }: ListenScreenProps) {
    return (
        <div className="flex w-full max-w-xl flex-col items-center gap-8">
            <button
                type="button"
                onClick={onBack}
                className="self-start font-body text-sm text-oxblood underline decoration-oxblood/40 underline-offset-4 hover:decoration-oxblood"
            >
                ← Back to compositions
            </button>

            <div className="space-y-2 text-center">
                <h2 className="font-display text-3xl text-ink">{composition.name}</h2>
                <p className="font-body text-sm text-khaali">
                    {composition.taal} · {composition.tempo} · {composition.difficulty}
                </p>
            </div>

            <BolNotation bols={composition.bols} />

            <ReferenceAudioPlayer audioUrl={composition.reference_audio_url} />

            <div className="h-px w-24 bg-gold" aria-hidden="true" />

            <PracticeRecorder composition={composition} />
        </div>
    );
}