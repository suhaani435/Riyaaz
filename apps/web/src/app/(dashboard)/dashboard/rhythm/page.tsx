"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Search,
  X,
  Volume2,
  Music2,
  Mic,
} from "lucide-react";

const INK = "#420A10";
const INK_DEEP = "#370A0B";
const GOLD = "#C0912E";
const KHAALI = "#9C8F7E";
const CREAM = "#F5F1E1";

export interface Taal {
  id: string;
  name: string;
  bols: string[];
  taali: number[];
  khaali: number[];
}

const PRIMARY_TAALS: Taal[] = [
  {
    id: "teentaal",
    name: "Teentaal",
    bols: [
      "Dha",
      "Dhin",
      "Dhin",
      "Dha",
      "Dha",
      "Dhin",
      "Dhin",
      "Dha",
      "Dha",
      "Tin",
      "Tin",
      "Ta",
      "Ta",
      "Dhin",
      "Dhin",
      "Dha",
    ],
    taali: [1, 5, 13],
    khaali: [9],
  },
  {
    id: "jhaptaal",
    name: "Jhaptaal",
    bols: ["Dhi", "Na", "Dhi", "Dhi", "Na", "Ti", "Na", "Dhi", "Dhi", "Na"],
    taali: [1, 3, 8],
    khaali: [6],
  },
  {
    id: "ektaal",
    name: "Ektaal",
    bols: [
      "Dhin",
      "Dhin",
      "Dhage",
      "Tirakita",
      "Tu",
      "Na",
      "Kat",
      "Ta",
      "Dhage",
      "Tirakita",
      "Dhin",
      "Na",
    ],
    taali: [1, 5, 9, 11],
    khaali: [3, 7],
  },
  {
    id: "dhamaar",
    name: "Dhamaar",
    bols: [
      "Ka",
      "Dhi",
      "Ta",
      "Dhi",
      "Ta",
      "Dhaa",
      "S",
      "Ga",
      "Ti",
      "Ta",
      "Ti",
      "Ta",
      "Taa",
      "S",
    ],
    taali: [1, 6, 11],
    khaali: [8],
  },
  {
    id: "rupak",
    name: "Rupak",
    bols: ["Tin", "Tin", "Na", "Dhin", "Na", "Dhin", "Na"],
    taali: [4, 6],
    khaali: [1],
  },
];

const MORE_TAALS: Taal[] = [
  {
    id: "kaherwa",
    name: "Kaherwa",
    bols: ["Dha", "Ge", "Na", "Ti", "Na", "Ka", "Dhi", "Na"],
    taali: [1],
    khaali: [5],
  },
  {
    id: "dadra",
    name: "Dadra",
    bols: ["Dha", "Dhi", "Na", "Dha", "Tu", "Na"],
    taali: [1],
    khaali: [4],
  },
  {
    id: "pancham-sawari",
    name: "Pancham Sawari",
    bols: [
      "Dha",
      "Dhin",
      "Na",
      "Dha",
      "Dha",
      "Tin",
      "Na",
      "Dhin",
      "Ga",
      "Dhin",
      "Na",
      "Tin",
      "Ga",
      "Dhin",
      "Na",
    ],
    taali: [1, 4, 12],
    khaali: [8],
  },
  {
    id: "chautaal",
    name: "Chautaal",
    bols: [
      "Dha",
      "Dha",
      "Din",
      "Ta",
      "Kat",
      "Tage",
      "Din",
      "Ta",
      "Tete",
      "Kata",
      "Gadi",
      "Gene",
    ],
    taali: [1, 5, 9, 11],
    khaali: [3, 7],
  },
];

const ALL_TAALS: Taal[] = [...PRIMARY_TAALS, ...MORE_TAALS];

const LAYAS = [
  {
    id: "vilambit",
    label: "Vilambit",
    bpm: 55,
    desc: "Vilambit — slow tempo, for learning new compositions and fixing form.",
  },
  {
    id: "madhya",
    label: "Madhya",
    bpm: 100,
    desc: "Madhya — medium tempo, steady everyday practice pace.",
  },
  {
    id: "drut",
    label: "Drut",
    bpm: 170,
    desc: "Drut — fast tempo, performance speed that tests control.",
  },
];

function getCategory(taal: Taal, i: number): "sam" | "taali" | "khaali" | "plain" {
  if (i === 1) return "sam";
  if (taal.taali.includes(i)) return "taali";
  if (taal.khaali.includes(i)) return "khaali";
  return "plain";
}

const CAT_LABEL: Record<string, string> = {
  sam: "Sam",
  taali: "Taali",
  khaali: "Khaali",
  plain: "",
};

