import { useEffect } from 'react';
import Wordmark from './components/Wordmark';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import CameraView from './components/CameraView';
import { useMudraPipeline } from './hooks/useMudraPipeline';

const V1_MUDRAS = [
  'pataka', 'tripataka', 'ardhpataka', 'mushti', 'shikhar',
  'kapitth', 'chatur', 'kartarimukh', 'soochi', 'ardhachandra',
];

export default function App() {
  const { status, result, errorMessage, videoRef, canvasRef, startCamera, stopCamera } =
    useMudraPipeline();

  useEffect(() => {
    document.title = 'रियाज़ — Mudra Studio';
  }, []);

  const cameraActive = status !== 'idle' && status !== 'camera_denied' && status !== 'no_camera';

  return (
    <div className="min-h-screen bg-cream px-4 py-10 flex flex-col items-center">
      <Wordmark />
      <p className="text-ink/70 text-sm mb-6 -mt-4">Practice with your hand</p>

      <Card className="w-full max-w-lg">
        {!cameraActive && (
          <div className="text-center py-6">
            <p className="text-ink/70 text-sm mb-4">
              Supports: {V1_MUDRAS.join(', ')}
            </p>
            <Button onClick={startCamera}>Start Camera</Button>
            {errorMessage && (
              <p className="text-ink/70 text-sm mt-3">{errorMessage}</p>
            )}
          </div>
        )}

        {cameraActive && (
          <>
            <CameraView videoRef={videoRef} canvasRef={canvasRef} />

            <div className="mt-4 min-h-[120px]">
              {status === 'requesting_camera' && (
                <p className="text-ink/70 text-sm text-center">Requesting camera access...</p>
              )}
              {status === 'loading_model' && (
                <p className="text-ink/70 text-sm text-center">Loading hand tracking...</p>
              )}
              {status === 'running_no_hand' && (
                <p className="text-ink/70 text-sm text-center">
                  No hand detected. Place one hand in view.
                </p>
              )}
              {status === 'running_uncertain' && (
                <p className="text-ink/70 text-sm text-center">Hold your hand steady.</p>
              )}
              {status === 'running_recognized' && result && (
                <div className="text-center">
                  <p className="text-ink/60 text-xs uppercase tracking-wide mb-1">Recognition</p>
                  <p className="font-display text-2xl text-ink font-bold capitalize mb-1">
                    {result.mudra}
                  </p>
                  <Badge tone="gold">
                    Confidence: {(result.recognitionConfidence * 100).toFixed(0)}%
                  </Badge>

                  <div className="mt-4 text-left">
                    {result.correctionStatus === 'clean' && (
                      <p className="text-ink/70 text-sm text-center">
                        Looks consistent — no issues flagged.
                      </p>
                    )}
                    {result.correctionStatus === 'disabled_for_mudra' && (
                      <p className="text-ink/50 text-sm text-center italic">
                        Correction feedback isn't available yet for this mudra.
                      </p>
                    )}
                    {result.correctionStatus === 'worth_checking' && (
                      <div className="space-y-2">
                        <p className="text-ink/60 text-xs uppercase tracking-wide text-center">
                          Worth checking
                        </p>
                        {result.corrections.map((c) => (
                          <p key={c.finger} className="text-ink text-sm bg-gold/10 rounded-lg px-3 py-2">
                            {c.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Button variant="secondary" onClick={stopCamera}>Stop Camera</Button>
            </div>
          </>
        )}

        {status === 'camera_denied' && (
          <div className="text-center py-6">
            <p className="text-ink font-semibold mb-1">Camera permission is required for Mudra Studio.</p>
            <Button onClick={startCamera}>Try Again</Button>
          </div>
        )}
        {status === 'no_camera' && (
          <div className="text-center py-6">
            <p className="text-ink font-semibold mb-1">No camera was detected.</p>
          </div>
        )}
        {status === 'model_load_failed' && (
          <div className="text-center py-6">
            <p className="text-ink font-semibold mb-1">{errorMessage}</p>
            <Button onClick={startCamera}>Retry</Button>
          </div>
        )}
      </Card>
    </div>
  );
}