import { useEffect, useState } from "react";
import { fetchCompositions } from "@/lib/bol/api";
import type { Composition } from "@/lib/bol/types";
import CompositionCard from "./CompositionCard";

/**
 * CompositionList
 *
 * Phase 2: SELECT BOL -> LISTEN
 * Fetches compositions from the backend and renders one of three
 * honest states: loading, error, or the actual list (including the
 * empty case, if the backend ever returns zero compositions). No
 * state here is fabricated — each one only reflects what the fetch
 * actually returned.
 */

type ListState =
    | { kind: "loading" }
    | { kind: "error"; message: string }
    | { kind: "loaded"; compositions: Composition[] };

interface CompositionListProps {
    onSelect: (composition: Composition) => void;
}

export default function CompositionList({ onSelect }: CompositionListProps) {
    const [state, setState] = useState<ListState>({ kind: "loading" });

    useEffect(() => {
        let cancelled = false;

        fetchCompositions()
            .then((compositions) => {
                if (!cancelled) setState({ kind: "loaded", compositions });
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : "Unknown error";
                    setState({ kind: "error", message });
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (state.kind === "loading") {
        return (
            <p role="status" className="font-body text-sm text-ink/70">
                Loading compositions…
            </p>
        );
    }

    if (state.kind === "error") {
        return (
            <p role="alert" className="font-body text-sm text-oxblood">
                Couldn't load compositions — {state.message}
            </p>
        );
    }

    if (state.compositions.length === 0) {
        return (
            <p role="status" className="font-body text-sm text-ink/70">
                No compositions are available yet.
            </p>
        );
    }

    return (
        <ul className="flex w-full flex-col gap-4" aria-label="Compositions">
            {state.compositions.map((composition) => (
                <li key={composition.id}>
                    <CompositionCard composition={composition} onSelect={onSelect} />
                </li>
            ))}
        </ul>
    );
}