"use client";

import { useEffect, useRef, useState } from "react";
import {
  Hand,
  Mic,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Search,
  Volume2,
  X,
  Sparkles,
} from "lucide-react";

interface Taal {
  id: string;
  name: string;
  bols: string[];
  taali: number[];
  khaali: number[];
}

const PRIMARY_TAALS: Taal[] = [
  {
    id: "teentaal",
    name: "Teentaal (16)",
    bols: [
      "Dha", "Dhin", "Dhin", "Dha",
      "Dha", "Dhin", "Dhin", "Dha",
      "Dha", "Tin", "Tin", "Ta",
      "Ta", "Dhin", "Dhin", "Dha",
    ],
    taali: [1, 5, 13],
    khaali: [9],
  },
  {
    id: "jhaptaal",
    name: "Jhaptaal (10)",
    bols: ["Dhi", "Na", "Dhi", "Dhi", "Na", "Ti", "Na", "Dhi", "Dhi", "Na"],
    taali: [1, 3, 8],
    khaali: [6],
  },
  {
    id: "ektaal",
    name: "Ektaal (12)",
    bols: [
      "Dhin", "Dhin", "Dhage", "Tirakita",
      "Tu", "Na", "Kat", "Ta",
      "Dhage", "Tirakita", "Dhin", "Na",
    ],
    taali: [1, 5, 9, 11],
    khaali: [3, 7],
  },
  {
    id: "dhamaar",
    name: "Dhamaar (14)",
    bols: [
      "Ka", "Dhi", "Ta", "Dhi", "Ta", "Dhaa", "S",
      "Ga", "Ti", "Ta", "Ti", "Ta", "Taa", "S",
    ],
    taali: [1, 6, 11],
    khaali: [8],
  },
  {
    id: "rupak",
    name: "Rupak (7)",
    bols: ["Tin", "Tin", "Na", "Dhin", "Na", "Dhin", "Na"],
    taali: [4, 6],
    khaali: [1],
  },
];

const MORE_TAALS: Taal[] = [
  {
    id: "kaherwa",
    name: "Kaherwa (8)",
    bols: ["Dha", "Ge", "Na", "Ti", "Na", "Ka", "Dhi", "Na"],
    taali: [1],
    khaali: [5],
  },
  {
    id: "dadra",
    name: "Dadra (6)",
    bols: ["Dha", "Dhi", "Na", "Dha", "Tu", "Na"],
    taali: [1],
    khaali: [4],
  },
  {
    id: "pancham-sawari",
    name: "Pancham Sawari (15)",
    bols: [
      "Dha", "Dhin", "Na", "Dha", "Dha", "Tin", "Na", "Dhin",
      "Ga", "Dhin", "Na", "Tin", "Ga", "Dhin", "Na",
    ],
    taali: [1, 4, 12],
    khaali: [8],
  },
  {
    id: "chautaal",
    name: "Chautaal (12)",
    bols: [
      "Dha", "Dha", "Din", "Ta", "Kat", "Tage",
      "Din", "Ta", "Tete", "Kata", "Gadi", "Gene",
    ],
    taali: [1, 5, 9, 11],
    khaali: [3, 7],
  },
];

const ALL_TAALS = [...PRIMARY_TAALS, ...MORE_TAALS];

const LAYAS = [
  {
    id: "vilambit",
    label: "Vilambit",
    bpm: 55,
    desc: "Vilambit — slow tempo, for learning new compositions and perfecting footwork.",
  },
  {
    id: "madhya",
    label: "Madhya",
    bpm: 100,
    desc: "Madhya — medium tempo, steady everyday Kathak practice pace.",
  },
  {
    id: "drut",
    label: "Drut",
    bpm: 170,
    desc: "Drut — fast tempo, tests precision, chakkars, and speed control.",
  },
];

type Category = "sam" | "taali" | "khaali" | "plain";

function getCategory(taal: Taal, i: number): Category {
  if (i === 1) return "sam";
  if (taal.taali.includes(i)) return "taali";
  if (taal.khaali.includes(i)) return "khaali";
  return "plain";
}

const CAT_LABEL: Record<Category, string> = {
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
  for (let i = 0; i < size; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / size);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 3;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}

