import { Camera } from 'lucide-react';
import Wordmark from './components/Wordmark';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';

export default function App() {
  return (
    <div className="min-h-screen bg-cream px-4 py-10 flex flex-col items-center">
      <Wordmark />

      <Card className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-ink/10 flex items-center justify-center mx-auto mb-4">
          <Camera className="text-ink/50" size={24} />
        </div>
        <p className="text-ink font-semibold mb-1">Camera not yet connected</p>
        <p className="text-ink/60 text-sm mb-4">
          Hand tracking arrives in a later milestone (Phase 4).
        </p>
        <div className="flex justify-center mb-4">
          <Badge tone="neutral">MOCKED — disabled</Badge>
        </div>
        <Button disabled>Enable Camera</Button>
      </Card>
    </div>
  );
}