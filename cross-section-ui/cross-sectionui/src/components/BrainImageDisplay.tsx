import type { BrainScanResult } from '../types';

interface BrainImageDisplayProps {
  scan: BrainScanResult;
  compact?: boolean;
}

// Renders a stylized brain activation heatmap using CSS
// In production, this would display the actual TRIBE output image
export default function BrainImageDisplay({ scan, compact = false }: BrainImageDisplayProps) {
  const level = scan.brainImage.activationLevel;
  const hot = level > 0.6;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[10px] font-mono text-muted uppercase tracking-wider">
        {scan.brainImage.label}
      </div>

      {/* Brain visualization — SVG cross-section with activation overlay */}
      <div className={`relative ${compact ? 'w-36 h-36' : 'w-48 h-48'}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Brain outline */}
          <ellipse cx="100" cy="95" rx="75" ry="80" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

          {/* Ventral region (bottom) */}
          <ellipse cx="100" cy="130" rx="40" ry="25"
            fill={scan.ventral_score > 0.5 ? '#06b6d4' : '#1e293b'}
            opacity={0.2 + scan.ventral_score * 0.7}
          />

          {/* Dorsal region (top-back) */}
          <ellipse cx="80" cy="60" rx="30" ry="25"
            fill={scan.dorsal_score > 0.5 ? '#8b5cf6' : '#1e293b'}
            opacity={0.2 + scan.dorsal_score * 0.7}
          />

          {/* Prefrontal region (front) */}
          <ellipse cx="130" cy="75" rx="25" ry="30"
            fill={scan.prefrontal_score > 0.5 ? '#f59e0b' : '#1e293b'}
            opacity={0.2 + scan.prefrontal_score * 0.7}
          />

          {/* Central activation glow */}
          <circle cx="100" cy="90" r={20 + level * 25}
            fill={hot ? 'url(#hotGlow)' : 'url(#coldGlow)'}
            opacity={0.3 + level * 0.4}
          />

          {/* Labels */}
          <text x="100" y="135" textAnchor="middle" className="text-[8px] fill-secondary font-mono">V</text>
          <text x="75" y="60" textAnchor="middle" className="text-[8px] fill-secondary font-mono">D</text>
          <text x="135" y="78" textAnchor="middle" className="text-[8px] fill-secondary font-mono">PF</text>

          <defs>
            <radialGradient id="hotGlow">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="coldGlow">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Overall score badge */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
          hot ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
        }`}>
          {scan.overall_engagement.toFixed(2)}
        </div>
      </div>

      {/* Score breakdown */}
      {!compact && (
        <div className="w-full space-y-1.5 mt-1">
          {[
            { label: 'Ventral', score: scan.ventral_score, color: '#06b6d4' },
            { label: 'Dorsal', score: scan.dorsal_score, color: '#8b5cf6' },
            { label: 'Prefrontal', score: scan.prefrontal_score, color: '#f59e0b' },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted w-14 uppercase">{r.label}</span>
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full animate-bar-fill" style={{ width: `${r.score * 100}%`, backgroundColor: r.color }} />
              </div>
              <span className="text-[9px] font-mono text-secondary w-7 text-right">{r.score.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
