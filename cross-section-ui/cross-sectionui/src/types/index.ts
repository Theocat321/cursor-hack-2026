export interface BrainImage {
  url: string;          // path to the brain activation image
  label: string;        // e.g. "Original" or "Variant A"
  activationLevel: number; // 0–1 overall intensity
}

export interface BrainScanResult {
  variantId: string;
  brainImage: BrainImage;
  ventral_score: number;
  dorsal_score: number;
  prefrontal_score: number;
  overall_engagement: number;
}

export interface WebsiteRecording {
  id: string;
  label: string;
  variant: 'original' | 'modified';
  screenshotUrl: string | null;
}

export interface LLMSuggestion {
  summary: string;
  changes: { target: string; description: string }[];
}

export interface PipelineState {
  currentStep: number;
  iteration: number;
  status: 'idle' | 'running' | 'done';
  websites: WebsiteRecording[];        // 1 or 2
  scans: BrainScanResult[];            // 1 or 2
  suggestion: LLMSuggestion | null;
  winner: string | null;               // variantId of winner
}

export const STEPS = [
  { id: 'record', label: 'Record Website', icon: '📹' },
  { id: 'tribe', label: 'Pass to TRIBE', icon: '🧠' },
  { id: 'outcome', label: 'Record Outcome', icon: '📊' },
  { id: 'suggest', label: 'LLM Suggests Variant', icon: '🤖' },
  { id: 'compare-tribe', label: 'Both to TRIBE', icon: '⚡' },
  { id: 'compare', label: 'Compare Output', icon: '🏆' },
  { id: 'loop', label: 'Take Winner', icon: '🔄' },
];
