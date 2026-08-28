import { useEffect, useState } from "react";
import { fetchHealth } from "../lib/api";
import type { HealthResponse } from "../types/api";

type ConnectionState =
  | { kind: "loading" }
  | { kind: "connected"; data: HealthResponse }
  | { kind: "error"; message: string };

/**
 * Shows the live connection status between this frontend and the
 * FastAPI backend's /api/health endpoint. No fabricated states:
 * it only ever reflects what the fetch actually returned.
 */
export default function BackendStatus() {
  const [state, setState] = useState<ConnectionState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then((data) => {
        if (!cancelled) setState({ kind: "connected", data });
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

  const dotClass =
    state.kind === "connected"
      ? "bg-emerald-600"
      : state.kind === "error"
        ? "bg-oxblood"
        : "bg-khaali animate-pulse";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-khaali/40 bg-white/40 px-4 py-2 font-body text-sm text-ink">
      <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
      {state.kind === "loading" && <span>Connecting to backend…</span>}
      {state.kind === "connected" && (
        <span>
          Backend connected — {state.data.service} v{state.data.version}
        </span>
      )}
      {state.kind === "error" && (
        <span>Backend unreachable — {state.message}</span>
      )}
    </div>
  );
}
