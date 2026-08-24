import { useState } from 'react';

type Mode = 'term' | 'video';

interface Props {
  onSearchTerm: (query: string, guru: string) => void;
  onSearchVideo: (url: string, term: string) => void;
  loading: boolean;
}

const EXAMPLES = ['tukda', 'tatkar', 'paran Birju Maharaj', 'tihai'];

export default function SearchBar({ onSearchTerm, onSearchVideo, loading }: Props) {
  const [mode, setMode] = useState<Mode>('term');
  const [query, setQuery] = useState('');
  const [guru, setGuru] = useState('');
  const [url, setUrl] = useState('');
  const [videoTerm, setVideoTerm] = useState('');

  const submit = () => {
    if (loading) return;
    if (mode === 'term') {
      if (!query.trim()) return;
      onSearchTerm(query.trim(), guru.trim());
    } else {
      if (!url.trim()) return;
      onSearchVideo(url.trim(), videoTerm.trim());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex gap-2 mb-4 justify-center">
        {(['term', 'video'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              mode === m ? 'bg-ink text-cream border-ink' : 'bg-transparent text-ink border-ink/30'
            }`}
          >
            {m === 'term' ? 'Search a term' : 'Paste a video link'}
          </button>
        ))}
      </div>

      {mode === 'term' ? (
        <div className="space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="tukda, tatkar, paran, tihai..."
            className="w-full px-4 py-3 rounded-xl border border-ink/25 bg-white text-ink placeholder:text-ink/40 outline-none focus:border-gold"
          />
          <input
            value={guru}
            onChange={(e) => setGuru(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Guru or teacher name (optional)"
            className="w-full px-4 py-3 rounded-xl border border-ink/25 bg-white text-ink placeholder:text-ink/40 outline-none focus:border-gold"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Paste a YouTube performance link"
            className="w-full px-4 py-3 rounded-xl border border-ink/25 bg-white text-ink placeholder:text-ink/40 outline-none focus:border-gold"
          />
          <input
            value={videoTerm}
            onChange={(e) => setVideoTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Look for a specific term (optional -- leave blank to scan for all)"
            className="w-full px-4 py-3 rounded-xl border border-ink/25 bg-white text-ink placeholder:text-ink/40 outline-none focus:border-gold"
          />
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full mt-3 py-3 rounded-xl bg-ink text-cream font-semibold disabled:opacity-50"
      >
        {loading ? 'Searching...' : mode === 'term' ? 'Search' : 'Analyse video'}
      </button>

      {mode === 'term' && (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="text-xs px-3 py-1 rounded-full border border-ink/20 text-ink/60 hover:text-ink hover:border-ink/40"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
