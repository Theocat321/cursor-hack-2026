import { useState } from 'react';
import type { VariantTheme } from '../../types';

interface CTAProps {
  theme: VariantTheme['cta'];
  variant: 'a' | 'b';
}

export default function CTA({ theme, variant }: CTAProps) {
  const [email, setEmail] = useState('');

  return (
    <section className={theme.containerClass}>
      <h2
        className={
          variant === 'a'
            ? 'text-4xl font-sans font-black text-white uppercase tracking-tight mb-4'
            : 'text-4xl font-serif text-golden-navy mb-4'
        }
      >
        Find your Londonmaxxing people
      </h2>
      <p
        className={
          variant === 'a'
            ? 'text-gray-400 mb-8 font-sans'
            : 'text-golden-muted mb-10 font-sans'
        }
      >
        Join the movement. Get the signal, not the noise.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={theme.inputClass}
        />
        <button className={theme.buttonClass}>I'm in</button>
      </div>
    </section>
  );
}
