"use client";

import { useEffect } from "react";
import CameraView from "@/components/mudra/CameraView";
import { useMudraPipeline } from "@/hooks/useMudraPipeline";
import { Sparkles, Video, RefreshCw } from "lucide-react";

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
  } = useMudraPipeline();

  const cameraActive =
    status !== "idle" &&
    status !== "camera_denied" &&
    status !== "no_camera";

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
      <div className="w-full max-w-lg bg-white/95 rounded-3xl border border-[#420A10]/15 shadow-xl p-6">
        {!cameraActive && (
          <div className="text-center py-6">
            <p className="text-[#420A10]/80 text-sm font-medium mb-3">
              Supported Hasta Mudras (Abhinaya Darpana V1):
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mb-6">
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
              className="inline-flex items-center justify-center gap-2 bg-[#420A10] text-[#F5F1E1] hover:bg-[#370A0B] font-bold px-6 py-3 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95 text-sm"
            >
              <Video size={18} className="text-[#C0912E]" />
              <span>Start Camera</span>
            </button>

            {errorMessage && (
              <p className="text-red-700 text-xs mt-4 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {cameraActive && (
          <>
            <CameraView videoRef={videoRef} canvasRef={canvasRef} />

            <div className="mt-5 min-h-[120px] flex flex-col items-center justify-center">
              {status === "requesting_camera" && (
                <p className="text-[#420A10]/70 text-sm text-center animate-pulse">
                  Requesting camera access...
                </p>
              )}
              {status === "loading_model" && (
                <p className="text-[#420A10]/70 text-sm text-center animate-pulse">
                  Loading MediaPipe hand tracking & neural classifier...
                </p>
              )}
              {status === "running_no_hand" && (
                <div className="text-center py-3">
                  <p className="text-[#420A10]/70 text-sm font-semibold">
                    No hand detected in frame.
                  </p>
                  <p className="text-xs text-[#6B5B52] mt-1">
                    Place your palm in clear view of the camera.
                  </p>
                </div>
              )}
              {status === "running_uncertain" && (
                <p className="text-[#420A10]/70 text-sm text-center font-medium">
                  Hold your hand steady to detect mudra...
                </p>
              )}
              {status === "running_recognized" && result && (
                <div className="text-center w-full">
                  <p className="text-[#420A10]/60 text-[11px] uppercase tracking-wider font-bold mb-1">
                    Mudra Recognition
                  </p>
                  <p className="font-display text-3xl text-[#420A10] font-bold capitalize mb-2">
                    {MUDRA_NAMES_MAP[result.mudra.toLowerCase()] || result.mudra}
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E1] text-[#420A10] border border-[#C0912E]/40 text-xs font-bold shadow-xs">
                    <Sparkles size={13} className="text-[#C0912E]" />
                    <span>
                      Confidence: {(result.recognitionConfidence * 100).toFixed(0)}%
                    </span>
                  </span>

                  <div className="mt-4 text-left">
                    {result.correctionStatus === "clean" && (
                      <div className="text-center bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 text-xs font-bold">
                        ✓ Accurate form — fingers properly aligned!
                      </div>
                    )}
                    {result.correctionStatus === "disabled_for_mudra" && (
                      <p className="text-[#420A10]/50 text-xs text-center italic">
                        Biomechanical correction feedback isn&apos;t available yet for this mudra.
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
                            className="text-[#420A10] text-xs bg-[#FFF8E1] rounded-xl px-3.5 py-2.5 border border-[#C0912E]/30 flex items-start gap-2"
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
                className="text-xs font-bold text-[#420A10] hover:text-[#370A0B] bg-[#420A10]/10 hover:bg-[#420A10]/15 px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
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
          <div className="text-center py-6">
            <p className="text-[#420A10] font-bold text-sm">
              No camera was detected on this device.
            </p>
          </div>
        )}
        {status === "model_load_failed" && (
          <div className="text-center py-6 space-y-3">
            <p className="text-red-700 font-bold text-xs bg-red-50 p-3 rounded-xl">
              {errorMessage || "Failed to load MediaPipe model"}
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 bg-[#420A10] text-[#F5F1E1] font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
