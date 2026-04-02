import { useState } from 'react';
import type { DashboardState } from '../types';
import { runPipeline } from '../api/neurosplit';
import VariantPreview from './VariantPreview';
import ComparisonPanel from './ComparisonPanel';
import RunTestButton from './RunTestButton';
import IterationHistory from './IterationHistory';

const initialState: DashboardState = {
  isRunning: false,
  status: 'idle',
  screenshots: { a: null, b: null },
  results: { a: null, b: null },
  comparison: null,
  history: [],
  error: null,
};

export default function Dashboard() {
  const [state, setState] = useState<DashboardState>(initialState);

  const handleRunTest = async () => {
    setState((s) => ({
      ...s,
      isRunning: true,
      status: 'capturing',
      error: null,
    }));

    try {
      const result = await runPipeline((status) =>
        setState((s) => ({ ...s, status }))
      );

      setState((s) => ({
        ...s,
        isRunning: false,
        status: 'done',
        results: { a: result.resultA, b: result.resultB },
        comparison: result.comparison,
        history: [...s.history, result.comparison],
      }));
    } catch {
      setState((s) => ({
        ...s,
        isRunning: false,
        status: 'error',
        error: 'Pipeline failed. Check backend connection.',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-dash-bg text-dash-text">
      {/* Header */}
      <header className="border-b border-dash-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-sans font-bold tracking-tight">
            <span className="text-dash-accent">Neuro</span>Split
          </h1>
          <span className="text-xs text-dash-muted font-mono bg-dash-surface px-2 py-0.5 rounded">
            TRIBE v2
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/website?variant=a"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-dash-muted hover:text-dash-accent transition-colors font-mono"
          >
            Variant A ↗
          </a>
          <a
            href="/website?variant=b"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-dash-muted hover:text-dash-accent transition-colors font-mono"
          >
            Variant B ↗
          </a>
          <RunTestButton status={state.status} onClick={handleRunTest} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Error banner */}
        {state.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm font-sans">
            {state.error}
          </div>
        )}

        {/* Variant previews */}
        <div className="grid md:grid-cols-2 gap-6">
          <VariantPreview
            variantId="a"
            label="Variant A"
            subtitle="Electric London — dark, neon, intense"
          />
          <VariantPreview
            variantId="b"
            label="Variant B"
            subtitle="Golden London — warm, editorial, spacious"
          />
        </div>

        {/* Comparison */}
        <ComparisonPanel
          resultA={state.results.a}
          resultB={state.results.b}
          comparison={state.comparison}
        />

        {/* History */}
        <IterationHistory history={state.history} />
      </main>
    </div>
  );
}
