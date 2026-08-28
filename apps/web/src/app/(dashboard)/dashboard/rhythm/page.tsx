"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Gauge,
  Sparkles,
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
    name: "Jhaptaal",
    bols: [
      "Dhi", "Na", "Dhi", "Dhi", "Na",
      "Ti", "Na", "Dhi", "Dhi", "Na",
    ],
    taali: [1, 3, 8],
    khaali: [6],
  },
  {
    id: "ektaal",
    name: "Ektaal",
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
    name: "Dhamaar",
    bols: [
      "Ka", "Dhi", "Ta", "Dhi", "Ta",
      "Dhaa", "S", "Ga", "Ti", "Ta",
      "Ti", "Ta", "Taa", "S",
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
      "Dha", "Dhin", "Na", "Dha", "Dha",
      "Tin", "Na", "Dhin", "Ga", "Dhin",
      "Na", "Tin", "Ga", "Dhin", "Na",
    ],
    taali: [1, 4, 12],
    khaali: [8],
  },
  {
    id: "chautaal",
    name: "Chautaal",
    bols: [
      "Dha", "Dha", "Din", "Ta", "Kat",
      "Tage", "Din", "Ta", "Tete", "Kata",
      "Gadi", "Gene",
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
    desc: "Slow laya — ideal for padhant, thaat poise & form correction.",
  },
  {
    id: "madhya",
    label: "Madhya",
    bpm: 100,
    desc: "Medium laya — steady everyday tatkar riyaaz & tukdas.",
  },
  {
    id: "drut",
    label: "Drut",
    bpm: 160,
    desc: "Fast laya — tests speed, chakkars & tihai landing precision.",
  },
  {
    id: "atidrut",
    label: "Ati Drut",
    bpm: 220,
    desc: "High speed laya — masterclass footwork execution.",
  },
];

const BOL_DEVANAGARI_MAP: Record<string, string> = {
  dha: "धा",
  dhin: "धिं",
  dhi: "धिं",
  tin: "तिं",
  ti: "ती",
  ta: "ता",
  na: "ना",
  ge: "गे",
  ka: "क",
  kat: "कत",
  dhage: "धागे",
  tirakita: "तिरकिट",
  tu: "तू",
  dhaa: "धाऽ",
  taa: "ताऽ",
  tete: "तेते",
  kata: "कत",
  gadi: "गदी",
  gene: "गने",
  tage: "तागे",
  s: "–",
};

function getCategory(taal: Taal, i: number): "sam" | "taali" | "khaali" | "plain" {
  if (i === 1) return "sam";
  if (taal.taali.includes(i)) return "taali";
  if (taal.khaali.includes(i)) return "khaali";
  return "plain";
}

const CAT_LABEL: Record<string, string> = {
  sam: "Sam (सम)",
  taali: "Taali (ताली)",
  khaali: "Khaali (खाली)",
  plain: "",
};

