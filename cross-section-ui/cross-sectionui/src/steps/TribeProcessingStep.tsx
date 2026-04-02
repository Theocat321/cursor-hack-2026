import type { BrainScanResult } from '../types';
import BrainImageDisplay from '../components/BrainImageDisplay';

interface TribeProcessingStepProps {
  scans: BrainScanResult[];
  title: string;
  description: string;
}

export default function TribeProcessingStep({ scans, title, description }: TribeProcessingStepProps) {
  if (scans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-3xl mb-3 animate-pulse">🧠</div>
        <p className="text-sm text-accent font-mono">Processing with TRIBE v2...</p>
        <p className="text-[10px] text-muted mt-1">Predicting neural activation patterns</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-1">{title}</h3>
      <p className="text-[11px] text-muted mb-3">{description}</p>
      <div className={`grid ${scans.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-xs mx-auto'} gap-4`}>
        {scans.map((scan) => (
          <div key={scan.variantId} className="bg-surface border border-border rounded-[10px] p-4">
            <BrainImageDisplay scan={scan} compact={scans.length > 1} />
          </div>
        ))}
      </div>
    </div>
  );
}
