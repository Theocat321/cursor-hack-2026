interface LoopStepProps {
  winnerLabel: string;
  iteration: number;
  onRestart: () => void;
}

export default function LoopStep({ winnerLabel, iteration, onRestart }: LoopStepProps) {
  return (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">🔄</div>
      <h3 className="text-sm font-semibold text-text mb-2">Take the Winner</h3>
      <p className="text-[11px] text-muted mb-4">
        <strong className="text-accent">{winnerLabel}</strong> becomes the new baseline.
        <br />
        Ready for iteration {iteration + 1}.
      </p>
      <button
        onClick={onRestart}
        className="text-[10px] font-mono uppercase tracking-wider px-4 py-2 rounded bg-accent text-bg hover:bg-accent/80 transition-colors cursor-pointer"
      >
        Start Next Iteration →
      </button>
    </div>
  );
}