function tone(
  ctx: AudioContext,
  freq: number,
  dur: number,
  type: OscillatorType,
  peak: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.02);
}

function clap(ctx: AudioContext, peak: number) {
  const size = Math.floor(ctx.sampleRate * 0.08);
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1500;
  bp.Q.value = 0.9;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(peak, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  src.connect(bp);
  bp.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

function playNagma(ctx: AudioContext, beatIndex: number) {
  const steps = [0, 2, 4, 7, 9, 7, 4, 2];
  const semis = steps[(beatIndex - 1) % steps.length];
  const freq = 220 * Math.pow(2, semis / 12);
  tone(ctx, freq, 0.24, "triangle", 0.13);
}

function speakBol(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.6;
  u.pitch = 1;
  u.volume = 0.9;
  window.speechSynthesis.speak(u);
}

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  if (s < 60) return s + "s";
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  if (mins < 60) return mins + "m" + (secs ? " " + secs + "s" : "");
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return hrs + "h" + (remMins ? " " + remMins + "m" : "");
}

function ToggleButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all cursor-pointer"
      style={{
        background: active ? INK : "transparent",
        border: "1.5px solid " + (active ? INK : "rgba(66,10,16,0.25)"),
      }}
    >
      <Icon size={16} color={active ? CREAM : INK} />
      <span
        style={{ color: active ? CREAM : INK, fontFamily: "Manrope, sans-serif" }}
        className="text-xs font-semibold"
      >
        {label}
      </span>
    </button>
  );
}

