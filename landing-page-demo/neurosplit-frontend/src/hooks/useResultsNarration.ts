import { useEffect } from 'react';
import { speakText } from '../api/elevenlabs';

export interface NarrationResult {
  winner: 'a' | 'b';
  score_a: number;
  score_b: number;
  interpretation: string;
}

function buildScript(result: NarrationResult): string {
  const winnerName = result.winner === 'a' ? 'Variant A, Electric London' : 'Variant B, Golden London';
  const scoreA = Math.round(result.score_a * 100);
  const scoreB = Math.round(result.score_b * 100);

  return (
    `Results are in. ` +
    `Variant A scored ${scoreA} out of 100. ` +
    `Variant B scored ${scoreB} out of 100. ` +
    `The winner is ${winnerName}. ` +
    result.interpretation
  );
}

export function useResultsNarration(result: NarrationResult | null) {
  useEffect(() => {
    if (!result) return;
    speakText(buildScript(result)).catch(console.error);
  }, [result]);
}