// Rich synthesized Tabla tone with Dagga bass and Dayyan resonance
function playTablaTheka(ctx: AudioContext, category: string, bolText: string) {
  const now = ctx.currentTime;
  const isHeavyBol =
    bolText.toLowerCase().includes("dha") ||
    bolText.toLowerCase().includes("dhin") ||
    bolText.toLowerCase().includes("ge") ||
    category === "sam";

  // 1. Dayyan (High pitch rim ring)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = "bandpass";
  filter.frequency.value = category === "sam" ? 480 : category === "taali" ? 540 : 420;
  filter.Q.value = 4.0;

  osc.type = "sine";
  osc.frequency.setValueAtTime(category === "sam" ? 320 : 380, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(category === "sam" ? 0.6 : 0.35, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);

  // 2. Dagga (Deep bass modulation for heavy bols)
  if (isHeavyBol) {
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();

    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(110, now);
    bassOsc.frequency.exponentialRampToValueAtTime(65, now + 0.25);

    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.exponentialRampToValueAtTime(category === "sam" ? 0.7 : 0.45, now + 0.008);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.38);
  }

  // 3. Crisp clap / slap snap on sam & taali
  if (category === "sam" || category === "taali") {
    const size = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2200;
    bp.Q.value = 1.5;

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(category === "sam" ? 0.3 : 0.15, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    src.connect(bp);
    bp.connect(snapGain);
    snapGain.connect(ctx.destination);
    src.start(now);
  }
}

// Melodic Nagma in Raga scale with dual-oscillator Harmonium / Sarangi resonance
function playNagma(ctx: AudioContext, beatIndex: number, totalBeats: number) {
  const now = ctx.currentTime;
  // Classical Raga Bhairav / Yaman scale semitone steps
  const scale = [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0, 7];
  const step = scale[(beatIndex - 1) % scale.length];

  // Base tonic root: C4 (261.63 Hz)
  const rootFreq = 261.63;
  const noteFreq = rootFreq * Math.pow(2, step / 12);

  // Fundamental Lead Oscillator (Triangle wave for warm flute/sarangi tone)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(noteFreq, now);

  // Overtone Oscillator (Sawtooth softened by lowpass for harmonium airiness)
  const osc2 = ctx.createOscillator();
  const filter2 = ctx.createBiquadFilter();
  const gain2 = ctx.createGain();

  osc2.type = "sawtooth";
  osc2.frequency.setValueAtTime(noteFreq * 2, now);
  filter2.type = "lowpass";
  filter2.frequency.value = 800;

  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.2, now + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.linearRampToValueAtTime(0.08, now + 0.02);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc2.connect(filter2);
  filter2.connect(gain2);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.45);
  osc2.stop(now + 0.45);
}

