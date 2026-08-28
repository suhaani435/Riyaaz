import { useEffect, useRef } from "react";

/**
 * Waveform
 *
 * Phase 3: REAL MICROPHONE RECORDING
 * Draws a live waveform directly from the microphone's real
 * AnalyserNode via getByteTimeDomainData. Every point drawn here is
 * real audio-energy data pulled from the browser's Web Audio API —
 * nothing is randomly generated or simulated. When no analyser is
 * available yet, this renders an honest flat idle line instead of
 * fabricating motion.
 */

interface WaveformProps {
    analyserNode: AnalyserNode | null;
}

export default function Waveform({ analyserNode }: WaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        if (!analyserNode) {
            const { width, height } = canvas;
            context.clearRect(0, 0, width, height);
            context.strokeStyle = "#9C8F7E";
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(0, height / 2);
            context.lineTo(width, height / 2);
            context.stroke();
            return;
        }

        const bufferLength = analyserNode.fftSize;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            frameRef.current = requestAnimationFrame(draw);
            analyserNode.getByteTimeDomainData(dataArray);

            const { width, height } = canvas;
            context.clearRect(0, 0, width, height);
            context.lineWidth = 2;
            context.strokeStyle = "#420A10";
            context.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const normalized = dataArray[i] / 128 - 1;
                const y = height / 2 + normalized * (height / 2 - 4);
                if (i === 0) {
                    context.moveTo(x, y);
                } else {
                    context.lineTo(x, y);
                }
                x += sliceWidth;
            }

            context.stroke();
        };

        draw();

        return () => {
            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        };
    }, [analyserNode]);

    return (
        <canvas
            ref={canvasRef}
            width={320}
            height={80}
            role="img"
            aria-label="Live microphone waveform"
            className="w-full max-w-sm rounded-lg border border-khaali/40 bg-white/40"
        />
    );
}