import type { VariantTheme } from '../../types';

interface HeroProps {
  theme: VariantTheme['hero'];
  variant: 'a' | 'b';
}

export default function Hero({ theme, variant }: HeroProps) {
  return (
    <section className={theme.containerClass}>
      {/* Background decoration */}
      {variant === 'a' ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 via-transparent to-electric-magenta/20 animate-gradient-shift" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-magenta/10 rounded-full blur-3xl" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-golden-gold/5 to-golden-terracotta/5" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-golden-gold/8 rounded-full blur-3xl" />
        </>
      )}

      <div className="relative z-10 px-6 max-w-4xl">
        <h1 className={theme.headlineClass}>
          Something is happening{' '}
          {variant === 'a' ? (
            <span className="bg-gradient-to-r from-electric-blue to-electric-magenta bg-clip-text text-transparent">
              in London
            </span>
          ) : (
            <span className="text-golden-gold italic">in London</span>
          )}{' '}
          right now.
        </h1>
        <p className={theme.sublineClass}>
          The city is building. The energy is unmistakable. This is the moment.
        </p>
      </div>
    </section>
  );
}