function TaalSearchModal({
  query,
  onQueryChange,
  results,
  onSelect,
  onClose,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  results: Taal[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(55,10,11,0.55)", zIndex: 50 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ background: CREAM, maxHeight: "75vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2
            style={{ fontFamily: "Fraunces, serif", color: INK }}
            className="text-lg font-bold"
          >
            Find a taal
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ color: INK }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ border: "1.5px solid rgba(66,10,16,0.25)", background: "#fff" }}
          >
            <Search size={16} style={{ color: "rgba(66,10,16,0.5)" }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search taals..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: INK, fontFamily: "Manrope, sans-serif" }}
            />
          </div>
        </div>
        <div className="overflow-y-auto px-2 pb-4 space-y-1">
          {results.length === 0 && (
            <p
              className="text-center text-sm px-4 py-6"
              style={{ color: "rgba(66,10,16,0.5)" }}
            >
              No taal matches that search
            </p>
          )}
          {results.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-left transition-colors hover:bg-black/5"
              style={{ background: "rgba(66,10,16,0.04)" }}
            >
              <span
                style={{ color: INK, fontFamily: "Manrope, sans-serif" }}
                className="font-semibold text-sm"
              >
                {t.name}
              </span>
              <span
                style={{ color: GOLD, fontFamily: "Manrope, sans-serif" }}
                className="text-xs font-semibold"
              >
                {t.bols.length} mātrā
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SavedSession {
  date: string;
  durationSeconds: number;
  taal: string;
  bpm: number;
  savedAt: number;
}

function SessionLogView({
  loading,
  error,
  sessions,
  onBack,
}: {
  loading: boolean;
  error: string | null;
  sessions: SavedSession[];
  onBack: () => void;
}) {
  const list = sessions || [];
  const totalSeconds = list.reduce((a, s) => a + (s.durationSeconds || 0), 0);
  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold cursor-pointer"
          style={{ color: INK, fontFamily: "Manrope, sans-serif" }}
        >
          &larr; Back
        </button>
        <h1
          style={{ fontFamily: "Fraunces, serif", color: INK }}
          className="text-xl font-bold"
        >
          Practice Log
        </h1>
        <span style={{ width: 44 }} />
      </div>

      <div
        className="rounded-2xl p-5 mb-6 text-center shadow-lg"
        style={{ background: INK }}
      >
        <div
          style={{ fontFamily: "Fraunces, serif", color: CREAM }}
          className="text-3xl font-bold"
        >
          {formatDuration(totalSeconds)}
        </div>
        <div
          style={{ color: GOLD }}
          className="text-xs font-semibold uppercase tracking-wide mt-1"
        >
          {list.length} session{list.length === 1 ? "" : "s"} logged
        </div>
      </div>

      {loading && (
        <p
          className="text-center text-sm"
          style={{ color: "rgba(66,10,16,0.55)" }}
        >
          Loading your practice history...
        </p>
      )}
      {error && (
        <p className="text-center text-sm" style={{ color: INK }}>
          {error}
        </p>
      )}
      {!loading && !error && list.length === 0 && (
        <p
          className="text-center text-sm"
          style={{ color: "rgba(66,10,16,0.55)" }}
        >
          No sessions saved yet. Practice a cycle, then save it here.
        </p>
      )}

      <div className="space-y-2">
        {list.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{
              background: "rgba(66,10,16,0.05)",
              border: "1px solid rgba(66,10,16,0.1)",
            }}
          >
            <div>
              <div
                style={{ color: INK, fontFamily: "Manrope, sans-serif" }}
                className="text-sm font-semibold"
              >
                {s.taal || "Practice"}
              </div>
              <div style={{ color: "rgba(66,10,16,0.55)" }} className="text-xs">
                {s.date}
                {s.bpm ? " · " + s.bpm + " bpm" : ""}
              </div>
            </div>
            <div
              style={{ color: GOLD, fontFamily: "Fraunces, serif" }}
              className="font-bold"
            >
              {formatDuration(s.durationSeconds || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RhythmLabPage() {
  const [taalId, setTaalId] = useState("teentaal");
  const taal = ALL_TAALS.find((t) => t.id === taalId) || PRIMARY_TAALS[0];
  const matras = taal.bols.length;

  const [beat, setBeat] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(80);

  const [theka, setTheka] = useState(true);
  const [nagma, setNagma] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [view, setView] = useState<"practice" | "log">("practice");
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playBeatSound = (
    category: "sam" | "taali" | "khaali" | "plain",
    bolText: string,
    beatIndex: number,
  ) => {
    const ctx = ensureAudio();
    if (theka) {
      if (category === "sam") {
        clap(ctx, 0.45);
        tone(ctx, 85, 0.4, "triangle", 0.4);
      } else if (category === "taali") {
        clap(ctx, 0.3);
      } else if (category === "khaali") {
        tone(ctx, 440, 0.05, "sine", 0.07);
      } else {
        tone(ctx, 300, 0.04, "sine", 0.05);
      }
    }
    if (nagma) playNagma(ctx, beatIndex);
    if (voiceOn && bolText && bolText !== "S") speakBol(bolText);
  };

  useEffect(() => {
    setBeat(1);
    setIsPlaying(false);
  }, [taalId]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const ms = 60000 / bpm;
    const id = setInterval(() => {
      setBeat((prev) => {
        const next = prev >= matras ? 1 : prev + 1;
        playBeatSound(getCategory(taal, next), taal.bols[next - 1], next);
        return next;
      });
    }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, bpm, taalId, matras, theka, nagma, voiceOn]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (view !== "log") return undefined;
    setLogLoading(true);
    setLogError(null);
    try {
      const stored = localStorage.getItem("riyaaz_rhythm_sessions");
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
      setLogLoading(false);
    } catch {
      setLogError("Could not load practice history from local storage.");
      setLogLoading(false);
    }
  }, [view]);

  const handlePlayToggle = () => {
    ensureAudio();
    setIsPlaying((p) => !p);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setBeat(1);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const goToLog = () => {
    setIsPlaying(false);
    if (sessionSeconds > 0) {
      try {
        const entry: SavedSession = {
          date: new Date().toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          durationSeconds: sessionSeconds,
          taal: taal.name,
          bpm,
          savedAt: Date.now(),
        };
        const current = JSON.parse(
          localStorage.getItem("riyaaz_rhythm_sessions") || "[]",
        );
        current.unshift(entry);
        localStorage.setItem(
          "riyaaz_rhythm_sessions",
          JSON.stringify(current.slice(0, 50)),
        );
      } catch {
        // best effort
      }
      setSessionSeconds(0);
    }
    setView("log");
  };

  const radius = matras > 12 ? 132 : 122;
  const dotSize = matras > 12 ? 14 : 17;

  const catStyle = (
    cat: "sam" | "taali" | "khaali" | "plain",
    active: boolean,
  ) => {
    if (cat === "sam")
      return { bg: INK, fg: CREAM, border: INK, dashed: false };
    if (cat === "taali")
      return { bg: GOLD, fg: INK_DEEP, border: GOLD, dashed: false };
    if (cat === "khaali")
      return { bg: CREAM, fg: KHAALI, border: KHAALI, dashed: true };
    return {
      bg: active ? INK : "rgba(66,10,16,0.08)",
      fg: active ? CREAM : "rgba(66,10,16,0.45)",
      border: "rgba(66,10,16,0.25)",
      dashed: false,
    };
  };

  const currentCat = getCategory(taal, beat);
  const centerStyle = catStyle(currentCat, true);
  const isPrimarySelected = PRIMARY_TAALS.some((t) => t.id === taalId);
  const searchResults = ALL_TAALS.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const activeLaya = LAYAS.find((l) => l.bpm === bpm);

  return (
    <div
      style={{
        background: CREAM,
        minHeight: "100vh",
        fontFamily: "Manrope, sans-serif",
      }}
      className="flex justify-center px-4 py-8 rounded-3xl"
    >
      <style>{`
        @keyframes popScale { 0% { transform: scale(0.82); } 45% { transform: scale(1.14); } 100% { transform: scale(1); } }
        @keyframes ringFlash { 0% { box-shadow: 0 0 0 0 rgba(66,10,16,0.22); } 60% { box-shadow: 0 0 0 16px rgba(66,10,16,0); } 100% { box-shadow: 0 0 0 0 rgba(66,10,16,0); } }
        .beat-pop { animation: popScale 0.32s cubic-bezier(.34,1.56,.64,1); }
        .beat-ring { animation: ringFlash 0.55s ease-out; }
        input[type="range"].taal-slider { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 999px; background: rgba(66,10,16,0.15); width: 100%; }
        input[type="range"].taal-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 999px; background: ${INK}; border: 3px solid ${CREAM}; box-shadow: 0 0 0 1.5px ${INK}; cursor: pointer; margin-top: -8px; }
        input[type="range"].taal-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 999px; }
        input[type="range"].taal-slider::-moz-range-thumb { width: 20px; height: 20px; border-radius: 999px; background: ${INK}; border: 3px solid ${CREAM}; box-shadow: 0 0 0 1.5px ${INK}; cursor: pointer; }
      `}</style>

      {view === "practice" ? (
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div
              style={{
                fontFamily: "var(--font-devanagari), serif",
                color: GOLD,
                fontSize: 15,
                letterSpacing: 1,
              }}
            >
              रियाज़
            </div>
            <h1
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                color: INK,
                fontWeight: 700,
              }}
              className="text-3xl mt-1"
            >
              Rhythm Lab
            </h1>
            <p
              style={{ color: "rgba(66,10,16,0.55)" }}
              className="text-sm mt-1"
            >
              Feel the cycle before you dance it
            </p>
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-1 mb-6 -mx-1 px-1"
            style={{ scrollbarWidth: "none" }}
          >
            {PRIMARY_TAALS.map((t) => {
              const active = t.id === taalId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTaalId(t.id)}
                  className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer"
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    background: active ? INK : "transparent",
                    color: active ? CREAM : INK,
                    border:
                      "1.5px solid " +
                      (active ? INK : "rgba(66,10,16,0.3)"),
                  }}
                >
                  {t.name}{" "}
                  <span style={{ opacity: 0.65 }}>· {t.bols.length}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(true);
              }}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer"
              style={{
                fontFamily: "Manrope, sans-serif",
                background: !isPrimarySelected ? GOLD : "transparent",
                color: !isPrimarySelected ? INK_DEEP : INK,
                border:
                  "1.5px solid " +
                  (!isPrimarySelected ? GOLD : "rgba(66,10,16,0.3)"),
              }}
            >
              <Search size={13} />
              {isPrimarySelected ? "More" : taal.name}
            </button>
          </div>

          {/* Orbital Circle */}
          <div
            className="relative mx-auto mb-6"
            style={{ width: 300, height: 300 }}
          >
            {Array.from({ length: matras }, (_, idx) => idx + 1).map((i) => {
              const angle = (-90 + (i - 1) * (360 / matras)) * (Math.PI / 180);
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);
              const cat = getCategory(taal, i);
              const active = i === beat;
              const s = catStyle(cat, active);
              const size = active ? dotSize + 8 : dotSize;
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    key={active ? `active-${beat}` : `still-${i}`}
                    className={active ? "beat-pop" : ""}
                    style={{
                      width: size,
                      height: size,
                      borderRadius: 999,
                      background: s.bg,
                      border:
                        (s.dashed ? 2 : active ? 0 : 1.5) +
                        "px " +
                        (s.dashed ? "dashed" : "solid") +
                        " " +
                        s.border,
                      boxShadow:
                        active && cat !== "khaali"
                          ? "0 2px 8px rgba(66,10,16,0.35)"
                          : "none",
                      transition: "width 0.2s, height 0.2s",
                    }}
                  />
                </div>
              );
            })}

            {/* Pulsing Center Beat */}
            <div
              key={`center-${beat}`}
              className="beat-pop beat-ring absolute flex flex-col items-center justify-center"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 172,
                height: 172,
                borderRadius: 999,
                background: centerStyle.bg,
                border: centerStyle.dashed
                  ? `3px dashed ${centerStyle.border}`
                  : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: centerStyle.fg,
                  fontWeight: 700,
                }}
                className="text-6xl leading-none"
              >
                {beat}
              </div>
              <div
                style={{
                  color: centerStyle.fg,
                  opacity: 0.75,
                  fontFamily: "Manrope, sans-serif",
                }}
                className="text-xs font-bold tracking-widest uppercase mt-1"
              >
                {CAT_LABEL[currentCat] || `of ${matras}`}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div
            className="flex justify-center gap-5 mb-6 text-xs"
            style={{ color: INK, fontFamily: "Manrope, sans-serif" }}
          >
            <span className="flex items-center gap-1.5">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: INK,
                  display: "inline-block",
                }}
              />
              Sam
            </span>
            <span className="flex items-center gap-1.5">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: GOLD,
                  display: "inline-block",
                }}
              />
              Taali
            </span>
            <span className="flex items-center gap-1.5">
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  border: `2px dashed ${KHAALI}`,
                  display: "inline-block",
                }}
              />
              Khaali
            </span>
          </div>

          {/* Bols Grid */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {taal.bols.map((bol, idx) => {
              const i = idx + 1;
              const cat = getCategory(taal, i);
              const active = i === beat;
              const s = catStyle(cat, active);
              const displayBol = bol === "S" ? "–" : bol;
              return (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    fontStyle: bol === "S" ? "italic" : "normal",
                    background: active ? s.bg : "transparent",
                    color: active ? s.fg : "rgba(66,10,16,0.55)",
                    border:
                      "1.5px " +
                      (cat === "khaali" && !active ? "dashed" : "solid") +
                      " " +
                      (active ? s.border : "rgba(66,10,16,0.15)"),
                  }}
                >
                  {displayBol}
                </span>
              );
            })}
          </div>

          {/* Toggles (Theka / Nagma / Voice) */}
          <div className="flex gap-2 mb-6">
            <ToggleButton
              active={theka}
              onClick={() => setTheka((t) => !t)}
              Icon={Volume2}
              label="Theka"
            />
            <ToggleButton
              active={nagma}
              onClick={() => setNagma((n) => !n)}
              Icon={Music2}
              label="Nagma"
            />
            <ToggleButton
              active={voiceOn}
              onClick={() => setVoiceOn((v) => !v)}
              Icon={Mic}
              label="Voice"
            />
          </div>

          {/* BPM Slider & Laya Presets */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  color: "rgba(66,10,16,0.65)",
                  fontFamily: "Manrope, sans-serif",
                }}
                className="text-xs font-semibold"
              >
                Tempo
              </span>
              <span
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  color: INK,
                  fontWeight: 700,
                }}
                className="text-lg"
              >
                {bpm}{" "}
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "Manrope, sans-serif",
                    fontWeight: 600,
                    opacity: 0.6,
                  }}
                >
                  BPM
                </span>
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="220"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="taal-slider cursor-pointer"
            />
            <div className="flex gap-2 mt-3">
              {LAYAS.map((l) => {
                const active = activeLaya?.id === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setBpm(l.bpm)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      background: active ? INK : "rgba(66,10,16,0.06)",
                      color: active ? CREAM : INK,
                      border: "1px solid " + (active ? INK : "transparent"),
                    }}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              style={{
                background: "rgba(66,10,16,0.08)",
                color: INK,
                border: "1px solid rgba(66,10,16,0.15)",
              }}
              title="Reset beat"
            >
              <RotateCcw size={18} />
            </button>

            <button
              type="button"
              onClick={handlePlayToggle}
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-95"
              style={{
                background: INK,
                color: CREAM,
                boxShadow: "0 6px 20px rgba(66,10,16,0.35)",
              }}
            >
              {isPlaying ? (
                <Pause size={28} />
              ) : (
                <Play size={28} style={{ marginLeft: 3 }} />
              )}
            </button>

            <button
              type="button"
              onClick={goToLog}
              className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              style={{
                background: "rgba(66,10,16,0.08)",
                color: INK,
                border: "1px solid rgba(66,10,16,0.15)",
              }}
              title="Practice log"
            >
              <Clock size={18} />
            </button>
          </div>
        </div>
      ) : (
        <SessionLogView
          loading={logLoading}
          error={logError}
          sessions={savedSessions}
          onBack={() => setView("practice")}
        />
      )}

      {searchOpen && (
        <TaalSearchModal
          query={searchQuery}
          onQueryChange={setSearchQuery}
          results={searchResults}
          onSelect={(id) => {
            setTaalId(id);
            setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}
