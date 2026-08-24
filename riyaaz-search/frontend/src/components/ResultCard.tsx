import { useState } from 'react';
import { ResultItem } from '../lib/types';
import { logClick, logFeedback } from '../lib/api';

interface Props {
  item: ResultItem;
  queryId?: number | null;
}

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function ResultCard({ item, queryId }: Props) {
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  const handleWatch = () => {
    logClick(item.video_id, item.timestamp_seconds, queryId, item.result_id);
    window.open(item.watch_url, '_blank', 'noopener,noreferrer');
  };

  const handleFeedback = (rating: 1 | 5, kind: 'up' | 'down') => {
    setFeedbackGiven(kind);
    logFeedback(rating, queryId, item.result_id);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-ink/10 flex flex-col sm:flex-row">
      <div className="sm:w-48 shrink-0 relative">
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} className="w-full h-40 sm:h-full object-cover" />
        ) : (
          <div className="w-full h-40 sm:h-full bg-ink/10" />
        )}
        <span className="absolute bottom-2 right-2 bg-ink text-cream text-xs font-semibold px-2 py-0.5 rounded-md font-display">
          {formatTime(item.timestamp_seconds)}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-ink leading-snug">{item.title}</h3>
          <span className="shrink-0 text-xs font-semibold text-inkDeep bg-gold/20 px-2 py-0.5 rounded-full">
            {item.matched_term}
          </span>
        </div>
        {item.channel_title && <p className="text-xs text-ink/50 mt-1">{item.channel_title}</p>}
        <p className="text-sm text-ink/70 mt-2 leading-relaxed italic">&ldquo;{item.snippet}&rdquo;</p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <button
            onClick={handleWatch}
            className="px-4 py-2 rounded-lg bg-ink text-cream text-sm font-semibold hover:bg-inkDeep transition-colors"
          >
            Watch from here &#9654;
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFeedback(5, 'up')}
              disabled={feedbackGiven !== null}
              className={feedbackGiven === 'up' ? 'text-sm opacity-100' : 'text-sm opacity-40 hover:opacity-70'}
              aria-label="Helpful"
            >
              &#128077;
            </button>
            <button
              onClick={() => handleFeedback(1, 'down')}
              disabled={feedbackGiven !== null}
              className={feedbackGiven === 'down' ? 'text-sm opacity-100' : 'text-sm opacity-40 hover:opacity-70'}
              aria-label="Not helpful"
            >
              &#128078;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
