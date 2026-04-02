import { useState, useCallback, useEffect } from 'react';
import { mockScanOriginal, mockScanModified, mockSuggestion } from './mocks/data';
import type { BrainScanResult, LLMSuggestion } from './types';

const BASE_PORT = 6001;
function getUrls(iteration: number) {
  const original = `http://localhost:${BASE_PORT + iteration - 1}`;
  const modified = `http://localhost:${BASE_PORT + iteration}`;
  return { original, modified };
}

const STEPS = [
  { label: 'Record & Scan', icon: '🧠' },
  { label: 'Brain Response', icon: '📊' },
  { label: 'LLM Analysis', icon: '🤖' },
  { label: 'Both Variants', icon: '👀' },
  { label: 'Compare Scans', icon: '⚡' },
  { label: 'Verdict', icon: '🏆' },
  { label: 'Next Iteration', icon: '🔄' },
];

interface State {
  activeStep: number;
  iteration: number;
  scan1: BrainScanResult | null;
  scan2: BrainScanResult | null;
  suggestion: LLMSuggestion | null;
  loading: boolean;
}

// ── Loading scanner graphic ──────────────────────────
function ScannerLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="relative w-48 h-48">
        {/* Pulsing rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border border-accent/20 animate-ring-1" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border border-accent/30 animate-ring-2" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-accent/40 animate-ring-3" />
        </div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent animate-orbit-1" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-purple animate-orbit-2" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-warning animate-orbit-3" />
        </div>

        {/* Centre brain icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl animate-pulse">🧠</div>
        </div>

        {/* Scan line */}
        <div className="absolute left-4 right-4 h-px bg-accent/60 animate-scan-line" />
      </div>

      <div className="text-center">
        <p className="text-sm font-mono text-accent font-semibold">Analysing with TRIBE v2</p>
        <p className="text-[10px] font-mono text-muted mt-1">Predicting neural activation patterns...</p>
      </div>
    </div>
  );
}

