/**
 * LAYOUT A: "Two-Column Split"
 * Left: website iframes (always visible). Right: active step output.
 */
import { usePipeline, BrainVis, SiteFrame, NavButtons, ProgressBar, ORIGINAL_URL, STEPS } from './shared';

export default function LayoutA() {
  const { state, goNext, goPrev, handleRestart, pct, uplift } = usePipeline();
  const active = state.activeStep;

  const renderRight = () => {
    switch (active) {
      case 0: return (
        <div className="flex items-center justify-center h-full text-muted text-xs font-mono">Recording website...</div>
      );
      case 1: return state.scan1 ? <div className="flex justify-center"><BrainVis scan={state.scan1} label="Original" /></div> : null;
      case 2: return state.scan1 ? (
        <div className={`text-center px-3 py-3 rounded-lg border ${state.scan1.overall_engagement < 0.6 ? 'bg-danger/5 border-danger/20' : 'bg-success/5 border-success/20'}`}>
          <p className={`text-sm font-mono font-semibold ${state.scan1.overall_engagement < 0.6 ? 'text-danger' : 'text-success'}`}>
            Engagement: {state.scan1.overall_engagement.toFixed(2)}<br />
            <span className="text-xs font-normal">{state.scan1.overall_engagement < 0.6 ? 'Low. Room for improvement.' : 'Strong baseline.'}</span>
          </p>
        </div>
      ) : null;
      case 3: return state.suggestion ? (
        <div className="space-y-2 overflow-y-auto max-h-full">
          <div className="bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
            <p className="text-[10px] text-accent font-medium">{state.suggestion.summary}</p>
          </div>
          {state.suggestion.changes.map((c, i) => (
            <div key={c.target} className="flex gap-2 items-start bg-bg rounded-lg p-2">
              <span className="w-4 h-4 shrink-0 rounded-full bg-accent/20 text-accent text-[9px] font-mono font-bold flex items-center justify-center mt-0.5">{i+1}</span>
              <div>
                <span className="text-[10px] font-mono font-semibold text-text uppercase">{c.target}</span>
                <p className="text-[10px] text-secondary leading-relaxed">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null;
      case 4: return <div className="flex items-center justify-center h-full text-muted text-xs font-mono">← Showing both variants</div>;
      case 5: return state.scan1 && state.scan2 ? (
        <div className="grid grid-cols-2 gap-4">
          <BrainVis scan={state.scan1} label="Original" />
          <BrainVis scan={state.scan2} label="Modified" />
        </div>
      ) : null;
      case 6: return state.scan1 && state.scan2 ? (
        <div className="text-center">
          <div className="text-5xl font-mono font-extrabold bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">+{uplift.toFixed(0)}%</div>
          <div className="text-[10px] text-muted font-mono uppercase tracking-wider mt-1 mb-3">neural engagement uplift</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg border border-border rounded-lg p-3 text-center">
              <div className="text-[9px] font-mono text-muted uppercase mb-1">Original</div>
              <div className="text-xl font-mono font-bold text-danger">{state.scan1.overall_engagement.toFixed(2)}</div>
            </div>
            <div className="bg-bg border border-success/30 rounded-lg p-3 text-center ring-1 ring-success/10">
              <div className="text-[9px] font-mono text-muted uppercase mb-1">Modified 🏆</div>
              <div className="text-xl font-mono font-bold text-success">{state.scan2.overall_engagement.toFixed(2)}</div>
            </div>
          </div>
        </div>
      ) : null;
      case 7: return (
        <div className="text-center">
          <p className="text-sm text-muted mb-3"><strong className="text-accent">Modified</strong> → new baseline</p>
          <button onClick={handleRestart} className="text-xs font-mono uppercase px-4 py-2 rounded bg-accent text-bg hover:bg-accent/80 cursor-pointer">Next Iteration →</button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="h-screen bg-bg text-text font-sans flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-bold"><span className="text-accent">NEURO</span><span className="text-muted">SPLIT</span></h1>
            <span className="text-[9px] font-mono text-muted bg-surface border border-border px-2 py-1 rounded">LAYOUT A</span>
          </div>
          <NavButtons goNext={goNext} goPrev={goPrev} active={active} />
        </div>
        <ProgressBar pct={pct} active={active} />
      </div>

      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* Left: Websites */}
        <div className="border-r border-border p-4 flex flex-col gap-3 overflow-hidden">
          <SiteFrame url={ORIGINAL_URL} label="Original" className="flex-1" />
          {active >= 4 ? (
            <SiteFrame url={ORIGINAL_URL} label="Modified" className="flex-1" />
          ) : (
            <div className="flex-1 bg-surface border border-border rounded-lg flex items-center justify-center">
              <p className="text-[10px] font-mono text-muted/40">Variant B — pending</p>
            </div>
          )}
        </div>

        {/* Right: Step output */}
        <div className="p-6 overflow-y-auto flex flex-col justify-center">
          <div className="text-[9px] font-mono text-accent uppercase tracking-wider mb-2">
            Step {active + 1}: {STEPS[active]?.label}
          </div>
          {renderRight()}
        </div>
      </div>
    </div>
  );
}
