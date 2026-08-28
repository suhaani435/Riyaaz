interface Props {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function CameraView({ videoRef, canvasRef }: Props) {
    return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-ink/90">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                playsInline
                muted
            />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full -scale-x-100"
            />
        </div>
    );
}