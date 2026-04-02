import type { VariantTheme } from '../../types';

interface PulseStripProps {
  theme: VariantTheme['pulseStrip'];
  variant: 'a' | 'b';
}

const stats = [
  { value: '350,000+', label: 'People reached' },
  { value: '+30%', label: 'R&D spend since 2018' },
  { value: '1 city', label: 'Endless builders' },
  { value: '∞', label: 'The movement is real' },
];

export default function PulseStrip({ theme, variant }: PulseStripProps) {
  return (
    <section className={theme.containerClass}>
      {stats.map((stat) => (
        <div key={stat.label} className={theme.cardClass}>
          {variant === 'a' && (
            <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/5 to-electric-magenta/5 animate-pulse-glow" />
          )}
          <div className="relative">
            <div className={theme.valueClass}>{stat.value}</div>
            <div className={theme.labelClass}>{stat.label}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
