/**
 * LAYOUT B: "Horizontal Pipeline"
 * All steps as cards left-to-right. Active step expands.
 */
import { usePipeline, BrainVis, SiteFrame, NavButtons, ORIGINAL_URL, STEPS } from './shared';

function MiniSummary({ step, state }: { step: number; state: any }) {
  if (step === 0) return <span className="text-lg">📹</span>;
  if (step === 1 && state.scan1) return <span className="text-sm font-mono text-danger">{state.scan1.overall_engagement.toFixed(2)}</span>;
  if (step === 2) return <span className="text-lg">📊</span>;
  if (step === 3) return <span className="text-lg">🤖</span>;
  if (step === 4) return <span className="text-lg">👀</span>;
  if (step === 5 && state.scan2) return <span className="text-sm font-mono text-success">{state.scan2.overall_engagement.toFixed(2)}</span>;
  if (step === 6) return <span className="text-lg">🏆</span>;
  if (step === 7) return <span className="text-lg">🔄</span>;
  return <span className="text-lg">{STEPS[step]?.icon}</span>;
}

export default function LayoutB() {
  const { state, goNext, goPrev, handleRestart, uplift } = usePipeline();
  const active = state.activeStep;

  const renderExpanded = () => {
    switch (active) {
      case 0: return <SiteFrame url={ORIGINAL_URL} label="Original" className="h-full" />;
      case 1: return state.scan1 ? <div className="flex justify-center items-center h-full"><BrainVis scan={state.scan1} label="Original" /></div> : null;
      case 2: return state.scan1 ? (
        <div className="flex items-center justify-center h-full">
          <div className={`px-4 py-3 rounded-lg border ${state.scan1.overall_engagement < 0.6 ? 'bg-danger/5 border-danger/20' : 'bg-success/5 border-success/20'}`}>
            <p className={`text-sm font-mono font-semibold ${state.scan1.overall_engagement < 0.6 ? 'text-danger' : 'text-success'}`}>
              {state.scan1.overall_engagement.toFixed(2)} — {state.scan1.overall_engagement < 0.6 ? 'Low engagement' : 'Strong baseline'}
            </p>
          </div>
        </div>
      ) : null;
      case 3: return state.suggestion ? (
        <div className="p-3 space-y-2 overflow-y-auto h-full">
          <div className="bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
            <p className="text-[10px] text-accent">{state.suggestion.summary}</p>
          </div>
          {state.suggestion.changes.map((c, i) => (
            <div key={c.target} className="bg-bg rounded-lg p-2">
              <span className="text-[9px] font-mono font-semibold text-text uppercase">{i+1}. {c.target}</span>
              <p className="text-[9px] text-secondary">{c.description}</p>
            </div>
          ))}
        </div>
      ) : null;
      case 4: return (
        <div className="grid grid-cols-2 gap-2 p-2 h-full">
          <SiteFrame url={ORIGINAL_URL} label="Original" className="h-full" />
          <SiteFrame url={ORIGINAL_URL} label="Modified" className="h-full" />
        </div>
      );
      case 5: return state.scan1 && state.scan2 ? (
        <div className="flex justify-center items-center gap-6 h-full">
          <BrainVis scan={state.scan1} label="Original" size="sm" />
          <BrainVis scan={state.scan2} label="Modified" size="sm" />
        </div>
      ) : null;
      case 6: return state.scan1 && state.scan2 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-4xl font-mono font-extrabold bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">+{uplift.toFixed(0)}%</div>
          <div className="text-[9px] text-muted font-mono uppercase mt-1">uplift</div>
        </div>
      ) : null;
      case 7: return (
        <div className="flex flex-col items-center justify-center h-full">
          <button onClick={handleRestart} className="text-xs font-mono uppercase px-4 py-2 rounded bg-accent text-bg cursor-pointer">Next Iteration →</button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="h-screen bg-bg text-text font-sans flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-mono font-bold"><span className="text-accent">NEURO</span><span className="text-muted">SPLIT</span></h1>
          <span className="text-[9px] font-mono text-muted bg-surface border border-border px-2 py-1 rounded">LAYOUT B</span>
        </div>
        <NavButtons goNext={goNext} goPrev={goPrev} active={active} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {STEPS.map((step, i) => {
          const isActive = i === active;
          const isDone = i < active;

          return (
            <div
              key={step.label}
              className={`border-r border-border transition-all duration-500 flex flex-col overflow-hidden ${
                isActive ? 'flex-[4] bg-surface' : 'flex-[1] bg-bg hover:bg-surface/30'
              }`}
            >
              {/* Step header */}
              <div className={`shrink-0 px-2 py-2 border-b border-border text-center ${isActive ? 'bg-accent/10' : ''}`}>
                <div className={`text-[8px] font-mono uppercase tracking-wider ${
                  isActive ? 'text-accent' : isDone ? 'text-success' : 'text-muted/40'
                }`}>
                  {isDone ? '✓' : step.icon} {isActive ? step.label : ''}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {isActive ? renderExpanded() : (
                  <div className="flex items-center justify-center h-full">
                    {isDone ? <MiniSummary step={i} state={state} /> : <span className="text-muted/20 text-lg">{step.icon}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
