
import type { TranscriptionResponse } from "@/lib/bol/types";

interface BolRecognitionResultProps {
    phase: "transcribing" | "complete" | "error";
    result: TranscriptionResponse | null;
    errorMessage: string | null;
    onRetry?: () => void;
}

export default function BolRecognitionResult({
    phase,
    result,
    errorMessage,
    onRetry,
}: BolRecognitionResultProps) {
    if (phase === "transcribing") {
        return (
            <div
                role="status"
                aria-live="polite"
                className="flex w-full flex-col items-center gap-3 rounded-lg border border-khaali/30 bg-white/30 px-6 py-8 text-center"
            >
                <p className="font-body text-xs uppercase tracking-[0.2em] text-khaali">
                    Listening
                </p>

                <p className="font-display text-xl text-ink">
                    Understanding your bols…
                </p>

                <p className="font-body text-sm text-ink/70">
                    Your recording is being transcribed and matched against
                    the Kathak bol vocabulary.
                </p>
            </div>
        );
    }

    if (phase === "error") {
        return (
            <div
                role="alert"
                className="flex w-full flex-col items-center gap-4 rounded-lg border border-oxblood/30 bg-white/30 px-6 py-8 text-center"
            >
                <p className="font-display text-xl text-oxblood">
                    Recognition could not be completed
                </p>

                <p className="font-body text-sm text-ink/70">
                    {errorMessage ??
                        "Your recording could not be transcribed."}
                </p>

                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="rounded-full border border-oxblood px-5 py-2 font-body text-sm text-oxblood transition-colors hover:bg-oxblood hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    if (phase !== "complete" || !result) {
        return null;
    }

    const recognizedCount = result.recognized_bols.filter(
        (token) => token.matched_bol !== null,
    ).length;

    return (
        <div className="flex w-full flex-col gap-6 rounded-lg border border-khaali/30 bg-white/30 px-6 py-8">
            <div className="text-center">
                <p className="font-body text-xs uppercase tracking-[0.2em] text-khaali">
                    Your Recitation
                </p>

                <p className="mt-2 font-display text-xl text-ink">
                    {result.transcript || "No speech was detected."}
                </p>
            </div>

            <div>
                <p className="mb-3 text-center font-body text-xs uppercase tracking-[0.2em] text-khaali">
                    Recognized Bols
                </p>

                {result.recognized_bols.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                        {result.recognized_bols.map((token, index) => {
                            const recognized = token.matched_bol !== null;

                            return (
                                <span
                                    key={`${token.text} -${index} `}
                                    className={`rounded - full border px - 3 py - 1.5 font - body text - sm ${recognized
                                            ? "border-ink/20 bg-cream text-ink"
                                            : "border-oxblood/30 bg-oxblood/5 text-oxblood"
                                        } `}
                                    title={`Transcript: ${token.text} | Confidence: ${Math.round(
                                        token.confidence * 100,
                                    )
                                        }% `}
                                >
                                    {recognized
                                        ? token.matched_bol
                                        : token.text}
                                </span>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center font-body text-sm text-ink/70">
                        No Kathak bols were recognized.
                    </p>
                )}
            </div>

            <div className="border-t border-khaali/20 pt-4 text-center">
                <p className="font-body text-sm text-ink/70">
                    Recognized {recognizedCount} of{" "}
                    {result.recognized_bols.length} spoken tokens.
                </p>

                <p className="mt-1 font-body text-xs text-khaali">
                    This is speech recognition only, not a performance score.
                </p>
            </div>
        </div>
    );
}