// ── Big brain visualization ──────────────────────────
function BigBrainVis({ scan, label }: { scan: BrainScanResult; label: string }) {
  const level = scan.overall_engagement;
  const hot = level > 0.6;

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-mono text-muted uppercase tracking-wider mb-2">{label}</div>
      <div className="relative w-56 h-56">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <ellipse cx="100" cy="95" rx="75" ry="80" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
          <ellipse cx="100" cy="130" rx="40" ry="25" fill={scan.ventral_score > 0.5 ? '#06b6d4' : '#1e293b'} opacity={0.2 + scan.ventral_score * 0.7} />
          <ellipse cx="80" cy="60" rx="30" ry="25" fill={scan.dorsal_score > 0.5 ? '#8b5cf6' : '#1e293b'} opacity={0.2 + scan.dorsal_score * 0.7} />
          <ellipse cx="130" cy="75" rx="25" ry="30" fill={scan.prefrontal_score > 0.5 ? '#f59e0b' : '#1e293b'} opacity={0.2 + scan.prefrontal_score * 0.7} />
          <circle cx="100" cy="90" r={20 + level * 25} fill={hot ? 'url(#hg)' : 'url(#cg)'} opacity={0.3 + level * 0.4} />
          <text x="100" y="140" textAnchor="middle" className="text-[9px] fill-secondary font-mono">Ventral</text>
          <text x="70" y="55" textAnchor="middle" className="text-[9px] fill-secondary font-mono">Dorsal</text>
          <text x="140" y="72" textAnchor="middle" className="text-[9px] fill-secondary font-mono">Prefrontal</text>
          <defs>
            <radialGradient id="hg"><stop offset="0%" stopColor="#ef4444" /><stop offset="40%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#06b6d4" stopOpacity="0" /></radialGradient>
            <radialGradient id="cg"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0" /></radialGradient>
          </defs>
        </svg>
        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-sm font-mono font-bold ${hot ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
          {level.toFixed(2)}
        </div>
      </div>

      {/* Score bars */}
      <div className="w-full max-w-xs mt-3 space-y-2">
        {[
          { label: 'Ventral stream', score: scan.ventral_score, color: '#06b6d4' },
          { label: 'Dorsal stream', score: scan.dorsal_score, color: '#8b5cf6' },
          { label: 'Prefrontal', score: scan.prefrontal_score, color: '#f59e0b' },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted w-24">{r.label}</span>
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full rounded-full animate-bar-fill" style={{ width: `${r.score * 100}%`, backgroundColor: r.color }} />
            </div>
            <span className="text-[10px] font-mono text-secondary w-8 text-right">{r.score.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Engagement assessment */}
      <div className={`mt-4 px-4 py-2 rounded-lg border ${
        scan.overall_engagement < 0.6 ? 'bg-danger/5 border-danger/20' : 'bg-success/5 border-success/20'
      }`}>
        <p className={`text-xs font-mono font-semibold text-center ${scan.overall_engagement < 0.6 ? 'text-danger' : 'text-success'}`}>
          {scan.overall_engagement < 0.6 ? 'Low engagement — room for optimisation' : 'Strong engagement — solid baseline'}
        </p>
      </div>
    </div>
  );
}

// ── Compact brain for side-by-side ───────────────────
function SmallBrainVis({ scan, label }: { scan: BrainScanResult; label: string }) {
  const level = scan.overall_engagement;
  const hot = level > 0.6;
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-mono text-muted uppercase tracking-wider mb-2">{label}</div>
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <ellipse cx="100" cy="95" rx="75" ry="80" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
          <ellipse cx="100" cy="130" rx="40" ry="25" fill={scan.ventral_score > 0.5 ? '#06b6d4' : '#1e293b'} opacity={0.2 + scan.ventral_score * 0.7} />
          <ellipse cx="80" cy="60" rx="30" ry="25" fill={scan.dorsal_score > 0.5 ? '#8b5cf6' : '#1e293b'} opacity={0.2 + scan.dorsal_score * 0.7} />
          <ellipse cx="130" cy="75" rx="25" ry="30" fill={scan.prefrontal_score > 0.5 ? '#f59e0b' : '#1e293b'} opacity={0.2 + scan.prefrontal_score * 0.7} />
          <circle cx="100" cy="90" r={20 + level * 25} fill={hot ? 'url(#hg)' : 'url(#cg)'} opacity={0.3 + level * 0.4} />
          <defs>
            <radialGradient id="hg"><stop offset="0%" stopColor="#ef4444" /><stop offset="40%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#06b6d4" stopOpacity="0" /></radialGradient>
            <radialGradient id="cg"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0" /></radialGradient>
          </defs>
        </svg>
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${hot ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
          {level.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

// ── Cascading LLM output ─────────────────────────────
function CascadingLLM({ suggestion, scan }: { suggestion: LLMSuggestion; scan: BrainScanResult }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    // summary appears first, then each change card
    const total = 1 + suggestion.changes.length;
    const timers: number[] = [];
    for (let i = 0; i < total; i++) {
      timers.push(window.setTimeout(() => setVisibleCount(i + 1), 400 * (i + 1)));
    }
    return () => timers.forEach(clearTimeout);
  }, [suggestion]);

  return (
    <div className="h-full overflow-y-auto space-y-3">
      {/* Assessment */}
      <div className={`px-3 py-2 rounded-lg border ${
        scan.overall_engagement < 0.6 ? 'bg-danger/5 border-danger/20' : 'bg-success/5 border-success/20'
      }`}>
        <p className={`text-xs font-mono font-semibold ${scan.overall_engagement < 0.6 ? 'text-danger' : 'text-success'}`}>
          Overall engagement: {scan.overall_engagement.toFixed(2)} — {scan.overall_engagement < 0.6 ? 'Optimisation needed' : 'Strong baseline'}
        </p>
      </div>

      {/* Strategy summary */}
      {visibleCount >= 1 && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 animate-fade-up">
          <div className="text-[9px] font-mono text-accent/60 uppercase tracking-wider mb-1">Strategy</div>
          <p className="text-sm text-accent font-medium leading-relaxed">{suggestion.summary}</p>
        </div>
      )}

      {/* Change cards — cascade in one by one */}
      {suggestion.changes.map((c, i) => (
        visibleCount >= i + 2 && (
          <div
            key={c.target}
            className="bg-surface border border-border rounded-lg p-4 animate-fade-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-mono font-bold flex items-center justify-center">{i + 1}</span>
              <span className="text-sm font-mono font-semibold text-text uppercase tracking-wider">{c.target}</span>
            </div>
            <p className="text-sm text-secondary leading-relaxed">{c.description}</p>
          </div>
        )
      ))}

      {/* Blinking cursor while still generating */}
      {visibleCount < 1 + suggestion.changes.length && (
        <div className="flex items-center gap-1 px-2">
          <div className="w-2 h-4 bg-accent/80 animate-pulse" />
          <span className="text-[10px] font-mono text-muted">generating...</span>
        </div>
      )}
    </div>
  );
}

// ── Site iframe ──────────────────────────────────────
function SiteFrame({ url, label, className = '' }: { url: string; label: string; className?: string }) {
  return (
    <div className={`bg-surface border border-border rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-2 py-1 bg-bg border-b border-border">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-danger/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-warning/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-success/50" />
        </div>
        <div className="flex-1 bg-border/40 rounded px-2 py-0.5 text-[8px] font-mono text-muted text-center truncate">{label}</div>
      </div>
      <div className="h-full overflow-hidden" style={{ minHeight: '150px' }}>
        <iframe
          src={url}
          title={label}
          className="border-0 pointer-events-none"
          style={{ width: '250%', height: '250%', transform: 'scale(0.4)', transformOrigin: 'top left' }}
        />
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────
export default function App() {
  const [state, setState] = useState<State>({
    activeStep: 0, iteration: 1, scan1: null, scan2: null, suggestion: null, loading: false,
  });

  const goNext = useCallback(() => {
    setState((s) => {
      const next = s.activeStep + 1;
      if (next >= STEPS.length) return s;

      // Step 0 → 1: trigger loading, then reveal scan after delay
      if (next === 1 && !s.scan1) {
        setTimeout(() => {
          setState((prev) => ({ ...prev, scan1: mockScanOriginal, loading: false }));
        }, 2500);
        return { ...s, activeStep: 0, loading: true };
      }

      // Step 3 → 4: trigger loading for second TRIBE scan
      if (next === 4 && !s.scan2) {
        setTimeout(() => {
          setState((prev) => ({ ...prev, scan2: mockScanModified, loading: false }));
        }, 2500);
        return { ...s, activeStep: 4, loading: true };
      }

      const patch: Partial<State> = {};
      if (next === 2) patch.suggestion = mockSuggestion;
      return { ...s, activeStep: next, ...patch };
    });
  }, []);

  // When loading finishes (scan1 appears), advance to step 1
  useEffect(() => {
    if (state.scan1 && state.activeStep === 0 && !state.loading) {
      setState((s) => ({ ...s, activeStep: 1 }));
    }
  }, [state.scan1, state.activeStep, state.loading]);

  const goPrev = useCallback(() => {
    setState((s) => ({ ...s, activeStep: Math.max(0, s.activeStep - 1) }));
  }, []);

  const handleRestart = useCallback(() => {
    setState((s) => ({ activeStep: 0, iteration: s.iteration + 1, scan1: null, scan2: null, suggestion: null, loading: false }));
  }, []);

  const active = state.activeStep;
  const pct = ((active + 1) / STEPS.length) * 100;
  const uplift = state.scan1 && state.scan2
    ? (((state.scan2.overall_engagement - state.scan1.overall_engagement) / state.scan1.overall_engagement) * 100) : 0;
  const urls = getUrls(state.iteration);

  const renderRight = () => {
    // Step 0: loading scanner or idle
    if (active === 0) {
      if (state.loading) return <ScannerLoading />;
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="text-5xl">🧠</div>
          <p className="text-sm font-mono text-muted">Click <span className="text-accent">Next →</span> to record & scan</p>
        </div>
      );
    }
    // Step 1: big brain response
    if (active === 1 && state.scan1) {
      return <div className="flex justify-center"><BigBrainVis scan={state.scan1} label="Original — Brain Response" /></div>;
    }
    // Step 2: LLM analysis (merged outcome + suggestion)
    if (active === 2 && state.suggestion && state.scan1) {
      return <CascadingLLM suggestion={state.suggestion} scan={state.scan1} />;
    }
    // Step 3: both variants — just label, iframes on left
    if (active === 3) {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-sm font-mono text-muted">← Both variants now visible</p>
            <p className="text-[10px] text-muted/60 mt-1">Original vs LLM-modified design</p>
          </div>
        </div>
      );
    }
    // Step 4: side-by-side brain scans (loading first)
    if (active === 4) {
      if (state.loading || !state.scan2) return <ScannerLoading />;
      return (
        <div className="flex items-center justify-center gap-8 h-full">
          <SmallBrainVis scan={state.scan1!} label="Original" />
          <div className="text-2xl text-muted">vs</div>
          <SmallBrainVis scan={state.scan2} label="Modified" />
        </div>
      );
    }
    // Step 5: verdict
    if (active === 5 && state.scan1 && state.scan2) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-6xl font-mono font-extrabold bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">+{uplift.toFixed(0)}%</div>
          <div className="text-xs text-muted font-mono uppercase tracking-wider mt-2 mb-6">neural engagement uplift</div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="bg-bg border border-border rounded-lg p-4 text-center">
              <div className="text-[9px] font-mono text-muted uppercase mb-1">Original</div>
              <div className="text-2xl font-mono font-bold text-danger">{state.scan1.overall_engagement.toFixed(2)}</div>
            </div>
            <div className="bg-bg border border-success/30 rounded-lg p-4 text-center ring-1 ring-success/10">
              <div className="text-[9px] font-mono text-muted uppercase mb-1">Modified 🏆</div>
              <div className="text-2xl font-mono font-bold text-success">{state.scan2.overall_engagement.toFixed(2)}</div>
            </div>
          </div>
        </div>
      );
    }
    // Step 6: restart
    if (active === 6) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="text-5xl">🔄</div>
          <p className="text-sm text-muted"><strong className="text-accent">Modified variant</strong> → new baseline</p>
          <button onClick={handleRestart} className="text-xs font-mono uppercase px-5 py-2.5 rounded-lg bg-accent text-bg hover:bg-accent/80 cursor-pointer transition-colors">
            Start Iteration {state.iteration + 1} →
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen bg-bg text-text font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-mono font-bold">
              <span className="text-accent">NEURO</span><span className="text-muted">SPLIT</span>
            </h1>
            <span className="text-xs font-mono text-muted bg-surface border border-border px-2.5 py-1 rounded">TRIBE v2</span>
            {state.iteration > 1 && (
              <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded">
                Iteration {state.iteration}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={goPrev} disabled={active <= 0 || state.loading}
              className="text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-lg bg-surface border border-border text-secondary hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
              ← Prev
            </button>
            <button onClick={goNext} disabled={active >= STEPS.length - 1 || state.loading}
              className="text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-lg bg-accent text-bg hover:bg-accent/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
              Next →
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-border">
          <div className="h-full bg-accent transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>

        {/* Step labels */}
        <div className="flex px-4 py-1.5">
          {STEPS.map((s, i) => (
            <div key={s.label} className={`flex-1 text-center text-[8px] font-mono uppercase tracking-wider transition-colors ${
              i === active ? 'text-accent' : i < active ? 'text-success' : 'text-muted/30'
            }`}>
              {i < active ? '✓' : s.icon} {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Two-column content */}
      <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
        {/* Left: Websites */}
        <div className="border-r border-border p-4 flex flex-col gap-3 overflow-hidden">
          <SiteFrame url={urls.original} label={`Variant A — :${BASE_PORT + state.iteration - 1}`} className="flex-1" />
          {active >= 3 ? (
            <SiteFrame url={urls.modified} label={`Variant B — :${BASE_PORT + state.iteration}`} className="flex-1" />
          ) : (
            <div className="flex-1 bg-surface border border-border rounded-lg flex items-center justify-center">
              <p className="text-xs font-mono text-muted/30">Variant B — waiting for LLM</p>
            </div>
          )}
        </div>

        {/* Right: Active step */}
        <div className="p-6 overflow-y-auto flex flex-col">
          <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-3">
            Step {active + 1} — {STEPS[active]?.label}
          </div>
          <div className="flex-1">
            {renderRight()}
          </div>
        </div>
      </div>
    </div>
  );
}
