import type { VariantId, VariantTheme } from '../types';

export const variants: Record<VariantId, VariantTheme> = {
  a: {
    hero: {
      containerClass:
        'min-h-screen bg-electric-black flex items-center justify-center relative overflow-hidden',
      headlineClass:
        'text-7xl md:text-8xl font-sans font-black tracking-tighter text-white uppercase leading-none text-center',
      sublineClass:
        'text-lg text-electric-cyan tracking-widest uppercase mt-4 text-center animate-pulse-glow',
    },
    pulseStrip: {
      containerClass:
        'bg-electric-black py-16 px-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto',
      cardClass:
        'border border-electric-blue/30 rounded-lg p-6 bg-electric-blue/5 hover:bg-electric-blue/10 transition-colors relative overflow-hidden',
      valueClass: 'text-3xl font-sans font-black text-electric-blue',
      labelClass: 'text-sm text-gray-400 mt-1 uppercase tracking-wide',
    },
    manifesto: {
      containerClass: 'bg-electric-black py-20 px-6 max-w-3xl mx-auto',
      textClass:
        'text-xl md:text-2xl text-gray-300 font-sans font-medium leading-relaxed mb-8',
    },
    peopleGrid: {
      containerClass:
        'bg-electric-black py-16 px-6 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto',
      avatarClass:
        'w-20 h-20 rounded-full bg-gradient-to-br from-electric-blue to-electric-magenta mx-auto mb-3',
      descriptorClass:
        'text-sm text-gray-400 text-center font-sans italic',
    },
    cta: {
      containerClass:
        'bg-electric-black py-24 px-6 text-center',
      buttonClass:
        'bg-gradient-to-r from-electric-blue to-electric-magenta text-white font-sans font-bold px-8 py-3 rounded-lg uppercase tracking-wide hover:opacity-90 transition-opacity',
      inputClass:
        'bg-white/10 border border-electric-blue/40 text-white placeholder-gray-500 px-4 py-3 rounded-lg w-full max-w-sm font-sans focus:outline-none focus:border-electric-cyan',
    },
  },
  b: {
    hero: {
      containerClass:
        'min-h-screen bg-golden-cream flex items-center justify-center relative overflow-hidden',
      headlineClass:
        'text-5xl md:text-7xl font-serif font-normal text-golden-navy leading-snug text-center',
      sublineClass:
        'text-base text-golden-muted mt-6 tracking-wide text-center font-sans',
    },
    pulseStrip: {
      containerClass:
        'bg-golden-cream py-20 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto',
      cardClass:
        'border border-golden-gold/20 rounded-xl p-8 bg-white/60 backdrop-blur-sm',
      valueClass: 'text-3xl font-serif font-bold text-golden-gold',
      labelClass: 'text-sm text-golden-muted mt-2 font-sans',
    },
    manifesto: {
      containerClass: 'bg-golden-cream py-24 px-6 max-w-2xl mx-auto',
      textClass:
        'text-xl md:text-2xl text-golden-navy/80 font-serif leading-loose mb-10',
    },
    peopleGrid: {
      containerClass:
        'bg-golden-cream py-20 px-6 grid grid-cols-2 md:grid-cols-3 gap-10 max-w-5xl mx-auto',
      avatarClass:
        'w-20 h-20 rounded-full bg-gradient-to-br from-golden-gold/40 to-golden-terracotta/40 mx-auto mb-4',
      descriptorClass:
        'text-sm text-golden-muted text-center font-serif italic',
    },
    cta: {
      containerClass:
        'bg-golden-cream py-28 px-6 text-center',
      buttonClass:
        'bg-golden-navy text-golden-cream font-sans font-medium px-8 py-3 rounded-full hover:bg-golden-navy/90 transition-colors tracking-wide',
      inputClass:
        'bg-white border border-golden-gold/30 text-golden-navy placeholder-golden-muted/60 px-4 py-3 rounded-full w-full max-w-sm font-sans focus:outline-none focus:border-golden-gold',
    },
  },
};
