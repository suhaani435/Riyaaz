import { useCallback, useEffect, useRef, useState } from 'react';

import {
    FilesetResolver,
    HandLandmarker,
} from '@mediapipe/tasks-vision';

import type {
    HandLandmarkerResult,
} from '@mediapipe/tasks-vision';

import {
    extractFeatures,
    featuresAsMap,
    normalizeLandmarks,
} from '@/lib/mudra/geometricFeatures';

import { loadClassifier, predict } from '@/lib/mudra/classifier';
import type { ClassifierModel } from '@/lib/mudra/classifier';

import { applyPataTriTriadOverride } from '@/lib/mudra/override';

import {
    computeCorrections,
    loadCorrectionConfig,
} from '@/lib/mudra/correction';
import type { CorrectionConfig } from '@/lib/mudra/correction';

import type {
    PipelineStatus,
    RecognitionResult,
} from '@/lib/mudra/types';

// Confidence below this is treated as "uncertain" -- a UX heuristic,
// NOT a calibrated statistic. Disclosed as such; not validated against data.
const UNCERTAIN_CONFIDENCE_THRESHOLD = 0.4;

// How often (ms) we allow the DISPLAYED recognition/correction state to
// change. MediaPipe detection itself still runs every animation frame for
// a smooth landmark overlay; this only throttles React state churn.
const RESULT_UPDATE_INTERVAL_MS = 250;

