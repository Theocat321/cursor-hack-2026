import type { LLMSuggestion } from '../types';
import WebsiteRecordingDisplay from '../components/WebsiteRecordingDisplay';

interface SuggestVariantStepProps {
  suggestion: LLMSuggestion | null;
}

export default function SuggestVariantStep({ suggestion }: SuggestVariantStepProps) {
  if (!suggestion) return <div className="text-center text-muted text-sm py-12">Waiting for LLM...</div>;

  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-1">LLM Suggests a Variant</h3>
      <p className="text-[11px] text-muted mb-3">Based on the brain scan, the LLM proposes targeted changes.</p>

      {/* Strategy */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg px-3 py-2 mb-3">
        <p className="text-[11px] text-accent font-medium">{suggestion.summary}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Changes list */}
        <div className="space-y-2">
          {suggestion.changes.map((c, i) => (
            <div key={c.target} className="bg-surface border border-border rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-4 h-4 rounded-full bg-accent/20 text-accent text-[9px] font-mono font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-[10px] font-mono font-semibold text-text uppercase tracking-wider">{c.target}</span>
              </div>
              <p className="text-[10px] text-secondary leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>

        {/* Preview of new variant */}
        <WebsiteRecordingDisplay label="Proposed: Electric London" variant="modified" />
      </div>
    </div>
  );
}
