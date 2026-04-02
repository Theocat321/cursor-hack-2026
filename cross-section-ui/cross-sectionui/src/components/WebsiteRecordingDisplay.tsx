interface WebsiteRecordingDisplayProps {
  label: string;
  variant: 'original' | 'modified';
}

export default function WebsiteRecordingDisplay({ label, variant }: WebsiteRecordingDisplayProps) {
  const isOriginal = variant === 'original';

  return (
    <div className="bg-surface border border-border rounded-[10px] overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-bg border-b border-border">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-danger/50" />
          <div className="w-2 h-2 rounded-full bg-warning/50" />
          <div className="w-2 h-2 rounded-full bg-success/50" />
        </div>
        <div className="flex-1 bg-border/40 rounded px-2 py-0.5 text-[9px] font-mono text-muted text-center">
          {label}
        </div>
      </div>

      {/* Mini site preview */}
      <div className={`p-4 ${isOriginal ? 'bg-[#FFFBF0]' : 'bg-[#0A0A0A]'} h-[180px]`}>
        <div className="max-w-xs mx-auto space-y-3">
          <h3 className={`text-sm font-bold leading-tight ${isOriginal ? 'font-serif text-[#0C1B33]' : 'font-sans text-white uppercase tracking-tighter'}`}>
            Something is happening{' '}
            {isOriginal ? (
              <span className="text-[#C5960C] italic">in London</span>
            ) : (
              <span className="bg-gradient-to-r from-[#00A3FF] to-[#FF3CAC] bg-clip-text text-transparent">in London</span>
            )}{' '}
            right now.
          </h3>
          <div className="grid grid-cols-3 gap-1">
            {['350K+', '+30%', '∞'].map((v) => (
              <div key={v} className={`text-center py-1 rounded text-[10px] font-bold ${
                isOriginal
                  ? 'border border-[#C5960C]/20 text-[#C5960C]'
                  : 'border border-[#00A3FF]/30 bg-[#00A3FF]/5 text-[#00A3FF]'
              }`}>
                {v}
              </div>
            ))}
          </div>
          <p className={`text-[9px] leading-relaxed ${isOriginal ? 'text-[#7A6E5A] italic' : 'text-gray-400'}`}>
            "Go to the thing. Reply YES. Leave the house. Cross the river."
          </p>
          <button className={`w-full py-1.5 rounded text-[9px] font-bold ${
            isOriginal
              ? 'bg-[#0C1B33] text-[#FFFBF0] rounded-full'
              : 'bg-gradient-to-r from-[#00A3FF] to-[#FF3CAC] text-white uppercase tracking-wide'
          }`}>
            Join the movement
          </button>
        </div>
      </div>
    </div>
  );
}
