"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Hand,
  Sparkles,
} from "lucide-react";

interface Mudra {
  id: string;
  name: string;
  devanagari: string;
  type: "asamyuta" | "samyuta";
  meaning: string;
  symbolism: string;
  usage: string;
}

const MUDRAS: Mudra[] = [
  {
    id: "pataka",
    name: "Pataka",
    devanagari: "पताक",
    type: "asamyuta",
    meaning: "Flag / Open Hand",
    symbolism: "Forest, clouds, shield, blessing, night, river, touching objects.",
    usage: "All fingers extended together straight, thumb bent touching the base of index finger.",
  },
  {
    id: "tripataka",
    name: "Tripataka",
    devanagari: "त्रिपताक",
    type: "asamyuta",
    meaning: "Three Parts of Flag",
    symbolism: "Crown, tree, thunderbolt, Lord Indra, arrow, flame.",
    usage: "From Pataka, bend the ring finger down at the middle joint.",
  },
  {
    id: "ardhapataka",
    name: "Ardhapataka",
    devanagari: "अर्धपताक",
    type: "asamyuta",
    meaning: "Half Flag",
    symbolism: "Leaves, board, knife, tower, bank of river.",
    usage: "Bend both the little finger and ring finger together from Pataka.",
  },
  {
    id: "kartarimukha",
    name: "Kartarimukha",
    devanagari: "कर्तरीमुख",
    type: "asamyuta",
    meaning: "Scissors Face",
    symbolism: "Separation of lovers, opposition, lightning, falling down, weeping.",
    usage: "Index and middle fingers extended apart like scissors, thumb meets ring and pinky fingers.",
  },
  {
    id: "mayura",
    name: "Mayura",
    devanagari: "मयूर",
    type: "asamyuta",
    meaning: "Peacock",
    symbolism: "Peacock's neck, applying sacred tilak, wiping tears, curls of hair.",
    usage: "Thumb and ring finger tips touch, index, middle and little fingers extended upward.",
  },
  {
    id: "ardhachandra",
    name: "Ardhachandra",
    devanagari: "अर्धचन्द्र",
    type: "asamyuta",
    meaning: "Half Moon",
    symbolism: "Crescent moon, holding throat, origin of stream, prayer platter.",
    usage: "Thumb stretched far outward from the open hand forming a crescent arc.",
  },
  {
    id: "anjali",
    name: "Anjali",
    devanagari: "अञ्जलि",
    type: "samyuta",
    meaning: "Salutation / Greeting",
    symbolism: "Devotion, offering to deities (above head), gurus (at eye level), scholars (at chest).",
    usage: "Both Pataka hands joined palm to palm at the chest or forehead.",
  },
  {
    id: "kapota",
    name: "Kapota",
    devanagari: "कपोत",
    type: "samyuta",
    meaning: "Pigeon / Sacred Embrace",
    symbolism: "Respectful acceptance, polite conversation, receiving blessings.",
    usage: "Anjali hands with hollow space between palms, fingertips and wrists touching.",
  },
  {
    id: "karkata",
    name: "Karkata",
    devanagari: "कर्कट",
    type: "samyuta",
    meaning: "Crab / Interlocked Fingers",
    symbolism: "Group arrival, blowing conch shell, stretching limbs, gathering together.",
    usage: "Fingers of both hands interlocked inward facing toward or away from chest.",
  },
];

