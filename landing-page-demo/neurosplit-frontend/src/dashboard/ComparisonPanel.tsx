import type { BrainActivityResult, ComparisonResult } from '../types';
import BrainActivityBar from './BrainActivityBar';

interface ComparisonPanelProps {
  resultA: BrainActivityResult | null;
  resultB: BrainActivityResult | null;
  comparison: ComparisonResult | null;
}

export default function ComparisonPanel({
  resultA,
  resultB,
  comparison,
}: ComparisonPanelProps) {
  if (!resultA && !resultB) {
    return (
      <div className="bg-dash-surface border border-dash-border rounded-xl p-8 text-center">
        <p className="text-dash-muted font-sans">
          Run a test to see brain activity comparison
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl p-6">
      <h3 className="text-dash-text font-sans font-semibold mb-6">
        Brain Activity Comparison
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Variant A scores */}
        {resultA && (
          <div>
            <h4 className="text-sm font-sans font-medium text-dash-accent mb-4">
              Variant A — Electric London
            </h4>
            <BrainActivityBar
              label="Ventral (visual)"
              score={resultA.ventral_score}
              color="#00A3FF"
              animate
            />
            <BrainActivityBar
              label="Dorsal (spatial)"
              score={resultA.dorsal_score}
              color="#00A3FF"
              animate
            />
            <BrainActivityBar
              label="Prefrontal (attention)"
              score={resultA.prefrontal_score}
              color="#00A3FF"
              animate
            />
            <div className="mt-4 pt-4 border-t border-dash-border">
              <BrainActivityBar
                label="Overall Engagement"
                score={resultA.overall_engagement}
                color="#00F0FF"
                animate
              />
            </div>
          </div>
        )}

        {/* Variant B scores */}
        {resultB && (
          <div>
            <h4 className="text-sm font-sans font-medium text-golden-gold mb-4">
              Variant B — Golden London
            </h4>
            <BrainActivityBar
              label="Ventral (visual)"
              score={resultB.ventral_score}
              color="#C5960C"
              animate
            />
            <BrainActivityBar
              label="Dorsal (spatial)"
              score={resultB.dorsal_score}
              color="#C5960C"
              animate
            />
            <BrainActivityBar
              label="Prefrontal (attention)"
              score={resultB.prefrontal_score}
              color="#C5960C"
              animate
            />
            <div className="mt-4 pt-4 border-t border-dash-border">
              <BrainActivityBar
                label="Overall Engagement"
                score={resultB.overall_engagement}
                color="#C75B39"
                animate
              />
            </div>
          </div>
        )}
      </div>

      {/* Winner declaration */}
      {comparison && (
        <div className="mt-8 pt-6 border-t border-dash-border text-center">
          <div className="inline-flex items-center gap-2 bg-dash-accent/10 border border-dash-accent/30 rounded-full px-5 py-2 mb-3">
            <span className="text-lg">🏆</span>
            <span className="text-dash-accent font-sans font-bold text-sm uppercase tracking-wide">
              Winner: Variant {comparison.winner.toUpperCase()} —{' '}
              {comparison.winner === 'a' ? 'Electric London' : 'Golden London'}
            </span>
          </div>
          <p className="text-dash-muted text-sm font-sans max-w-xl mx-auto">
            {comparison.interpretation}
          </p>
          <p className="text-dash-muted/60 text-xs font-mono mt-2">
            Delta: {(comparison.delta * 100).toFixed(1)}% · Round{' '}
            {comparison.round}
          </p>
        </div>
      )}
    </div>
  );
}
