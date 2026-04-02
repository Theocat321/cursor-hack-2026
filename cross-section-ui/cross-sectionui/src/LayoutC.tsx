/**
 * LAYOUT C: "Three-Row Dashboard"
 * Top: websites (A|B), Middle: brain scans (A|B), Bottom: status/verdict
 * Cells fill in as pipeline progresses.
 */
import { usePipeline, BrainVis, SiteFrame, NavButtons, ProgressBar, ORIGINAL_URL, STEPS } from './shared';

function EmptyCell({ text }: { text: string }) {
  return (
    <div className="h-full bg-surface border border-border rounded-lg flex items-center justify-center">
      <p className="text-[10px] font-mono text-muted/30">{text}</p>
    </div>
  );
}

export default function LayoutC() {
  const { state, goNext, goPrev, handleRestart, pct, uplift } = usePipeline();
  const active = state.activeStep;

  return (
    <div className="h-screen bg-bg text-text font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-bold"><span className="text-accent">NEURO</span><span className="text-muted">SPLIT</span></h1>
            <span className="text-[9px] font-mono text-muted bg-surface border border-border px-2 py-1 rounded">LAYOUT C</span>
          </div>
          <NavButtons goNext={goNext} goPrev={goPrev} active={active} />
        </div>
        <ProgressBar pct={pct} active={active} />
      </div>

      {/* Row labels + grid */}
      <div className="flex-1 grid grid-rows-[1fr_1fr_auto] gap-0 overflow-hidden">

        {/* Row 1: Websites */}
        <div className="grid grid-cols-2 gap-3 p-3 border-b border-border">
          <div className="flex flex-col">
            <div className="text-[8px] font-mono text-muted uppercase tracking-wider mb-1 px-1">Website A — Original</div>
            <SiteFrame url={ORIGINAL_URL} label="londonmaxxing.com" className="flex-1" />
          </div>
          <div className="flex flex-col">
            <div className="text-[8px] font-mono text-muted uppercase tracking-wider mb-1 px-1">Website B — Modified</div>
            {active >= 4 ? (
              <SiteFrame url={ORIGINAL_URL} label="londonmaxxing.com/v2" className="flex-1" />
            ) : (
              <EmptyCell text="Waiting for LLM..." />
            )}
          </div>
        </div>

        {/* Row 2: Brain scans */}
        <div className="grid grid-cols-2 gap-3 p-3 border-b border-border">
          <div className="flex flex-col">
            <div className="text-[8px] font-mono text-muted uppercase tracking-wider mb-1 px-1">Brain Response A</div>
            {state.scan1 ? (
              <div className="flex-1 bg-surface border border-border rounded-lg flex items-center justify-center p-2">
                <BrainVis scan={state.scan1} label="Original" size="sm" />
              </div>
            ) : (
              <EmptyCell text="Run TRIBE..." />
            )}
          </div>
          <div className="flex flex-col">
            <div className="text-[8px] font-mono text-muted uppercase tracking-wider mb-1 px-1">Brain Response B</div>
            {state.scan2 ? (
              <div className="flex-1 bg-surface border border-border rounded-lg flex items-center justify-center p-2">
                <BrainVis scan={state.scan2} label="Modified" size="sm" />
              </div>
            ) : (
              <EmptyCell text="Run TRIBE..." />
            )}
          </div>
        </div>

        {/* Row 3: Status / Output bar */}
        <div className="p-3 min-h-[80px]">
          {active <= 0 && (
            <div className="text-center text-xs text-muted font-mono py-2">Click Next → to begin the pipeline</div>
          )}
          {active === 2 && state.scan1 && (
            <div className={`text-center px-3 py-2 rounded-lg border ${state.scan1.overall_engagement < 0.6 ? 'bg-danger/5 border-danger/20' : 'bg-success/5 border-success/20'}`}>
              <p className={`text-xs font-mono font-semibold ${state.scan1.overall_engagement < 0.6 ? 'text-danger' : 'text-success'}`}>
                Engagement: {state.scan1.overall_engagement.toFixed(2)} — {state.scan1.overall_engagement < 0.6 ? 'Low. Room for improvement.' : 'Strong baseline.'}
              </p>
            </div>
          )}
          {active === 3 && state.suggestion && (
            <div className="flex gap-3 items-start overflow-x-auto">
              <div className="bg-accent/5 border border-accent/20 rounded-lg px-3 py-2 shrink-0 max-w-xs">
                <p className="text-[10px] text-accent">{state.suggestion.summary}</p>
              </div>
              {state.suggestion.changes.map((c, i) => (
                <div key={c.target} className="bg-surface border border-border rounded-lg px-3 py-2 shrink-0 max-w-[200px]">
                  <span className="text-[9px] font-mono text-text uppercase font-semibold">{i+1}. {c.target}</span>
                  <p className="text-[9px] text-secondary mt-0.5">{c.description}</p>
                </div>
              ))}
            </div>
          )}
          {active === 6 && state.scan1 && state.scan2 && (
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-mono font-extrabold bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">+{uplift.toFixed(0)}%</div>
                <div className="text-[9px] text-muted font-mono uppercase">neural engagement uplift</div>
              </div>
              <div className="flex gap-3">
                <div className="bg-bg border border-border rounded-lg px-4 py-2 text-center">
                  <div className="text-[9px] font-mono text-muted uppercase">Original</div>
                  <div className="text-lg font-mono font-bold text-danger">{state.scan1.overall_engagement.toFixed(2)}</div>
                </div>
                <div className="bg-bg border border-success/30 rounded-lg px-4 py-2 text-center ring-1 ring-success/10">
                  <div className="text-[9px] font-mono text-muted uppercase">Modified 🏆</div>
                  <div className="text-lg font-mono font-bold text-success">{state.scan2.overall_engagement.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
          {active === 7 && (
            <div className="text-center">
              <button onClick={handleRestart} className="text-xs font-mono uppercase px-4 py-2 rounded bg-accent text-bg hover:bg-accent/80 cursor-pointer">
                Start Next Iteration →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
