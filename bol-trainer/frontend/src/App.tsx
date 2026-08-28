import { useState } from "react";
import CompositionList from "./components/CompositionList";
import ListenScreen from "./components/ListenScreen";
import type { Composition } from "./types/api";

/**
 * Riyaaz AI Bol Trainer — app shell.
 *
 * Phase 2: SELECT BOL -> LISTEN.
 * Replaces the foundation landing screen with a two-state flow:
 * selecting a composition, then listening to it. No microphone,
 * recording, ASR, or scoring exists yet — those arrive in later
 * phases.
 */

type Screen =
  | { kind: "selecting" }
  | { kind: "listening"; composition: Composition };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ kind: "selecting" });

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 px-6 py-12 text-center">
        <p className="font-devanagari text-2xl text-oxblood">रियाज़</p>

        <div className="space-y-3">
          <h1 className="font-display text-5xl font-medium tracking-tight text-ink">
            Riyaaz
          </h1>
          <p className="font-display text-xl italic text-oxblood">
            AI Bol Trainer
          </p>
        </div>

        {screen.kind === "selecting" && (
          <div className="flex w-full max-w-xl flex-col items-center gap-6">
            <p className="max-w-xl font-body text-base leading-relaxed text-ink/80">
              Choose a composition to listen to its bols.
            </p>
            <CompositionList
              onSelect={(composition) =>
                setScreen({ kind: "listening", composition })
              }
            />
          </div>
        )}

        {screen.kind === "listening" && (
          <ListenScreen
            composition={screen.composition}
            onBack={() => setScreen({ kind: "selecting" })}
          />
        )}
      </main>
    </div>
  );
}