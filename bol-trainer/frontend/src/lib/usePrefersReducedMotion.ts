import { useEffect, useState } from "react";

/**
 * usePrefersReducedMotion
 *
 * Phase 3: REAL MICROPHONE RECORDING
 * Tracks the user's `prefers-reduced-motion` OS/browser setting so
 * the countdown animation can be disabled for anyone who has asked
 * for reduced motion, and stays in sync if they change it mid-session.
 */
export function usePrefersReducedMotion(): boolean {
    const query = "(prefers-reduced-motion: reduce)";

    const [prefersReduced, setPrefersReduced] = useState<boolean>(() =>
        typeof window !== "undefined" && "matchMedia" in window ? window.matchMedia(query).matches : false,
    );

    useEffect(() => {
        if (typeof window === "undefined" || !("matchMedia" in window)) return;

        const mediaQueryList = window.matchMedia(query);
        const handleChange = (event: MediaQueryListEvent) => setPrefersReduced(event.matches);

        mediaQueryList.addEventListener("change", handleChange);
        return () => mediaQueryList.removeEventListener("change", handleChange);
    }, []);

    return prefersReduced;
}