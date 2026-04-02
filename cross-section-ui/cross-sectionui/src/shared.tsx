import { useState, useCallback } from 'react';
import { mockScanOriginal, mockScanModified, mockSuggestion } from './mocks/data';
import type { BrainScanResult, LLMSuggestion } from './types';

export const ORIGINAL_URL = 'http://localhost:5173';

export const STEPS = [
  { label: 'Record Website', icon: '📹' },
  { label: 'Pass to TRIBE', icon: '🧠' },
  { label: 'Record Outcome', icon: '📊' },
  { label: 'LLM Suggests Variant', icon: '🤖' },
  { label: 'Show Both Variants', icon: '👀' },
  { label: 'Both to TRIBE', icon: '⚡' },
  { label: 'Compare Output', icon: '🏆' },
  { label: 'Take Winner', icon: '🔄' },
];

export interface State {
  activeStep: number;
  iteration: number;
  running: boolean;
  scan1: BrainScanResult | null;
  scan2: BrainScanResult | null;
  suggestion: LLMSuggestion | null;
}

export function usePipeline() {
  const [state, setState] = useState<State>({
    activeStep: 0, iteration: 1, running: false, scan1: null, scan2: null, suggestion: null,
  });

  const goNext = useCallback(() => {
    setState((s) => {
      const next = s.activeStep + 1;
      if (next >= STEPS.length) return s;
      const patch: Partial<State> = {};
      if (next === 1) patch.scan1 = mockScanOriginal;
      if (next === 3) patch.suggestion = mockSuggestion;
      if (next === 5) patch.scan2 = mockScanModified;
      return { ...s, activeStep: next, ...patch };
    });
  }, []);

  const goPrev = useCallback(() => {
    setState((s) => ({ ...s, activeStep: Math.max(0, s.activeStep - 1) }));
  }, []);

  const handleRestart = useCallback(() => {
    setState((s) => ({ activeStep: 0, iteration: s.iteration + 1, running: false, scan1: null, scan2: null, suggestion: null }));
  }, []);

  const pct = ((state.activeStep + 1) / STEPS.length) * 100;
  const uplift = state.scan1 && state.scan2
    ? (((state.scan2.overall_engagement - state.scan1.overall_engagement) / state.scan1.overall_engagement) * 100)
    : 0;

  return { state, goNext, goPrev, handleRestart, pct, uplift };
}

export function BrainVis({ scan, label, size = 'md' }: { scan: BrainScanResult; label: string; size?: 'sm' | 'md' }) {
  const level = scan.overall_engagement;
  const hot = level > 0.6;
  const dim = size === 'sm' ? 'w-20 h-20' : 'w-32 h-32';

  return (
    <div className="flex flex-col items-center">
      <div className="text-[9px] font-mono text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`relative ${dim}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <ellipse cx="100" cy="95" rx="75" ry="80" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
          <ellipse cx="100" cy="130" rx="40" ry="25" fill={scan.ventral_score > 0.5 ? '#06b6d4' : '#1e293b'} opacity={0.2 + scan.ventral_score * 0.7} />
          <ellipse cx="80" cy="60" rx="30" ry="25" fill={scan.dorsal_score > 0.5 ? '#8b5cf6' : '#1e293b'} opacity={0.2 + scan.dorsal_score * 0.7} />
          <ellipse cx="130" cy="75" rx="25" ry="30" fill={scan.prefrontal_score > 0.5 ? '#f59e0b' : '#1e293b'} opacity={0.2 + scan.prefrontal_score * 0.7} />
          <circle cx="100" cy="90" r={20 + level * 25} fill={hot ? 'url(#hg)' : 'url(#cg)'} opacity={0.3 + level * 0.4} />
          <text x="100" y="135" textAnchor="middle" className="text-[8px] fill-secondary font-mono">V</text>
          <text x="75" y="60" textAnchor="middle" className="text-[8px] fill-secondary font-mono">D</text>
          <text x="135" y="78" textAnchor="middle" className="text-[8px] fill-secondary font-mono">PF</text>
          <defs>
            <radialGradient id="hg"><stop offset="0%" stopColor="#ef4444" /><stop offset="40%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#06b6d4" stopOpacity="0" /></radialGradient>
            <radialGradient id="cg"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0" /></radialGradient>
          </defs>
        </svg>
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${hot ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
          {level.toFixed(2)}
        </div>
      </div>
      <div className="w-full mt-1 space-y-1">
        {[
          { l: 'V', s: scan.ventral_score, c: '#06b6d4' },
          { l: 'D', s: scan.dorsal_score, c: '#8b5cf6' },
          { l: 'PF', s: scan.prefrontal_score, c: '#f59e0b' },
        ].map((r) => (
          <div key={r.l} className="flex items-center gap-1">
            <span className="text-[8px] font-mono text-muted w-4">{r.l}</span>
            <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full rounded-full animate-bar-fill" style={{ width: `${r.s * 100}%`, backgroundColor: r.c }} />
            </div>
            <span className="text-[8px] font-mono text-secondary w-5 text-right">{r.s.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SiteFrame({ url, label, className = '' }: { url: string; label: string; className?: string }) {
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

export function NavButtons({ goNext, goPrev, active }: { goNext: () => void; goPrev: () => void; active: number }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={goPrev} disabled={active <= 0}
        className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded bg-surface border border-border text-secondary hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
        ← Prev
      </button>
      <button onClick={goNext} disabled={active >= STEPS.length - 1}
        className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded bg-accent text-bg hover:bg-accent/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
        Next →
      </button>
    </div>
  );
}

export function ProgressBar({ pct, active }: { pct: number; active: number }) {
  return (
    <>
      <div className="h-1 bg-border">
        <div className="h-full bg-accent transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex px-2 py-1">
        {STEPS.map((s, i) => (
          <div key={s.label} className={`flex-1 text-center text-[7px] font-mono uppercase tracking-wider ${
            i === active ? 'text-accent' : i < active ? 'text-success' : 'text-muted/40'
          }`}>
            {i < active ? '✓' : s.icon} {s.label}
          </div>
        ))}
      </div>
    </>
  );
}
