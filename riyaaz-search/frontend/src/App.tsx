import { useState } from 'react';
import Wordmark from './components/Wordmark';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import {
  LoadingState,
  EmptyState,
  NoResultsState,
  TranscriptUnavailableState,
  ErrorState,
} from './components/States';
import { searchTerm, searchVideo } from './lib/api';
import { ResultItem, VideoInfo } from './lib/types';

type Status = 'idle' | 'loading' | 'results' | 'no-results' | 'transcript-unavailable' | 'error';

export default function App() {
  const [status, setStatus] = useState<Status>('idle');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [queryId, setQueryId] = useState<number | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [lastAction, setLastAction] = useState<(() => void) | null>(null);

  const runTermSearch = async (query: string, guru: string) => {
    setStatus('loading');
    setVideoInfo(null);
    setLastAction(() => () => runTermSearch(query, guru));
    try {
      const res = await searchTerm(query, guru);
      setQueryId(res.query_id ?? null);
      setResults(res.results);
      setMessage(res.message ?? null);
      setStatus(res.results.length > 0 ? 'results' : 'no-results');
    } catch (e) {
      setStatus('error');
    }
  };

  const runVideoSearch = async (url: string, term: string) => {
    setStatus('loading');
    setLastAction(() => () => runVideoSearch(url, term));
    try {
      const res = await searchVideo(url, term);
      setQueryId(res.query_id ?? null);
      setVideoInfo(res.video);
      setResults(res.results);
      setMessage(res.message ?? null);
      if (!res.video) {
        setStatus('error');
      } else if (!res.transcript_available) {
        setStatus('transcript-unavailable');
      } else if (res.results.length === 0) {
        setStatus('no-results');
      } else {
        setStatus('results');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <Wordmark />
      <SearchBar onSearchTerm={runTermSearch} onSearchVideo={runVideoSearch} loading={status === 'loading'} />

      <div className="mt-8">
        {status === 'idle' && <EmptyState />}
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState onRetry={() => lastAction && lastAction()} />}
        {status === 'no-results' && <NoResultsState message={message} />}
        {status === 'transcript-unavailable' && <TranscriptUnavailableState message={message} />}
        {status === 'results' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {videoInfo && (
              <p className="text-center text-sm text-ink/50 mb-2">
                Showing matches in <span className="font-semibold text-ink">{videoInfo.title}</span>
              </p>
            )}
            {results.map((r, i) => (
              <ResultCard key={`${r.video_id}-${i}`} item={r} queryId={queryId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
