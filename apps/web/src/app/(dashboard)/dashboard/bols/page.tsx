"use client";

import { useState } from "react";
import CompositionList from "@/components/bol/CompositionList";
import ListenScreen from "@/components/bol/ListenScreen";
import type { Composition } from "@/lib/bol/types";

type Screen =
  | { kind: "selecting" }
  | { kind: "listening"; composition: Composition };

export default function BolTrainerPage() {
  const [screen, setScreen] = useState<Screen>({ kind: "selecting" });

  return (
    <div className="min-h-screen bg-[#F5F1E1] px-4 py-8 rounded-3xl">
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <div>
          <p className="font-devanagari text-2xl text-[#C0912E] font-bold">
            रियाज़
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[#420A10] mt-1">
            Bol Trainer
          </h1>
          <p className="font-display text-base italic text-[#7B1113] mt-1">
            Kathak Bol Recitation & AI Speech Recognition
          </p>
        </div>

        {screen.kind === "selecting" && (
          <div className="flex w-full max-w-xl flex-col items-center gap-6">
            <p className="max-w-xl font-body text-sm leading-relaxed text-[#420A10]/80">
              Choose a classical Kathak composition to listen to its bols, practice recitation, and receive AI pronunciation feedback.
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
