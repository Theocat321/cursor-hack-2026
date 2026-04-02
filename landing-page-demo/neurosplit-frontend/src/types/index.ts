export type VariantId = 'a' | 'b';

export interface VariantTheme {
  hero: {
    containerClass: string;
    headlineClass: string;
    sublineClass: string;
  };
  pulseStrip: {
    containerClass: string;
    cardClass: string;
    valueClass: string;
    labelClass: string;
  };
  manifesto: {
    containerClass: string;
    textClass: string;
  };
  peopleGrid: {
    containerClass: string;
    avatarClass: string;
    descriptorClass: string;
  };
  cta: {
    containerClass: string;
    buttonClass: string;
    inputClass: string;
  };
}

export interface BrainActivityResult {
  variant_id: string;
  ventral_score: number;
  dorsal_score: number;
  prefrontal_score: number;
  overall_engagement: number;
  timestamp: string;
}

export interface ComparisonResult {
  winner: 'a' | 'b';
  score_a: number;
  score_b: number;
  delta: number;
  interpretation: string;
  round: number;
}

export interface DashboardState {
  isRunning: boolean;
  status: 'idle' | 'capturing' | 'analysing' | 'comparing' | 'done' | 'error';
  screenshots: {
    a: string | null;
    b: string | null;
  };
  results: {
    a: BrainActivityResult | null;
    b: BrainActivityResult | null;
  };
  comparison: ComparisonResult | null;
  history: ComparisonResult[];
  error: string | null;
}