export default function MudraStudioPage() {
  const [activeTab, setActiveTab] = useState<"asamyuta" | "samyuta">("asamyuta");
  const [selectedMudra, setSelectedMudra] = useState<Mudra>(MUDRAS[0]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError(
        "Camera permission denied or camera device unavailable. Showing studio preview mode.",
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const filteredMudras = MUDRAS.filter((m) => m.type === activeTab);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Title Header */}
      <div className="text-center mb-8">
        <div className="font-devanagari text-gold text-lg tracking-widest font-semibold">
          रियाज़ · हस्त मुद्रा स्टूडियो
        </div>
        <h1 className="font-display text-ink text-3xl md:text-4xl font-bold mt-1 tracking-tight">
          Mudra Studio & Vision AI
        </h1>
        <p className="text-stone-600 text-sm mt-1">
          Learn, inspect, and practice Kathak Asamyuta and Samyuta Hasta Mudras
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera / Live Video Workspace (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
                <Camera size={18} className="text-gold" />
                <span>Live Gesture Camera</span>
              </h3>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
                Phase 3 Vision AI
              </span>
            </div>

            {/* Video Box */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-900 flex items-center justify-center border border-stone-800 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />

              {!cameraActive && (
                <div className="text-center px-4 py-8">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-cream">
                    <Camera size={26} className="text-gold" />
                  </div>
                  <p className="text-cream font-semibold text-sm">
                    Camera is currently off
                  </p>
                  <p className="text-stone-400 text-xs mt-1 max-w-xs">
                    Enable webcam to practice hand gestures in real-time alongside reference mudras.
                  </p>
                </div>
              )}

              {/* Hand Detection Overlay Guideline (Simulated landmark anchor) */}
              {cameraActive && (
                <div className="absolute inset-0 border-2 border-gold/40 m-6 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <span className="text-[10px] font-mono text-gold bg-stone-900/80 px-2 py-0.5 rounded w-max">
                    MediaPipe Hand Landmark Ready
                  </span>
                  <div className="flex justify-center">
                    <span className="text-xs text-cream/90 bg-ink/80 px-3 py-1 rounded-full backdrop-blur-sm border border-gold/40">
                      Align Hand with Frame
                    </span>
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-lg">
                {cameraError}
              </p>
            )}

            {/* Camera Action Buttons */}
            <div className="mt-4 flex gap-3">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="flex-1 rounded-xl bg-ink text-cream hover:bg-ink-deep font-semibold text-xs py-2.5 shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Camera size={14} />
                  <span>Enable Webcam</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex-1 rounded-xl bg-stone-200 text-stone-800 hover:bg-stone-300 font-semibold text-xs py-2.5 flex items-center justify-center gap-1.5 transition-all"
                >
                  <CameraOff size={14} />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Mudra Target Spec Card */}
          <div className="rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                Target Mudra Spec
              </span>
              <span className="font-devanagari text-lg text-gold font-bold">
                {selectedMudra.devanagari}
              </span>
            </div>
            <h4 className="font-display text-2xl font-bold text-ink">
              {selectedMudra.name} Hasta
            </h4>
            <p className="text-xs text-amber-900 font-semibold mt-0.5">
              {selectedMudra.meaning}
            </p>

            <div className="mt-4 space-y-2 text-xs border-t border-stone-100 pt-3">
              <div>
                <strong className="text-stone-700">Form Execution:</strong>
                <p className="text-stone-600 mt-0.5">{selectedMudra.usage}</p>
              </div>
              <div className="pt-1">
                <strong className="text-stone-700">Symbolic Meaning (Viniyoga):</strong>
                <p className="text-stone-600 mt-0.5">{selectedMudra.symbolism}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mudra Reference Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tab Selector */}
          <div className="flex rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab("asamyuta")}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "asamyuta"
                  ? "bg-ink text-cream shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Hand size={14} />
              <span>Asamyuta Hastas (Single Hand)</span>
            </button>

            <button
              onClick={() => setActiveTab("samyuta")}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "samyuta"
                  ? "bg-ink text-cream shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Sparkles size={14} />
              <span>Samyuta Hastas (Combined Hands)</span>
            </button>
          </div>

          {/* Mudra Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMudras.map((m) => {
              const isSelected = selectedMudra.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMudra(m)}
                  className={`rounded-2xl border p-5 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-gold bg-amber-50/60 shadow-md ring-2 ring-gold/30"
                      : "border-stone-200 bg-white hover:border-gold/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between w-full mb-2">
                    <div>
                      <span className="font-devanagari text-gold font-bold text-base">
                        {m.devanagari}
                      </span>
                      <h4 className="font-display text-lg font-bold text-ink mt-0.5">
                        {m.name}
                      </h4>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} className="text-gold flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs font-medium text-amber-900 mb-2">
                    {m.meaning}
                  </p>

                  <p className="text-[11px] text-stone-500 line-clamp-2">
                    {m.symbolism}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