export function useMudraPipeline() {
    const [status, setStatus] = useState<PipelineStatus>('idle');
    const [result, setResult] = useState<RecognitionResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const landmarkerRef = useRef<HandLandmarker | null>(null);
    const classifierRef = useRef<ClassifierModel | null>(null);
    const correctionConfigRef = useRef<CorrectionConfig | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastResultUpdateRef = useRef<number>(0);

    const stopCamera = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setStatus('idle');
        setResult(null);
    }, []);

    const drawOverlay = useCallback(
        (handResult: HandLandmarkerResult) => {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            if (!canvas || !video) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const connections: [number, number][] = [
                [0, 1],
                [1, 2],
                [2, 3],
                [3, 4],

                [0, 5],
                [5, 6],
                [6, 7],
                [7, 8],

                [0, 9],
                [9, 10],
                [10, 11],
                [11, 12],

                [0, 13],
                [13, 14],
                [14, 15],
                [15, 16],

                [0, 17],
                [17, 18],
                [18, 19],
                [19, 20],

                [5, 9],
                [9, 13],
                [13, 17],
            ];

            for (const lm of handResult.landmarks) {
                ctx.strokeStyle = '#C0912E';
                ctx.lineWidth = 2;

                for (const [a, b] of connections) {
                    ctx.beginPath();
                    ctx.moveTo(
                        lm[a].x * canvas.width,
                        lm[a].y * canvas.height
                    );
                    ctx.lineTo(
                        lm[b].x * canvas.width,
                        lm[b].y * canvas.height
                    );
                    ctx.stroke();
                }

                ctx.fillStyle = '#420A10';

                for (const p of lm) {
                    ctx.beginPath();
                    ctx.arc(
                        p.x * canvas.width,
                        p.y * canvas.height,
                        3,
                        0,
                        2 * Math.PI
                    );
                    ctx.fill();
                }
            }
        },
        []
    );

    const detectLoop = useCallback(() => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        const classifierModel = classifierRef.current;
        const correctionConfig = correctionConfigRef.current;

        if (
            !video ||
            !landmarker ||
            !classifierModel ||
            !correctionConfig
        ) {
            return;
        }

        if (video.readyState >= 2) {
            const handResult = landmarker.detectForVideo(
                video,
                performance.now()
            );

            drawOverlay(handResult);

            const now = performance.now();

            const shouldUpdate =
                now - lastResultUpdateRef.current >
                RESULT_UPDATE_INTERVAL_MS;

            if (handResult.landmarks.length === 0) {
                if (shouldUpdate) {
                    setStatus('running_no_hand');
                    setResult(null);
                    lastResultUpdateRef.current = now;
                }
            } else {
                // Multiple hands: use the one with the higher handedness score.
                let idx = 0;

                if (handResult.handedness.length > 1) {
                    let bestScore = -1;

                    handResult.handedness.forEach((h, i) => {
                        if (h[0].score > bestScore) {
                            bestScore = h[0].score;
                            idx = i;
                        }
                    });
                }

                const rawLandmarks = handResult.landmarks[idx].map(
                    (p) => ({
                        x: p.x,
                        y: p.y,
                        z: p.z,
                    })
                );

                const normalized =
                    normalizeLandmarks(rawLandmarks);

                const featureValues =
                    extractFeatures(normalized);

                const featureMap =
                    featuresAsMap(featureValues);

                const { top, topProb } =
                    predict(
                        classifierModel,
                        featureValues
                    );

                if (shouldUpdate) {
                    if (
                        topProb <
                        UNCERTAIN_CONFIDENCE_THRESHOLD
                    ) {
                        setStatus('running_uncertain');
                        setResult(null);
                    } else {
                        const {
                            finalMudra,
                            used,
                        } = applyPataTriTriadOverride(
                            top,
                            featureMap['ring_flex_angle']
                        );

                        const {
                            status: correctionStatus,
                            corrections,
                        } = computeCorrections(
                            correctionConfig,
                            finalMudra,
                            featureMap
                        );

                        setStatus('running_recognized');

                        setResult({
                            mudra: finalMudra,
                            recognitionConfidence: topProb,
                            correctionStatus,
                            corrections,
                            usedOverride: used,
                        });
                    }

                    lastResultUpdateRef.current = now;
                }
            }
        }

        rafRef.current =
            requestAnimationFrame(detectLoop);
    }, [drawOverlay]);

    const startCamera = useCallback(async () => {
        setErrorMessage(null);
        setStatus('requesting_camera');

        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                    },
                });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err) {
            if (
                err instanceof DOMException &&
                err.name === 'NotAllowedError'
            ) {
                setStatus('camera_denied');
                setErrorMessage(
                    'Camera permission is required for Mudra Studio.'
                );
            } else if (
                err instanceof DOMException &&
                err.name === 'NotFoundError'
            ) {
                setStatus('no_camera');
                setErrorMessage(
                    'No camera was detected.'
                );
            } else {
                setStatus('no_camera');
                setErrorMessage(
                    'Camera initialization failed.'
                );
            }

            return;
        }

        setStatus('loading_model');

        try {
            if (!landmarkerRef.current) {
                const vision =
                    await FilesetResolver.forVisionTasks(
                        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                    );

                landmarkerRef.current =
                    await HandLandmarker.createFromOptions(
                        vision,
                        {
                            baseOptions: {
                                modelAssetPath:
                                    '/models/hand_landmarker.task',
                                delegate: 'GPU',
                            },

                            runningMode: 'VIDEO',

                            numHands: 2,

                            minHandDetectionConfidence: 0.2,

                            minHandPresenceConfidence: 0.1,

                            minTrackingConfidence: 0.1,
                        }
                    );
            }

            if (!classifierRef.current) {
                classifierRef.current =
                    await loadClassifier();
            }

            if (!correctionConfigRef.current) {
                correctionConfigRef.current =
                    await loadCorrectionConfig();
            }
        } catch (err) {
            setStatus('model_load_failed');

            setErrorMessage(
                'Failed to load hand tracking. Check your connection and try again.'
            );

            return;
        }

        setStatus('running_no_hand');

        rafRef.current =
            requestAnimationFrame(detectLoop);
    }, [detectLoop]);

    useEffect(() => {
        return () => {
            stopCamera();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        status,
        result,
        errorMessage,
        videoRef,
        canvasRef,
        startCamera,
        stopCamera,
    };
}