// Speak bol using SpeechSynthesis calibrated to speed
function speakBol(text: string, bpm: number) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!text || text === "S" || text === "–") return;

  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // Rate adjusted dynamically to BPM (1.0 at 60 BPM -> 2.2 at 180 BPM)
    u.rate = Math.min(2.5, Math.max(1.0, 0.8 + (bpm / 120)));
    u.pitch = 1.0;
    u.volume = 0.95;
    u.lang = "hi-IN";
    window.speechSynthesis.speak(u);
  } catch {
    // fallback if speech synthesis busy
  }
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
      className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all cursor-pointer shadow-xs active:scale-95"
      style={{
        background: active ? INK : "#FFFFFF",
        border: "1.5px solid " + (active ? INK : "rgba(66,10,16,0.18)"),
      }}
    >
      <Icon size={17} color={active ? CREAM : INK} />
      <span
        style={{ color: active ? CREAM : INK, fontFamily: "Manrope, sans-serif" }}
        className="text-xs font-bold"
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
      className="fixed inset-0 flex items-center justify-center p-4 bg-[#370A0B]/60 backdrop-blur-xs z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col shadow-2xl bg-[#F5F1E1] border border-[#C0912E]/30"
        style={{ maxHeight: "75vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[#420A10]/10">
          <h2
            style={{ fontFamily: "Fraunces, serif", color: INK }}
            className="text-lg font-bold"
          >
            Select Classical Taal
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ color: INK }}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-black/5"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 pb-2">
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#420A10]/20 shadow-xs"
          >
            <Search size={16} className="text-[#420A10]/50" />
            <input
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by taal name (e.g. Teentaal, Rupak)..."
              className="flex-1 bg-transparent outline-none text-sm text-[#420A10]"
            />
          </div>
        </div>
        <div className="overflow-y-auto p-3 space-y-1.5">
          {results.length === 0 && (
            <p className="text-center text-sm px-4 py-8 text-[#420A10]/60">
              No taal matches that search
            </p>
          )}
          {results.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all hover:bg-[#C0912E]/15 bg-white border border-[#420A10]/10 cursor-pointer shadow-xs"
            >
              <div>
                <span className="font-bold text-sm text-[#420A10] block">
                  {t.name}
                </span>
                <span className="text-[11px] text-[#6B5B52]">
                  {t.bols.slice(0, 4).join(" ")}...
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#C0912E] bg-[#FFF8E1] px-2.5 py-1 rounded-full border border-[#C0912E]/30">
                {t.bols.length} Mātrā
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
          className="text-sm font-bold text-[#420A10] hover:text-[#370A0B] cursor-pointer"
        >
          &larr; Back to Lab
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
        className="rounded-3xl p-6 mb-6 text-center shadow-xl border border-[#C0912E]/30"
        style={{ background: INK }}
      >
        <div
          style={{ fontFamily: "Fraunces, serif", color: CREAM }}
          className="text-4xl font-bold"
        >
          {formatDuration(totalSeconds)}
        </div>
        <div
          style={{ color: GOLD }}
          className="text-xs font-bold uppercase tracking-wider mt-1.5"
        >
          {list.length} Practice Session{list.length === 1 ? "" : "s"} Completed
        </div>
      </div>

      {loading && (
        <p className="text-center text-sm text-[#420A10]/60 py-4">
          Loading your practice history...
        </p>
      )}
      {error && <p className="text-center text-sm text-red-700 py-4">{error}</p>}
      {!loading && !error && list.length === 0 && (
        <div className="text-center py-8 bg-white/70 rounded-3xl border border-[#420A10]/10 p-6">
          <Clock className="mx-auto h-8 w-8 text-[#C0912E] mb-2" />
          <p className="text-sm font-bold text-[#420A10]">No sessions saved yet</p>
          <p className="text-xs text-[#6B5B52] mt-1">
            Practice with the metronome, and your riyaaz duration will be saved here.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {list.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-[#420A10]/10 shadow-xs"
          >
            <div>
              <div className="text-sm font-bold text-[#420A10]">
                {s.taal || "Practice"}
              </div>
              <div className="text-xs text-[#6B5B52]">
                {s.date}
                {s.bpm ? ` · ${s.bpm} BPM` : ""}
              </div>
            </div>
            <div
              style={{ color: GOLD, fontFamily: "Fraunces, serif" }}
              className="font-bold text-base"
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
  const [layaMultiplier, setLayaMultiplier] = useState<1 | 2 | 4>(1);

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
  const beatRef = useRef(1);
  beatRef.current = beat;

  const ensureAudio = useCallback(() => {
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
  }, []);

  const triggerBeatSound = useCallback(
    (beatNum: number) => {
      const ctx = ensureAudio();
      const cat = getCategory(taal, beatNum);
      const bol = taal.bols[beatNum - 1] || "";
      const effectiveBpm = bpm * layaMultiplier;

      if (theka) {
        playTablaTheka(ctx, cat, bol);
      }
      if (nagma) {
        playNagma(ctx, beatNum, matras);
      }
      if (voiceOn) {
        speakBol(bol, effectiveBpm);
      }
    },
    [ensureAudio, taal, bpm, layaMultiplier, theka, nagma, voiceOn, matras],
  );

  // When taal changes, reset beat
  useEffect(() => {
    setBeat(1);
    setIsPlaying(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [taalId]);

  // Metronome interval engine
  useEffect(() => {
    if (!isPlaying) return undefined;

    const effectiveBpm = bpm * layaMultiplier;
    const ms = 60000 / effectiveBpm;

    const id = setInterval(() => {
      setBeat((prev) => {
        const next = prev >= matras ? 1 : prev + 1;
        triggerBeatSound(next);
        return next;
      });
    }, ms);

    return () => clearInterval(id);
  }, [isPlaying, bpm, layaMultiplier, matras, triggerBeatSound]);

  // Session duration timer
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
    const nextPlaying = !isPlaying;
    if (nextPlaying) {
      ensureAudio();
      // Play sound immediately on current beat
      triggerBeatSound(beat);
    } else {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    setIsPlaying(nextPlaying);
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
          bpm: bpm * layaMultiplier,
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

  const activeBol = taal.bols[beat - 1] || "";
  const activeBolDevanagari =
    BOL_DEVANAGARI_MAP[activeBol.toLowerCase()] || activeBol;

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
        @keyframes ringFlash { 0% { box-shadow: 0 0 0 0 rgba(66,10,16,0.22); } 60% { box-shadow: 0 0 0 18px rgba(66,10,16,0); } 100% { box-shadow: 0 0 0 0 rgba(66,10,16,0); } }
        .beat-pop { animation: popScale 0.3s cubic-bezier(.34,1.56,.64,1); }
        .beat-ring { animation: ringFlash 0.5s ease-out; }
        input[type="range"].taal-slider { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; background: rgba(66,10,16,0.15); width: 100%; }
        input[type="range"].taal-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 999px; background: ${INK}; border: 3px solid ${CREAM}; box-shadow: 0 0 0 2px ${INK}; cursor: pointer; margin-top: -8px; }
        input[type="range"].taal-slider::-webkit-slider-runnable-track { height: 6px; border-radius: 999px; }
        input[type="range"].taal-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 999px; background: ${INK}; border: 3px solid ${CREAM}; box-shadow: 0 0 0 2px ${INK}; cursor: pointer; }
      `}</style>

      {view === "practice" ? (
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-5">
            <div
              style={{
                fontFamily: "var(--font-devanagari), serif",
                color: GOLD,
                fontSize: 16,
                letterSpacing: 1.5,
                fontWeight: 700,
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
              className="text-3xl mt-0.5"
            >
              Rhythm Lab
            </h1>
            <p className="text-xs text-[#6B5B52] mt-0.5">
              Auditory theka, melodic nagma & bol padhant metronome
            </p>
          </div>

          {/* Taal Selector Pill Tabs */}
          <div
            className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1"
            style={{ scrollbarWidth: "none" }}
          >
            {PRIMARY_TAALS.map((t) => {
              const active = t.id === taalId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTaalId(t.id)}
                  className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  style={{
                    background: active ? INK : "#FFFFFF",
                    color: active ? CREAM : INK,
                    border:
                      "1.5px solid " +
                      (active ? INK : "rgba(66,10,16,0.2)"),
                  }}
                >
                  {t.name}{" "}
                  <span style={{ opacity: 0.75 }}>· {t.bols.length}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(true);
              }}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold cursor-pointer shadow-xs active:scale-95"
              style={{
                background: !isPrimarySelected ? GOLD : "#FFFFFF",
                color: !isPrimarySelected ? INK_DEEP : INK,
                border:
                  "1.5px solid " +
                  (!isPrimarySelected ? GOLD : "rgba(66,10,16,0.2)"),
              }}
            >
              <Search size={13} />
              {isPrimarySelected ? "More Taals" : taal.name}
            </button>
          </div>

          {/* Orbital Circle */}
          <div
            className="relative mx-auto mb-4"
            style={{ width: 290, height: 290 }}
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
                          ? "0 2px 10px rgba(66,10,16,0.4)"
                          : "none",
                      transition: "width 0.15s, height 0.15s",
                    }}
                  />
                </div>
              );
            })}

            {/* Pulsing Center Beat & Active Bol */}
            <div
              key={`center-${beat}`}
              className="beat-pop beat-ring absolute flex flex-col items-center justify-center shadow-xl cursor-pointer"
              onClick={handlePlayToggle}
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
                className="text-5xl leading-none"
              >
                {beat}
              </div>

              {/* Active Bol Banner in Center */}
              <div className="mt-1 flex items-center gap-1">
                <span
                  style={{
                    color: centerStyle.fg,
                    fontFamily: "var(--font-devanagari), serif",
                  }}
                  className="text-base font-bold"
                >
                  {activeBolDevanagari}
                </span>
                <span
                  style={{ color: centerStyle.fg, opacity: 0.8 }}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  ({activeBol})
                </span>
              </div>

              <div
                style={{
                  color: centerStyle.fg,
                  opacity: 0.85,
                  fontFamily: "Manrope, sans-serif",
                }}
                className="text-[10px] font-bold tracking-widest uppercase mt-0.5"
              >
                {CAT_LABEL[currentCat] || `Mātrā ${beat}`}
              </div>
            </div>
          </div>

          {/* Active Bol Spotlight Bar */}
          <div className="mb-4 text-center bg-white/90 rounded-2xl p-3 border border-[#420A10]/15 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#6B5B52] mb-1.5 px-1 font-semibold">
              <span>Current Mātrā: <strong>{beat} / {matras}</strong></span>
              <span>Laya: <strong className="text-[#C0912E]">{bpm * layaMultiplier} BPM ({layaMultiplier}x)</strong></span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="font-devanagari text-2xl font-bold text-[#420A10]">
                {activeBolDevanagari}
              </span>
              <span className="text-xl font-display font-extrabold text-[#C0912E]">
                {activeBol}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#420A10] border border-[#C0912E]/30">
                {CAT_LABEL[currentCat] || "Plain Beat"}
              </span>
            </div>
          </div>

          {/* 3-Way Audio Toggles (Theka / Nagma / Voice) */}
          <div className="flex gap-2 mb-4">
            <ToggleButton
              active={theka}
              onClick={() => {
                ensureAudio();
                setTheka((t) => !t);
              }}
              Icon={Volume2}
              label="Theka (Tabla)"
            />
            <ToggleButton
              active={nagma}
              onClick={() => {
                ensureAudio();
                setNagma((n) => !n);
              }}
              Icon={Music2}
              label="Nagma (Melody)"
            />
            <ToggleButton
              active={voiceOn}
              onClick={() => {
                ensureAudio();
                setVoiceOn((v) => !v);
              }}
              Icon={Mic}
              label="Voice (Padhant)"
            />
          </div>

          {/* Laya Multiplier Speed Tabs (1x, 2x, 4x) */}
          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#420A10]/15 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#420A10] flex items-center gap-1.5">
                <Gauge size={14} className="text-[#C0912E]" />
                <span>Laya Speed (Layakari)</span>
              </span>
              <span className="text-xs font-extrabold text-[#C0912E]">
                {bpm * layaMultiplier} BPM
              </span>
            </div>

            {/* Multiplier buttons: 1x (Thah), 2x (Dugun), 4x (Chaugun) */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setLayaMultiplier(1)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  layaMultiplier === 1
                    ? "bg-[#420A10] text-[#F5F1E1] shadow-xs"
                    : "bg-[#F5F1E1] text-[#420A10] hover:bg-[#FFF8E1]"
                }`}
              >
                1x Thah (Single)
              </button>
              <button
                type="button"
                onClick={() => setLayaMultiplier(2)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  layaMultiplier === 2
                    ? "bg-[#420A10] text-[#F5F1E1] shadow-xs"
                    : "bg-[#F5F1E1] text-[#420A10] hover:bg-[#FFF8E1]"
                }`}
              >
                2x Dugun (Double)
              </button>
              <button
                type="button"
                onClick={() => setLayaMultiplier(4)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  layaMultiplier === 4
                    ? "bg-[#420A10] text-[#F5F1E1] shadow-xs"
                    : "bg-[#F5F1E1] text-[#420A10] hover:bg-[#FFF8E1]"
                }`}
              >
                4x Chaugun (4x)
              </button>
            </div>

            {/* BPM Slider */}
            <input
              type="range"
              min="40"
              max="220"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="taal-slider cursor-pointer"
            />

            {/* Classical Tempo Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-2.5">
              {LAYAS.map((l) => {
                const active = activeLaya?.id === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setBpm(l.bpm)}
                    className="py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer text-center"
                    style={{
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

          {/* Play / Pause / Reset Bar */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 bg-white border border-[#420A10]/20 shadow-sm"
              title="Reset beat cycle"
            >
              <RotateCcw size={18} className="text-[#420A10]" />
            </button>

            <button
              type="button"
              onClick={handlePlayToggle}
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-transform active:scale-95 bg-[#420A10] text-[#F5F1E1] hover:bg-[#370A0B]"
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
              className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90 bg-white border border-[#420A10]/20 shadow-sm"
              title="Practice log"
            >
              <Clock size={18} className="text-[#420A10]" />
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
