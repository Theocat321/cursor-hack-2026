import type { ComparisonResult } from '../types';

interface IterationHistoryProps {
  history: ComparisonResult[];
}

export default function IterationHistory({ history }: IterationHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl p-6">
      <h3 className="text-dash-text font-sans font-semibold mb-4">
        Iteration History
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {history.map((result) => (
          <div
            key={result.round}
            className="flex-shrink-0 bg-dash-bg border border-dash-border rounded-lg p-4 min-w-[140px]"
          >
            <div className="text-xs text-dash-muted font-mono mb-2">
              Round {result.round}
            </div>
            <div className="text-sm font-sans font-bold text-dash-accent mb-1">
              {result.winner === 'a' ? 'A' : 'B'} 🏆
            </div>
            <div className="text-xs text-dash-muted font-mono">
              {result.score_a.toFixed(2)} vs {result.score_b.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
