"use client";

import { useEffect } from "react";
import CameraView from "@/components/mudra/CameraView";
import { useMudraPipeline } from "@/hooks/useMudraPipeline";
import { Sparkles, Video, RefreshCw, Hand, AlertCircle } from "lucide-react";

const V1_MUDRAS = [
  "pataka",
  "tripataka",
  "ardhpataka",
  "mushti",
  "shikhar",
  "kapitth",
  "chatur",
  "kartarimukh",
  "soochi",
  "ardhachandra",
];

const MUDRA_NAMES_MAP: Record<string, string> = {
  pataka: "Patāka (पताक)",
  tripataka: "Tripatāka (त्रिपताक)",
  ardhpataka: "Ardhapatāka (अर्धपताक)",
  mushti: "Muṣṭi (मुष्टि)",
  shikhar: "Śikhara (शिखर)",
  kapitth: "Kapittha (कपित्थ)",
  chatur: "Chatura (चतुर)",
  kartarimukh: "Kartarīmukha (कर्तरीमुख)",
  soochi: "Sūcī (सूची)",
  ardhachandra: "Ardhacandra (अर्धचन्द्र)",
};

export default function MudraStudioPage() {
  const {
    status,
    result,
    errorMessage,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    attachStreamToVideo,
  } = useMudraPipeline();

  const cameraActive =
    status !== "idle" &&
    status !== "camera_denied" &&
    status !== "no_camera";

  useEffect(() => {
    if (cameraActive) {
      attachStreamToVideo();
    }
  }, [cameraActive, attachStreamToVideo]);

  return (
    <div className="min-h-screen bg-[#F5F1E1] px-4 py-8 flex flex-col items-center rounded-3xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="font-devanagari text-[#C0912E] text-base font-bold tracking-wider">
          रियाज़
        </div>
        <h1 className="font-display text-4xl font-bold text-[#420A10] mt-1">
          Mudra Studio
        </h1>
        <p className="text-[#420A10]/70 text-sm mt-1">
          Learn and practice Kathak hasta mudras with live AI vision feedback
        </p>
      </div>

      {/* Main Studio Card */}
      <div className="w-full max-w-xl bg-white/95 rounded-3xl border border-[#420A10]/15 shadow-xl p-6">
        {!cameraActive && (
          <div className="text-center py-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3E0] text-[#420A10] shadow-sm mb-4">
              <Hand className="h-7 w-7 text-[#C0912E]" />
            </div>

            <h3 className="font-display text-xl font-bold text-[#420A10] mb-1">
              Ready for Mudra Practice
            </h3>
            <p className="text-[#420A10]/70 text-xs max-w-md mx-auto mb-4">
              Position your webcam so your hand is centered. MediaPipe Vision AI analyzes 21 3D hand joints and checks your finger extension angles in real-time.
            </p>

            <p className="text-[#420A10]/80 text-xs font-bold uppercase tracking-wider mb-2">
              Supported Hasta Mudras (Abhinaya Darpana):
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mb-6 max-w-md mx-auto">
              {V1_MUDRAS.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDFAF2] text-[#420A10] border border-[#420A10]/15 capitalize"
                >
                  {m}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center justify-center gap-2 bg-[#420A10] text-[#F5F1E1] hover:bg-[#370A0B] font-bold px-7 py-3 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95 text-sm"
            >
              <Video size={18} className="text-[#C0912E]" />
              <span>Launch Camera & Vision AI</span>
            </button>

            {errorMessage && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-700 text-xs bg-red-50 p-3 rounded-xl border border-red-200">
                <AlertCircle size={15} />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {cameraActive && (
          <>
            <CameraView videoRef={videoRef} canvasRef={canvasRef} />

            <div className="mt-5 min-h-[130px] flex flex-col items-center justify-center">
              {status === "requesting_camera" && (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#420A10] border-t-transparent mb-2" />
                  <p className="text-[#420A10]/80 text-sm font-semibold">
                    Requesting camera access...
                  </p>
                  <p className="text-xs text-[#6B5B52] mt-0.5">Please allow webcam permission in your browser prompt</p>
                </div>
              )}
              {status === "loading_model" && (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#C0912E] border-t-transparent mb-2" />
                  <p className="text-[#420A10]/80 text-sm font-semibold">
                    Initializing MediaPipe Hand Landmarker...
                  </p>
                  <p className="text-xs text-[#6B5B52] mt-0.5">Loading neural weights and landmark pipeline</p>
                </div>
              )}
              {status === "running_no_hand" && (
                <div className="text-center py-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E1] text-[#C0912E] mb-1">
                    <Hand size={20} />
                  </div>
                  <p className="text-[#420A10] text-sm font-bold">
                    No hand detected in frame
                  </p>
                  <p className="text-xs text-[#6B5B52] mt-0.5">
                    Hold your palm up directly in front of the lens
                  </p>
                </div>
              )}
              {status === "running_uncertain" && (
                <div className="text-center py-3">
                  <p className="text-[#420A10] text-sm font-semibold">
                    Detecting gesture...
                  </p>
                  <p className="text-xs text-[#6B5B52] mt-0.5">
                    Hold your fingers steady in formation
                  </p>
                </div>
              )}
              {status === "running_recognized" && result && (
                <div className="text-center w-full">
                  <p className="text-[#420A10]/60 text-[11px] uppercase tracking-wider font-bold mb-1">
                    Detected Hasta Mudra
                  </p>
                  <p className="font-display text-3xl text-[#420A10] font-bold capitalize mb-2">
                    {MUDRA_NAMES_MAP[result.mudra.toLowerCase()] || result.mudra}
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF8E1] text-[#420A10] border border-[#C0912E]/40 text-xs font-bold shadow-xs">
                    <Sparkles size={13} className="text-[#C0912E]" />
                    <span>
                      Confidence: {(result.recognitionConfidence * 100).toFixed(0)}%
                    </span>
                  </span>

                  <div className="mt-4 text-left">
                    {result.correctionStatus === "clean" && (
                      <div className="text-center bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs font-bold shadow-xs">
                        ✓ Excellent posture — all fingers properly aligned!
                      </div>
                    )}
                    {result.correctionStatus === "disabled_for_mudra" && (
                      <p className="text-[#420A10]/60 text-xs text-center italic py-2">
                        Biomechanical correction rules are calibrated for standard V1 hastas.
                      </p>
                    )}
                    {result.correctionStatus === "worth_checking" && (
                      <div className="space-y-2">
                        <p className="text-[#420A10]/70 text-xs uppercase tracking-wider font-bold text-center">
                          Biomechanical Feedback
                        </p>
                        {result.corrections.map((c) => (
                          <div
                            key={c.finger}
                            className="text-[#420A10] text-xs bg-[#FFF8E1] rounded-2xl px-3.5 py-2.5 border border-[#C0912E]/30 flex items-start gap-2 shadow-xs"
                          >
                            <span className="text-[#C0912E] font-bold">•</span>
                            <span>{c.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#420A10]/10 flex justify-center">
              <button
                type="button"
                onClick={stopCamera}
                className="text-xs font-bold text-[#420A10] hover:text-[#370A0B] bg-[#420A10]/10 hover:bg-[#420A10]/15 px-6 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Stop Camera
              </button>
            </div>
          </>
        )}

        {status === "camera_denied" && (
          <div className="text-center py-6 space-y-3">
            <p className="text-[#420A10] font-bold text-sm">
              Camera permission is required for Mudra Studio.
            </p>
            <p className="text-xs text-[#6B5B52]">
              Please check your browser settings and allow camera access.
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="bg-[#420A10] text-[#F5F1E1] font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
        {status === "no_camera" && (
          <div className="text-center py-6 space-y-2">
            <p className="text-[#420A10] font-bold text-sm">
              No camera was detected on this device.
            </p>
            <p className="text-xs text-[#6B5B52]">
              Connect a webcam or enable camera permissions to use Mudra Studio.
            </p>
          </div>
        )}
        {status === "model_load_failed" && (
          <div className="text-center py-6 space-y-3">
            <p className="text-red-700 font-bold text-xs bg-red-50 p-3 rounded-xl border border-red-200">
              {errorMessage || "Failed to load MediaPipe model assets."}
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 bg-[#420A10] text-[#F5F1E1] font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Retry Initialization</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
