interface BrainActivityBarProps {
  label: string;
  score: number;
  color: string;
  animate?: boolean;
}

export default function BrainActivityBar({
  label,
  score,
  color,
  animate = false,
}: BrainActivityBarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-dash-muted font-sans">{label}</span>
        <span className="text-sm font-mono text-dash-text">
          {score.toFixed(2)}
        </span>
      </div>
      <div className="w-full h-3 bg-dash-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${animate ? 'animate-bar-fill' : ''}`}
          style={{
            width: `${score * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
