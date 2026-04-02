import { useState } from 'react';

const stats = [
  { value: '350,000+', label: 'People reached' },
  { value: '+30%', label: 'R&D spend since 2018' },
  { value: '1 city', label: 'Endless builders' },
  { value: '∞', label: 'The movement is real' },
];

const people = [
  { descriptor: 'Between things', role: 'Ex-Google, exploring' },
  { descriptor: 'Building something unnamed', role: 'Stealth founder' },
  { descriptor: 'Accidentally excellent at something niche', role: 'AI researcher' },
  { descriptor: 'Left a good job for a weird one', role: 'Creative technologist' },
  { descriptor: 'Knows everyone somehow', role: 'Community builder' },
  { descriptor: 'Quietly reshaping an industry', role: 'Deep tech founder' },
];

export default function App() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-dark text-white font-sans">
      {/* ── Hero ──────────────────────────────── */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue/15 via-transparent to-magenta/15 animate-gradient" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl text-center">
          <p className="text-sm text-cyan tracking-[0.3em] uppercase mb-6 animate-pulse-glow">
            London, 2026
          </p>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
            Something is happening{' '}
            <span className="bg-gradient-to-r from-blue to-magenta bg-clip-text text-transparent">
              in London
            </span>{' '}
            right now.
          </h1>
          <p className="text-lg text-gray-400 mt-6 max-w-xl mx-auto leading-relaxed">
            The city is building. The energy is unmistakable. This is the moment
            you either join or watch from the sidelines.
          </p>
        </div>
      </section>

      {/* ── Pulse Stats ──────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border border-blue/20 rounded-lg p-6 bg-blue/5 hover:bg-blue/10 transition-colors"
            >
              <div className="text-3xl font-black text-blue">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Manifesto ────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto border-l-2 border-blue/30 pl-8">
          <p className="text-2xl md:text-3xl font-medium text-gray-200 leading-relaxed mb-8">
            "Go to the thing. Reply YES. Leave the house. Cross the river. Say
            yes to the weird invite. Build the thing nobody asked for. Ship it
            before it's ready."
          </p>
          <p className="text-lg text-gray-400 leading-relaxed mb-8">
            London doesn't wait for permission. The best things here started as
            accidents — accidental meetings, accidental companies, accidental
            movements. The city rewards people who show up.
          </p>
          <p className="text-lg text-gray-400 leading-relaxed">
            From Shoreditch warehouses to King's Cross co-working spaces, from
            late-night hackathons to Sunday morning coffees that turn into
            companies — the pattern is the same. Proximity plus energy plus
            serendipity. That's the London formula.
          </p>
        </div>
      </section>

      {/* ── People Grid ──────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm text-gray-500 uppercase tracking-[0.2em] mb-10 text-center">
            The people you'll meet
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {people.map((person) => (
              <div key={person.descriptor} className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue to-magenta mx-auto mb-4 opacity-80" />
                <p className="text-white font-medium text-sm">
                  "{person.descriptor}"
                </p>
                <p className="text-gray-500 text-xs mt-1">{person.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
          Find your{' '}
          <span className="bg-gradient-to-r from-blue to-magenta bg-clip-text text-transparent">
            Londonmaxxing
          </span>{' '}
          people
        </h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">
          Join the movement. Get the signal, not the noise.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-2 bg-blue/10 border border-blue/30 rounded-lg px-6 py-3">
            <span className="text-cyan font-medium">You're in. Welcome to the movement.</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubmitted(true);
            }}
            className="flex flex-col sm:flex-row gap-3 items-center justify-center"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border border-blue/30 text-white placeholder-gray-500 px-5 py-3 rounded-lg w-full max-w-sm focus:outline-none focus:border-cyan transition-colors"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue to-magenta text-white font-bold px-8 py-3 rounded-lg uppercase tracking-wide hover:opacity-90 transition-opacity cursor-pointer"
            >
              I'm in
            </button>
          </form>
        )}
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer className="border-t border-white/10 py-8 px-6 text-center">
        <p className="text-gray-600 text-sm">
          Londonmaxxing — the city rewards people who show up.
        </p>
      </footer>
    </div>
  );
}
