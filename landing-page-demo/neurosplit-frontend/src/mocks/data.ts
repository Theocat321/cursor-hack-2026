import type { BrainActivityResult, ComparisonResult } from '../types';

export const mockAnalysisA: BrainActivityResult = {
  variant_id: 'a',
  ventral_score: 0.73,
  dorsal_score: 0.61,
  prefrontal_score: 0.68,
  overall_engagement: 0.71,
  timestamp: new Date().toISOString(),
};

export const mockAnalysisB: BrainActivityResult = {
  variant_id: 'b',
  ventral_score: 0.58,
  dorsal_score: 0.72,
  prefrontal_score: 0.64,
  overall_engagement: 0.62,
  timestamp: new Date().toISOString(),
};

export const mockComparison: ComparisonResult = {
  winner: 'a',
  score_a: 0.71,
  score_b: 0.62,
  delta: 0.09,
  interpretation:
    'Variant A ("Electric London") produced 14% higher overall neural engagement, with particularly strong ventral stream activation suggesting greater visual processing intensity.',
  round: 1,
};
