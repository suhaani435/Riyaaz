/**
 * BolNotation
 *
 * Phase 2: SELECT BOL -> LISTEN
 * Renders a composition's bols as a row of individual tokens, in
 * Riyaaz's existing display type. `activeIndex` is accepted now
 * (unhighlighted bols simply render as normal) so a future practice
 * phase can highlight the current bol without changing this
 * component's props.
 */

interface BolNotationProps {
    bols: string[];
    activeIndex?: number;
}

export default function BolNotation({ bols, activeIndex }: BolNotationProps) {
    return (
        <ol
            className="flex flex-wrap items-center justify-center gap-3"
            aria-label="Bol sequence"
        >
            {bols.map((bol, index) => {
                const isActive = index === activeIndex;
                return (
                    <li
                        key={`${bol}-${index}`}
                        aria-current={isActive ? "true" : undefined}
                        className={`rounded-md border px-3 py-1.5 font-display text-lg tracking-wide transition-colors ${isActive
                                ? "border-gold bg-gold/10 text-oxblood"
                                : "border-khaali/40 bg-white/40 text-ink"
                            }`}
                    >
                        {bol}
                    </li>
                );
            })}
        </ol>
    );
}