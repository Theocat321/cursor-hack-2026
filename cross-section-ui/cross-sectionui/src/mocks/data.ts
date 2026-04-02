import type { BrainScanResult, LLMSuggestion } from '../types';

export const mockScanOriginal: BrainScanResult = {
  variantId: 'original',
  brainImage: {
    url: '/brain-original.png',
    label: 'Original',
    activationLevel: 0.42,
  },
  ventral_score: 0.42,
  dorsal_score: 0.51,
  prefrontal_score: 0.38,
  overall_engagement: 0.44,
};

export const mockScanModified: BrainScanResult = {
  variantId: 'modified',
  brainImage: {
    url: '/brain-modified.png',
    label: 'Modified',
    activationLevel: 0.78,
  },
  ventral_score: 0.73,
  dorsal_score: 0.61,
  prefrontal_score: 0.68,
  overall_engagement: 0.71,
};

export const mockSuggestion: LLMSuggestion = {
  summary: 'Increase luminance contrast and spatial frequency. Shift from passive editorial to high-energy visual processing to drive ventral stream activation.',
  changes: [
    { target: 'Hero section', description: 'Black background, bold sans-serif, neon gradient text — increases edge detection in V1/V2' },
    { target: 'Stats strip', description: 'Neon cyan numbers with glow borders, pulse animation — recruits dorsal attention network' },
    { target: 'CTA section', description: 'Gradient button (cyan→magenta), glow effect — sustains prefrontal engagement' },
  ],
};
