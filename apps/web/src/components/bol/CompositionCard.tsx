import type { Composition } from "@/lib/bol/types";
import BolNotation from "./BolNotation";

/**
 * CompositionCard
 *
 * Phase 2: SELECT BOL -> LISTEN
 * A single selectable composition in the selection list. Rendered as
 * a real <button> (not a div with a click handler) so it's keyboard
 * and screen-reader accessible by default.
 */

interface CompositionCardProps {
    composition: Composition;
    onSelect: (composition: Composition) => void;
}

export default function CompositionCard({
    composition,
    onSelect,
}: CompositionCardProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(composition)}
            className="flex w-full flex-col gap-3 rounded-lg border border-khaali/40 bg-white/40 p-5 text-left transition-colors hover:border-gold hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
            <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl text-ink">{composition.name}</h3>
                <span className="whitespace-nowrap rounded-full border border-khaali/40 px-3 py-1 font-body text-xs uppercase tracking-wide text-khaali">
                    {composition.difficulty}
                </span>
            </div>

            <BolNotation bols={composition.bols} />

            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-body text-xs text-ink/70 sm:grid-cols-4">
                <div>
                    <dt className="text-khaali">Taal</dt>
                    <dd>{composition.taal}</dd>
                </div>
                <div>
                    <dt className="text-khaali">Tempo</dt>
                    <dd>{composition.tempo}</dd>
                </div>
                <div>
                    <dt className="text-khaali">Duration</dt>
                    <dd>{composition.duration_seconds}s</dd>
                </div>
                <div>
                    <dt className="text-khaali">Focus</dt>
                    <dd>{composition.skill_focus}</dd>
                </div>
            </dl>
        </button>
    );
}