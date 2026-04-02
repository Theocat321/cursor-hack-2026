import type { BrainScanResult } from '../types';
import BrainImageDisplay from '../components/BrainImageDisplay';

interface OutcomeStepProps {
  scan: BrainScanResult | null;
}

export default function OutcomeStep({ scan }: OutcomeStepProps) {
  if (!scan) return <div className="text-center text-muted text-sm py-12">Waiting for scan...</div>;

  const engagement = scan.overall_engagement;
  const isLow = engagement < 0.6;

  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-1">Record Outcome</h3>
      <p className="text-[11px] text-muted mb-3">Brain activity prediction for the current design.</p>

      <div className="bg-surface border border-border rounded-[10px] p-4 max-w-xs mx-auto">
        <BrainImageDisplay scan={scan} />
      </div>

      {/* Assessment */}
      <div className={`mt-3 text-center px-4 py-2 rounded-lg border ${
        isLow ? 'bg-danger/5 border-danger/20' : 'bg-success/5 border-success/20'
      }`}>
        <p className={`text-xs font-mono font-semibold ${isLow ? 'text-danger' : 'text-success'}`}>
          {isLow
            ? `Low engagement (${engagement.toFixed(2)}) — room for improvement`
            : `Good engagement (${engagement.toFixed(2)}) — strong baseline`}
        </p>
      </div>
    </div>
  );
}
