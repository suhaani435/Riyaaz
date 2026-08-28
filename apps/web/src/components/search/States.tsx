export function LoadingState() {
  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto mt-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-ink/10 flex overflow-hidden animate-pulse">
          <div className="w-48 h-32 bg-ink/10" />
          <div className="p-4 flex-1 space-y-2">
            <div className="h-4 bg-ink/10 rounded w-3/4" />
            <div className="h-3 bg-ink/10 rounded w-1/3" />
            <div className="h-3 bg-ink/10 rounded w-full" />
            <div className="h-8 bg-ink/10 rounded w-32 mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="text-center mt-16 text-ink/50 max-w-sm mx-auto">
      <p className="font-display text-lg text-ink/70 mb-1">Start with a term, or a link</p>
      <p className="text-sm">Search a composition like &ldquo;tukda&rdquo; or paste a performance you already have in mind.</p>
    </div>
  );
}

export function NoResultsState({ message }: { message?: string | null }) {
  return (
    <div className="text-center mt-16 text-ink/60 max-w-sm mx-auto">
      <p className="font-display text-lg text-ink mb-1">No matches yet</p>
      <p className="text-sm">{message || 'Try a different spelling, or search without the guru filter.'}</p>
    </div>
  );
}

export function TranscriptUnavailableState({ message }: { message?: string | null }) {
  return (
    <div className="text-center mt-16 text-ink/60 max-w-sm mx-auto">
      <p className="font-display text-lg text-ink mb-1">No transcript available</p>
      <p className="text-sm">{message || "This video doesn't have captions Riyaaz can read yet, so it can't be searched."}</p>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center mt-16 max-w-sm mx-auto">
      <p className="font-display text-lg text-ink mb-1">Something went wrong</p>
      <p className="text-sm text-ink/60 mb-4">The search couldn&apos;t complete. Check that the backend is running and try again.</p>
      <button onClick={onRetry} className="px-4 py-2 rounded-lg border border-ink/30 text-ink text-sm font-semibold">
        Try again
      </button>
    </div>
  );
}