function playClick(ctx: AudioContext, cat: Category) {
  if (cat === "sam") {
    tone(ctx, 160, 0.28, "sine", 0.95);
    tone(ctx, 480, 0.09, "triangle", 0.55);
    clap(ctx, 0.35);
  } else if (cat === "taali") {
    tone(ctx, 220, 0.16, "sine", 0.7);
    clap(ctx, 0.22);
  } else if (cat === "khaali") {
    tone(ctx, 440, 0.09, "sine", 0.35);
  } else {
    tone(ctx, 300, 0.07, "triangle", 0.3);
  }
}

function speakBol(bol: string) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    !bol ||
    bol === "S"
  ) {
    return;
  }
  const u = new SpeechSynthesisUtterance(bol);
  u.rate = 1.35;
  u.pitch = 1.05;
  u.volume = 0.85;
  u.lang = "hi-IN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function RhythmLabPage() {
  const [taalId, setTaalId] = useState<string>("teentaal");
  const [bpm, setBpm] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beat, setBeat] = useState<number>(1);
  const [theka, setTheka] = useState<boolean>(true);
  const [nagma, setNagma] = useState<boolean>(false);
  const [voiceOn, setVoiceOn] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const beatRef = useRef<number>(1);

  const taal = ALL_TAALS.find((t) => t.id === taalId) || PRIMARY_TAALS[0];
  const matras = taal.bols.length;

  useEffect(() => {
    beatRef.current = beat;
  }, [beat]);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const tick = () => {
    const current = beatRef.current;
    const cat = getCategory(taal, current);

    if (theka) {
      try {
        const ctx = getAudioCtx();
        playClick(ctx, cat);
      } catch {
        // audio context error ignore
      }
    }

    if (voiceOn) {
      const bol = taal.bols[current - 1];
      speakBol(bol);
    }

    setBeat(current);
    beatRef.current = current >= matras ? 1 : current + 1;
  };

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = (60 / bpm) * 1000;
      tick();
      timerRef.current = setInterval(tick, intervalMs);

      sessionTimerRef.current = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isPlaying, bpm, taalId, theka, voiceOn]);

  const handlePlayToggle = () => {
    if (!isPlaying) {
      getAudioCtx();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setBeat(1);
    beatRef.current = 1;
    setSessionSeconds(0);
  };

  const currentCat = getCategory(taal, beat);
  const activeLaya = LAYAS.find((l) => l.bpm === bpm);

  const searchResults = searchQuery
    ? ALL_TAALS.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : ALL_TAALS;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <div className="font-devanagari text-gold text-lg tracking-widest font-semibold">
          रियाज़ · लय व ताल
        </div>
        <h1 className="font-display text-ink text-3xl md:text-4xl font-bold mt-1 tracking-tight">
          Rhythm Lab
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Precision Kathak metronome, theka bol recitation, and laya controls
        </p>
      </div>

      {/* Taal Selector Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {PRIMARY_TAALS.map((t) => {
          const active = t.id === taalId;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTaalId(t.id);
                setBeat(1);
                beatRef.current = 1;
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                active
                  ? "bg-ink text-cream shadow-md scale-105"
                  : "bg-white text-ink border border-stone-200 hover:border-gold"
              }`}
            >
              {t.name}
            </button>
          );
        })}
        <button
          onClick={() => setSearchOpen(true)}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink border border-stone-200 hover:border-gold flex items-center gap-1"
        >
          <Search size={13} />
          <span>More</span>
        </button>
      </div>

      {/* Main Rhythm Card */}
      <div className="rounded-3xl border border-stone-200 bg-white/90 p-8 shadow-xl backdrop-blur-md">
        {/* Matra Circle Display */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-dashed border-stone-200 bg-stone-50/50 shadow-inner">
            {/* Pulsing Highlight when playing */}
            {isPlaying && (
              <div
                className={`absolute inset-2 rounded-full opacity-20 transition-all duration-150 ${
                  currentCat === "sam"
                    ? "bg-ink scale-105"
                    : currentCat === "taali"
                    ? "bg-gold scale-100"
                    : "bg-stone-400"
                }`}
              />
            )}

            <div className="text-center z-10">
              <div className="font-display text-5xl font-extrabold text-ink">
                {beat}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-gold mt-1">
                {CAT_LABEL[currentCat] || `Matra ${beat} of ${matras}`}
              </div>
              <div className="font-devanagari text-stone-500 text-sm mt-0.5 font-medium">
                {taal.bols[beat - 1]}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-6 text-xs text-stone-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink inline-block" />
            <strong className="text-ink">Sam</strong> (Beat 1)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gold inline-block" />
            <strong className="text-gold">Taali</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-stone-400 inline-block" />
            <span>Khaali</span>
          </span>
        </div>

        {/* Theka Bols Grid */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-8">
          {taal.bols.map((bol, idx) => {
            const i = idx + 1;
            const cat = getCategory(taal, i);
            const active = i === beat;
            const displayBol = bol === "S" ? "–" : bol;
            return (
              <span
                key={i}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-ink text-cream shadow-md scale-110 font-bold"
                    : cat === "sam"
                    ? "border border-ink text-ink bg-amber-50/50"
                    : cat === "taali"
                    ? "border border-gold text-amber-900 bg-amber-50/30"
                    : cat === "khaali"
                    ? "border border-dashed border-stone-300 text-stone-500"
                    : "border border-stone-200 text-stone-600"
                }`}
              >
                {displayBol}
              </span>
            );
          })}
        </div>

        {/* Audio Layer Toggles */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            onClick={() => setTheka(!theka)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              theka
                ? "bg-amber-100/70 border-gold text-ink"
                : "bg-stone-50 border-stone-200 text-stone-500"
            }`}
          >
            <Volume2 size={15} />
            <span>Theka Click</span>
          </button>

          <button
            onClick={() => setNagma(!nagma)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              nagma
                ? "bg-amber-100/70 border-gold text-ink"
                : "bg-stone-50 border-stone-200 text-stone-500"
            }`}
          >
            <Music2 size={15} />
            <span>Nagma Tone</span>
          </button>

          <button
            onClick={() => setVoiceOn(!voiceOn)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              voiceOn
                ? "bg-amber-100/70 border-gold text-ink"
                : "bg-stone-50 border-stone-200 text-stone-500"
            }`}
          >
            <Mic size={15} />
            <span>Bol Voice</span>
          </button>
        </div>

        {/* Tempo Slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-ink">Tempo (BPM)</span>
            <span className="font-display text-lg font-bold text-ink">
              {bpm} <span className="text-xs font-normal text-stone-500">bpm</span>
            </span>
          </div>
          <input
            type="range"
            min={40}
            max={220}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Laya Speed Presets */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-ink">
            <Hand size={14} className="text-gold" />
            <span>Laya Speed Presets</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {LAYAS.map((l) => {
              const active = bpm === l.bpm;
              return (
                <button
                  key={l.id}
                  onClick={() => setBpm(l.bpm)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? "bg-gold text-white border-gold shadow-sm"
                      : "bg-white text-stone-700 border-stone-200 hover:border-gold"
                  }`}
                >
                  {l.label} ({l.bpm})
                </button>
              );
            })}
          </div>
          <p className="text-xs text-center text-stone-500">
            {activeLaya?.desc || "Fine-tune speed with the slider above"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-full border border-stone-300 text-stone-600 hover:border-ink hover:text-ink flex items-center justify-center transition-all shadow-sm"
            aria-label="Reset beat"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={handlePlayToggle}
            className="w-18 h-18 rounded-full bg-ink text-cream hover:bg-ink-deep flex items-center justify-center shadow-xl hover:scale-105 transition-all"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={28} className="text-cream" />
            ) : (
              <Play size={28} className="text-cream ml-1" />
            )}
          </button>
        </div>

        {sessionSeconds > 0 && (
          <p className="text-center text-xs text-stone-500 mt-4 font-medium">
            Session Duration:{" "}
            <span className="text-ink font-bold">
              {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s
            </span>
          </p>
        )}
      </div>

      {/* Taal Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <Sparkles size={16} className="text-gold" />
                <span>Select Kathak Taal</span>
              </h3>
              <button
                onClick={() => setSearchOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-3 text-stone-400"
              />
              <input
                type="text"
                placeholder="Search Taal (e.g. Dhamaar, Kaherwa)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 pl-9 pr-4 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {searchResults.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTaalId(t.id);
                    setBeat(1);
                    beatRef.current = 1;
                    setSearchOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-gold/30 flex justify-between items-center transition-all"
                >
                  <span className="font-semibold text-ink text-sm">
                    {t.name}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    {t.bols.length} Matras
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
