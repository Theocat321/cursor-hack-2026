import type { BrainActivityResult, ComparisonResult, DashboardState } from '../types';
import { mockAnalysisA, mockAnalysisB, mockComparison } from '../mocks/data';

const USE_MOCKS = true;
const API_BASE = '/api';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Add slight randomness to mock scores so repeat runs feel different
function jitter(base: number, range = 0.06): number {
  return Math.max(0, Math.min(1, base + (Math.random() - 0.5) * range));
}

async function captureScreenshot(variantId: 'a' | 'b') {
  if (USE_MOCKS) {
    await delay(800);
    return { screenshot_path: `/screenshots/${variantId}.png`, variant_id: variantId, timestamp: new Date().toISOString() };
  }
  const res = await fetch(`${API_BASE}/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variant_id: variantId }),
  });
  return res.json();
}

async function analyseScreenshot(screenshotPath: string): Promise<BrainActivityResult> {
  if (USE_MOCKS) {
    await delay(1200);
    const base = screenshotPath.includes('/a') ? mockAnalysisA : mockAnalysisB;
    return {
      ...base,
      ventral_score: jitter(base.ventral_score),
      dorsal_score: jitter(base.dorsal_score),
      prefrontal_score: jitter(base.prefrontal_score),
      overall_engagement: jitter(base.overall_engagement),
      timestamp: new Date().toISOString(),
    };
  }
  const res = await fetch(`${API_BASE}/analyse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ screenshot_path: screenshotPath }),
  });
  return res.json();
}

async function compareResults(
  resultA: BrainActivityResult,
  resultB: BrainActivityResult
): Promise<ComparisonResult> {
  if (USE_MOCKS) {
    await delay(600);
    const winner = resultA.overall_engagement >= resultB.overall_engagement ? 'a' : 'b';
    const delta = Math.abs(resultA.overall_engagement - resultB.overall_engagement);
    return {
      ...mockComparison,
      winner: winner as 'a' | 'b',
      score_a: resultA.overall_engagement,
      score_b: resultB.overall_engagement,
      delta,
      interpretation:
        winner === 'a'
          ? `Variant A ("Electric London") produced ${(delta * 100).toFixed(0)}% higher overall neural engagement, with particularly strong ventral stream activation suggesting greater visual processing intensity.`
          : `Variant B ("Golden London") produced ${(delta * 100).toFixed(0)}% higher overall neural engagement, with elevated dorsal stream response indicating stronger spatial processing and sustained attention.`,
    };
  }
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result_a: resultA, result_b: resultB }),
  });
  return res.json();
}

export async function runPipeline(
  onStatus: (status: DashboardState['status']) => void
) {
  // Step 1: Capture
  onStatus('capturing');
  const [capA, capB] = await Promise.all([
    captureScreenshot('a'),
    captureScreenshot('b'),
  ]);

  // Step 2: Analyse
  onStatus('analysing');
  const [resultA, resultB] = await Promise.all([
    analyseScreenshot(capA.screenshot_path),
    analyseScreenshot(capB.screenshot_path),
  ]);

  // Step 3: Compare
  onStatus('comparing');
  const comparison = await compareResults(resultA, resultB);

  return { resultA, resultB, comparison };
}
