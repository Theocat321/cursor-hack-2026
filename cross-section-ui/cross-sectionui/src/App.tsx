import { useState, useCallback } from 'react';
import { STEPS, type PipelineState, type WebsiteRecording } from './types';
import { mockScanOriginal, mockScanModified, mockSuggestion } from './mocks/data';
import ProgressStepper from './components/ProgressStepper';
import RecordWebsiteStep from './steps/RecordWebsiteStep';
import TribeProcessingStep from './steps/TribeProcessingStep';
import OutcomeStep from './steps/OutcomeStep';
import SuggestVariantStep from './steps/SuggestVariantStep';
import CompareStep from './steps/CompareStep';
import LoopStep from './steps/LoopStep';

const STEP_DELAY = 2000;

const initialWebsites: WebsiteRecording[] = [
  { id: 'original', label: 'londonmaxxing.com', variant: 'original', screenshotUrl: null },
];

const initial: PipelineState = {
  currentStep: 0,
  iteration: 1,
  status: 'idle',
  websites: initialWebsites,
  scans: [],
  suggestion: null,
  winner: null,
};

export default function App() {
  const [state, setState] = useState<PipelineState>(initial);

  const goToStep = useCallback((step: number) => {
    setState((s) => ({ ...s, currentStep: step }));
  }, []);

  const runPipeline = useCallback(() => {
    setState((s) => ({
      ...s,
      status: 'running',
      currentStep: 0,
      scans: [],
      suggestion: null,
      winner: null,
      websites: [initialWebsites[0]],
    }));

    const steps = [
      // 0: Record website (1 website)
      () => setState((s) => ({ ...s, currentStep: 0 })),
      // 1: Pass to TRIBE
      () => setState((s) => ({ ...s, currentStep: 1, scans: [mockScanOriginal] })),
      // 2: Record outcome
      () => setState((s) => ({ ...s, currentStep: 2 })),
      // 3: LLM suggests variant
      () => setState((s) => ({
        ...s,
        currentStep: 3,
        suggestion: mockSuggestion,
        websites: [
          ...s.websites,
          { id: 'modified', label: 'londonmaxxing.com/v2', variant: 'modified' as const, screenshotUrl: null },
        ],
      })),
      // 4: Both to TRIBE (2 websites, 2 brain images)
      () => setState((s) => ({ ...s, currentStep: 4, scans: [mockScanOriginal, mockScanModified] })),
      // 5: Compare output
      () => setState((s) => ({ ...s, currentStep: 5 })),
      // 6: Take winner
      () => setState((s) => ({ ...s, currentStep: 6, status: 'done', winner: 'modified' })),
    ];

    steps[0]();
    steps.slice(1).forEach((fn, i) => {
      setTimeout(fn, STEP_DELAY * (i + 1));
    });
  }, []);

  const handleRestart = useCallback(() => {
    setState((s) => ({
      ...s,
      iteration: s.iteration + 1,
      currentStep: 0,
      status: 'idle',
      scans: [],
      suggestion: null,
      winner: null,
      websites: [initialWebsites[0]],
    }));
  }, []);

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <RecordWebsiteStep websites={state.websites} />;
      case 1:
        return (
          <TribeProcessingStep
            scans={state.scans}
            title="Pass to TRIBE"
            description="Running TRIBE v2 neural prediction on the recorded website."
          />
        );
      case 2:
        return <OutcomeStep scan={state.scans[0] ?? null} />;
      case 3:
        return <SuggestVariantStep suggestion={state.suggestion} />;
      case 4:
        return (
          <TribeProcessingStep
            scans={state.scans}
            title="Both Variants to TRIBE"
            description="Running TRIBE v2 on both variants simultaneously."
          />
        );
      case 5:
        return <CompareStep scans={state.scans} />;
      case 6:
        return (
          <LoopStep
            winnerLabel={state.winner === 'modified' ? 'Electric London' : 'Golden London'}
            iteration={state.iteration}
            onRestart={handleRestart}
          />
        );
      default:
        return null;
    }
  };

  const isRunning = state.status === 'running';

  return (
    <div className="h-screen bg-bg text-text font-sans flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-mono font-bold tracking-tight">
            <span className="text-accent">NEURO</span><span className="text-muted">SPLIT</span>
          </h1>
          <span className="text-[9px] font-mono text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
            TRIBE v2
          </span>
          {state.iteration > 1 && (
            <span className="text-[9px] font-mono text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
              Iteration {state.iteration}
            </span>
          )}
        </div>
        <button
          onClick={runPipeline}
          disabled={isRunning}
          className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer ${
            isRunning
              ? 'bg-accent/20 text-accent animate-pulse cursor-wait'
              : 'bg-accent text-bg hover:bg-accent/80'
          }`}
        >
          {isRunning ? '● Running...' : state.status === 'done' ? '▶ Run again' : '▶ Run pipeline'}
        </button>
      </header>

      {/* Stepper */}
      <div className="border-b border-border shrink-0">
        <ProgressStepper
          currentStep={state.currentStep}
          iteration={state.iteration}
          onStepClick={goToStep}
          disabled={isRunning}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="max-w-2xl mx-auto">
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between px-4 py-2 border-t border-border shrink-0">
        <button
          onClick={() => goToStep(state.currentStep - 1)}
          disabled={state.currentStep === 0 || isRunning}
          className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded bg-surface border border-border text-secondary hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          ← Previous
        </button>
        <span className="text-[9px] font-mono text-muted self-center">
          Step {state.currentStep + 1} / {STEPS.length}
        </span>
        <button
          onClick={() => goToStep(state.currentStep + 1)}
          disabled={state.currentStep === STEPS.length - 1 || isRunning}
          className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
