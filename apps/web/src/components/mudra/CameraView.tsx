import React from "react";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function CameraView({ videoRef, canvasRef }: Props) {
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-[#370A0B] shadow-inner border border-[#C0912E]/30">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none"
      />
    </div>
  );
}