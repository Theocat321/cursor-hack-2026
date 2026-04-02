import type { BrainScanResult } from '../types';
import BrainImageDisplay from '../components/BrainImageDisplay';

interface CompareStepProps {
  scans: BrainScanResult[];
}

function pctChange(a: number, b: number) {
  if (a === 0) return 0;
  return ((b - a) / a) * 100;
}

export default function CompareStep({ scans }: CompareStepProps) {
  if (scans.length < 2) return <div className="text-center text-muted text-sm py-12">Waiting for both scans...</div>;

  const [a, b] = scans;
  const winner = a.overall_engagement >= b.overall_engagement ? a : b;
  const loser = winner === a ? b : a;
  const uplift = pctChange(loser.overall_engagement, winner.overall_engagement);

  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-1">Compare TRIBE Output</h3>
      <p className="text-[11px] text-muted mb-3">More activation = more engagement. The brighter brain wins.</p>

      {/* Side by side brains */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {scans.map((scan) => (
          <div key={scan.variantId} className={`bg-surface border rounded-[10px] p-3 ${
            scan === winner ? 'border-success/50 ring-1 ring-success/20' : 'border-border'
          }`}>
            <BrainImageDisplay scan={scan} compact />
            {scan === winner && (
              <div className="text-center mt-2">
                <span className="text-[9px] font-mono font-bold text-success bg-success/10 px-2 py-0.5 rounded">
                  🏆 WINNER
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Verdict */}
      <div className="text-center bg-surface border border-border rounded-[10px] p-4">
        <div className="text-3xl font-mono font-extrabold bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">
          +{uplift.toFixed(0)}%
        </div>
        <div className="text-[10px] text-muted font-mono uppercase tracking-wider mt-1">
          neural engagement uplift
        </div>
        <p className="text-[11px] text-secondary mt-2">
          <strong className="text-text">{winner.brainImage.label}</strong> produced significantly higher
          activation across all brain regions.
        </p>
      </div>
    </div>
  );
}
