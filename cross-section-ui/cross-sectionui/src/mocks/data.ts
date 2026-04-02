import type { BrainScanResult, LLMSuggestion } from '../types';

// ── Variant A scan (low engagement — the ugly original) ──
export const scanVariantA: BrainScanResult = {
  variantId: 'a',
  brainImage: { url: '', label: 'Variant A', activationLevel: 0.42 },
  ventral_score: 0.42,
  dorsal_score: 0.51,
  prefrontal_score: 0.38,
  overall_engagement: 0.44,
};

// ── Variant B scan (moderate — improved but not maxed) ──
export const scanVariantB: BrainScanResult = {
  variantId: 'b',
  brainImage: { url: '', label: 'Variant B', activationLevel: 0.68 },
  ventral_score: 0.65,
  dorsal_score: 0.59,
  prefrontal_score: 0.62,
  overall_engagement: 0.71,
};

// ── Variant C scan (highest — most lit up brain) ──
export const scanVariantC: BrainScanResult = {
  variantId: 'c',
  brainImage: { url: '', label: 'Variant C', activationLevel: 0.91 },
  ventral_score: 0.88,
  dorsal_score: 0.79,
  prefrontal_score: 0.85,
  overall_engagement: 0.87,
};

// ── Iteration 1: A → B suggestions (realistic diffs) ──
export const suggestionAtoB: LLMSuggestion = {
  summary: 'The warm editorial design produces low visual cortex activation. Shift to high-contrast dark theme with saturated accents to increase ventral stream response.',
  changes: [
    {
      target: 'Background & colour scheme',
      description: 'Replace cream (#FFFBF0) with near-black (#0A0A0A). Swap muted gold/navy palette for electric blue (#00A3FF) and magenta (#FF3CAC) neon accents. High luminance contrast drives stronger V1/V2 edge detection.',
    },
    {
      target: 'Typography & layout density',
      description: 'Replace light-weight serif (Playfair Display) with heavy compressed sans-serif (Inter Black, uppercase). Reduce whitespace by 40% and tighten letter-spacing. Dense visual information increases spatial frequency processing.',
    },
    {
      target: 'Interactive elements & motion',
      description: 'Add pulse animation to stat cards, gradient glow on CTA button, and subtle background gradient shift. Motion cues recruit dorsal attention network and sustain prefrontal engagement.',
    },
  ],
};

// ── Iteration 2: B → C suggestions (realistic diffs) ──
export const suggestionBtoC: LLMSuggestion = {
  summary: 'Variant B improved ventral activation but prefrontal engagement plateaued. Add structured visual hierarchy and micro-interactions to deepen cognitive processing.',
  changes: [
    {
      target: 'Hero visual anchoring',
      description: 'Add a large animated gradient orb behind the headline text to create a focal point. Radial luminance gradients activate centre-surround receptive fields in V1, increasing sustained fixation time.',
    },
    {
      target: 'Social proof section',
      description: 'Replace abstract avatar placeholders with real headshots in a masonry grid with hover-reveal bios. Face processing in the fusiform face area (FFA) is the strongest ventral stream activator available.',
    },
    {
      target: 'Progressive disclosure on CTA',
      description: 'Split the single CTA into a two-step animated sequence: first a value proposition reveal, then the input field slides in. Temporal anticipation patterns increase prefrontal prediction-error signals.',
    },
  ],
};
