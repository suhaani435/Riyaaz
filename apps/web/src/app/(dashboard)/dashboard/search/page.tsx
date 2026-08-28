"use client";

import { useState } from "react";
import {
  ExternalLink,
  Search,
  Video,
  ThumbsUp,
  Clock,
} from "lucide-react";

interface KathakTerm {
  canonical: string;
  category: "composition" | "technique" | "rhythm" | "expression";
  meaning: string;
  variations: string[];
  sampleVideo: {
    title: string;
    channel: string;
    timestamp: string;
    seconds: number;
    url: string;
    previewNote: string;
  };
}

const KATHAK_DICTIONARY: KathakTerm[] = [
  {
    canonical: "Tukda",
    category: "composition",
    meaning: "A short, structured rhythmic composition set to a specific Taal, usually ending with a tihai.",
    variations: ["tukda", "tukra", "tukdaa", "tukraa", "tukde"],
    sampleVideo: {
      title: "Teentaal Natwari Tukda Performance & Parhant",
      channel: "Kathak Kendra Academy",
      timestamp: "02:15",
      seconds: 135,
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      previewNote: "Guru demonstrates footwork speed with Tigun and Chougun laya.",
    },
  },
  {
    canonical: "Tatkar",
    category: "technique",
    meaning: "The fundamental rhythmic footwork of Kathak dance, originating from the sounds of ghungroos.",
    variations: ["tatkar", "tatkaar", "tatkara", "taatkar"],
    sampleVideo: {
      title: "Mastering Basic Tatkar in Teentaal: Thaah, Dugun, Chougun",
      channel: "Riyaaz Kathak Archives",
      timestamp: "01:05",
      seconds: 65,
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      previewNote: "Focus on flat heel placement and consistent ghungroo resonance.",
    },
  },
  {
    canonical: "Chakkar",
    category: "technique",
    meaning: "Spins or pirouettes executed on the heel/ball of the foot, characteristic of the Lucknow and Jaipur Gharanas.",
    variations: ["chakkar", "chakar", "chukkar", "chakkars", "spins"],
    sampleVideo: {
      title: "Jaipur Gharana Rapid Chakkars Breakdown",
      channel: "Classical Dance Mastery",
      timestamp: "03:40",
      seconds: 220,
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      previewNote: "Spotting technique and balance transition on Sam.",
    },
  },
  {
    canonical: "Tihai",
    category: "composition",
    meaning: "A phrase or pattern repeated three times that lands precisely on the 'Sam' (the first beat).",
    variations: ["tihai", "tihayi", "tihaee", "teehai", "bedam tihai"],
    sampleVideo: {
      title: "Bedam vs Damdaar Tihai in Jhaptaal (10 Matras)",
      channel: "Taal Vidya Kendra",
      timestamp: "04:12",
      seconds: 252,
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      previewNote: "Landing with exact precision on Dha without rest.",
    },
  },
  {
    canonical: "Aamad",
    category: "composition",
    meaning: "The formal entrance piece composed of Natwari bols, symbolizing the arrival of the dancer.",
    variations: ["aamad", "amad", "aaamad"],
    sampleVideo: {
      title: "Traditional Vilambit Aamad & Salami",
      channel: "Lucknow Gharana Heritage",
      timestamp: "00:45",
      seconds: 45,
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      previewNote: "Graceful wrist rotations (Kasaak-Masaak) and eye movements.",
    },
  },
  {
    canonical: "Paran",
    category: "composition",
    meaning: "Forceful compositions derived from the Pakhawaj drum bols, incorporating open, resonant syllables.",
    variations: ["paran", "parhan", "paaran", "parhant"],
    sampleVideo: {
      title: "Pakhawaj Paran recitation & footwork sync",
      channel: "Dhrupad & Kathak Guild",
      timestamp: "02:50",
      seconds: 170,
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      previewNote: "Heavy, grounded stomping honoring traditional Pakhawaj bols.",
    },
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTerms = KATHAK_DICTIONARY.filter((term) => {
    if (!normalizedQuery) return true;
    const matchCanonical = term.canonical.toLowerCase().includes(normalizedQuery);
    const matchMeaning = term.meaning.toLowerCase().includes(normalizedQuery);
    const matchVariation = term.variations.some((v) => v.includes(normalizedQuery));
    return matchCanonical || matchMeaning || matchVariation;
  });

  const toggleLike = (key: string) => {
    setLikedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <div className="font-devanagari text-gold text-lg tracking-widest font-semibold">
          रियाज़ · कथक शब्दावली व खोज
        </div>
        <h1 className="font-display text-ink text-3xl md:text-4xl font-bold mt-1 tracking-tight">
          Kathak Knowledge & Timestamp Search
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Search terminology, learn canonical spellings, and jump straight to video performance timestamps
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        <Search
          size={18}
          className="absolute left-4 top-3.5 text-stone-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Kathak terms (e.g. tukra, tatkar, tihai, chakkar, aamad)..."
          className="w-full rounded-2xl border border-stone-200 bg-white pl-12 pr-4 py-3 text-sm text-ink shadow-sm placeholder:text-stone-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-3 text-xs text-stone-400 hover:text-stone-700 bg-stone-100 px-2 py-1 rounded-md"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <span className="text-xs text-stone-400 font-medium">Popular:</span>
        {["Tukda", "Tatkar", "Chakkar", "Tihai", "Aamad", "Paran"].map((t) => (
          <button
            key={t}
            onClick={() => setQuery(t)}
            className="rounded-full bg-white border border-stone-200 hover:border-gold px-3 py-1 text-xs text-stone-700 font-medium transition-all"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTerms.map((term) => {
          const isLiked = likedMap[term.canonical];
          return (
            <div
              key={term.canonical}
              className="rounded-2xl border border-stone-200 bg-white/90 p-6 shadow-sm hover:shadow-md hover:border-gold/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-xl font-bold text-ink">
                      {term.canonical}
                    </h3>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200/60 uppercase tracking-wider">
                      {term.category}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleLike(term.canonical)}
                    className={`p-1.5 rounded-full border transition-all ${
                      isLiked
                        ? "bg-amber-100 border-gold text-amber-900"
                        : "border-stone-200 text-stone-400 hover:text-stone-700"
                    }`}
                    aria-label="Helpful"
                  >
                    <ThumbsUp size={14} />
                  </button>
                </div>

                <p className="text-stone-600 text-xs leading-relaxed mb-4">
                  {term.meaning}
                </p>

                {/* Variations pills */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                    Variations:
                  </span>
                  {term.variations.map((v) => (
                    <span
                      key={v}
                      className="rounded bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-600"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Video Timestamp Jump Card */}
              <div className="mt-4 pt-4 border-t border-stone-100 bg-stone-50/50 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <Video size={14} className="text-gold flex-shrink-0" />
                    <span className="truncate">{term.sampleVideo.title}</span>
                  </div>
                  <span className="flex items-center gap-1 rounded bg-amber-200/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                    <Clock size={10} />
                    {term.sampleVideo.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  {term.sampleVideo.previewNote}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400">
                    {term.sampleVideo.channel}
                  </span>
                  <a
                    href={`${term.sampleVideo.url}&t=${term.sampleVideo.seconds}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-ink text-cream hover:bg-ink-deep px-2.5 py-1 text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Watch at {term.sampleVideo.timestamp}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTerms.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center bg-white/50">
          <p className="text-stone-600 text-sm font-semibold">
            No Kathak terms found matching &ldquo;{query}&rdquo;
          </p>
          <p className="text-stone-400 text-xs mt-1">
            Try searching for common terms like &ldquo;tatkar&rdquo;, &ldquo;tukda&rdquo;, or &ldquo;chakkar&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}
