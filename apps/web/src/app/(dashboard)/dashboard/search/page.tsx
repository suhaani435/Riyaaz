"use client";

import { useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import ResultCard from "@/components/search/ResultCard";
import {
  LoadingState,
  EmptyState,
  NoResultsState,
  TranscriptUnavailableState,
  ErrorState,
} from "@/components/search/States";
import { searchTerm, searchVideo } from "@/lib/search/api";
import { ResultItem, VideoInfo } from "@/lib/search/types";

type Status =
  | "idle"
  | "loading"
  | "results"
  | "no-results"
  | "transcript-unavailable"
  | "error";

export default function SearchPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [queryId, setQueryId] = useState<number | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [lastAction, setLastAction] = useState<(() => void) | null>(null);

  const runTermSearch = async (query: string, guru: string) => {
    setStatus("loading");
    setVideoInfo(null);
    setLastAction(() => () => runTermSearch(query, guru));
    try {
      const res = await searchTerm(query, guru);
      setQueryId(res.query_id ?? null);
      setResults(res.results);
      setMessage(res.message ?? null);
      setStatus(res.results.length > 0 ? "results" : "no-results");
    } catch {
      setStatus("error");
    }
  };

  const runVideoSearch = async (url: string, term: string) => {
    setStatus("loading");
    setLastAction(() => () => runVideoSearch(url, term));
    try {
      const res = await searchVideo(url, term);
      setQueryId(res.query_id ?? null);
      setVideoInfo(res.video);
      setResults(res.results);
      setMessage(res.message ?? null);
      if (!res.video) {
        setStatus("error");
      } else if (!res.transcript_available) {
        setStatus("transcript-unavailable");
      } else if (res.results.length === 0) {
        setStatus("no-results");
      } else {
        setStatus("results");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E1] px-4 py-8 rounded-3xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="font-devanagari text-[#C0912E] text-base font-bold tracking-wider">
          रियाज़
        </div>
        <h1 className="font-display text-4xl font-bold text-[#420A10] mt-1">
          Kathak Search
        </h1>
        <p className="text-[#420A10]/70 text-sm mt-1">
          Search classical Kathak terms, compositions, and jump straight to the exact second in master performances
        </p>
      </div>

      <SearchBar
        onSearchTerm={runTermSearch}
        onSearchVideo={runVideoSearch}
        loading={status === "loading"}
      />

      <div className="mt-8">
        {status === "idle" && <EmptyState />}
        {status === "loading" && <LoadingState />}
        {status === "error" && (
          <ErrorState onRetry={() => lastAction && lastAction()} />
        )}
        {status === "no-results" && <NoResultsState message={message} />}
        {status === "transcript-unavailable" && (
          <TranscriptUnavailableState message={message} />
        )}
        {status === "results" && (
          <div className="max-w-2xl mx-auto space-y-4">
            {videoInfo && (
              <p className="text-center text-sm text-[#420A10]/70 mb-2">
                Showing matches in{" "}
                <span className="font-semibold text-[#420A10]">
                  {videoInfo.title}
                </span>
              </p>
            )}
            {results.map((r, i) => (
              <ResultCard
                key={`${r.video_id}-${i}`}
                item={r}
                queryId={queryId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
