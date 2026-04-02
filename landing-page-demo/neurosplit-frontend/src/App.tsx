import { useState } from 'react';

const stats = [
  { value: '350,000+', label: 'People reached' },
  { value: '+30%', label: 'R&D spend since 2018' },
  { value: '1 city', label: 'Endless builders' },
  { value: '∞', label: 'The movement is real' },
];

const people = [
  {
    name: 'Demis Hassabis',
    descriptor: 'Proved AI could master anything',
    role: 'Co-founder & CEO, Google DeepMind',
    img: '/people/demis-hassabis.jpg',
    accent: 'cyan',
  },
  {
    name: 'Mustafa Suleyman',
    descriptor: 'From North London to reshaping Microsoft',
    role: 'CEO, Microsoft AI',
    img: '/people/mustafa-suleyman.jpg',
    accent: 'magenta',
  },
  {
    name: 'Anne Boden',
    descriptor: 'Built a bank from a coffee shop',
    role: 'Founder, Starling Bank',
    img: '/people/anne-boden.jpg',
    accent: 'lime',
  },
  {
    name: 'Martha Lane Fox',
    descriptor: 'Wired the UK to the internet age',
    role: 'Founder, Lastminute.com · House of Lords',
    img: '/people/martha-lane-fox.jpg',
    accent: 'purple',
  },
  {
    name: 'Eileen Burbidge',
    descriptor: 'The connector who backs the bold ones',
    role: 'Partner, Passion Capital',
    img: '/people/eileen-burbidge.jpg',
    accent: 'amber',
  },
  {
    name: 'Azeem Azhar',
    descriptor: 'Maps the exponential age from London',
    role: 'Founder, Exponential View',
    img: '/people/azeem-azhar.png',
    accent: 'coral',
  },
];

const accentClasses: Record<string, string> = {
  cyan: 'from-cyan to-blue border-cyan/30',
  magenta: 'from-magenta to-purple border-magenta/30',
  lime: 'from-lime to-cyan border-lime/30',
  purple: 'from-purple to-magenta border-purple/30',
  amber: 'from-amber to-coral border-amber/30',
  coral: 'from-coral to-magenta border-coral/30',
};

export default function App() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-dark text-white font-sans">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.08),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,60,172,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(132,92,255,0.08),transparent_35%)]" />
      <div className="scanlines" />

      <section className="relative overflow-hidden px-6 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full py-20 md:py-28">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-gray-300 reveal-up">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan shadow-[0_0_16px_rgba(0,240,255,0.8)]" />
            London, 2026
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-end">
            <div>
              <h1 className="max-w-4xl font-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.94] tracking-[-0.04em] reveal-up">
                Something is happening{' '}
                <span className="bg-gradient-to-r from-cyan via-blue to-magenta bg-clip-text text-transparent glow-text">
                  in London
                </span>{' '}
                right now.
              </h1>
              <p className="mt-8 max-w-2xl text-[clamp(1.05rem,2.2vw,1.4rem)] leading-relaxed text-gray-300 reveal-up reveal-delay-1">
                The city is building. The energy is unmistakable. This is the
                moment you either join or watch from the sidelines.
              </p>
              <div className="mt-10 flex flex-wrap gap-3 reveal-up reveal-delay-2">
                <span className="rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-sm font-mono uppercase tracking-[0.18em] text-cyan">
                  builders
                </span>
                <span className="rounded-full border border-magenta/20 bg-magenta/10 px-4 py-2 text-sm font-mono uppercase tracking-[0.18em] text-magenta">
                  operators
                </span>
                <span className="rounded-full border border-lime/20 bg-lime/10 px-4 py-2 text-sm font-mono uppercase tracking-[0.18em] text-lime">
                  weirdos with conviction
                </span>
              </div>
            </div>

            <div className="reveal-up reveal-delay-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5 backdrop-blur-md shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                <div className="grid grid-cols-2 gap-3">
                  {people.slice(0, 4).map((person) => (
                    <div
                      key={person.name}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 aspect-[0.9]"
                    >
                      <img
                        src={person.img}
                        alt={person.name}
                        className="h-full w-full object-cover grayscale-[0.2] brightness-75 transition duration-500 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-100"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${accentClasses[person.accent].split(' border-')[0]} opacity-20`} />
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-dark via-dark/70 to-transparent">
                        <p className="text-sm font-semibold text-white">{person.name}</p>
                        <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.14em] text-gray-400">
                          {person.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-dark/60 px-4 py-3">
                  <p className="text-sm text-gray-300">The city rewards people who show up.</p>
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-cyan">live signal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-8 md:pb-14">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="reveal-up rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur-sm card-lift"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="text-[clamp(1.8rem,3vw,2.6rem)] font-display leading-none text-white">
                {stat.value}
              </div>
              <div className="mt-3 text-xs font-mono uppercase tracking-[0.18em] text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-10 md:gap-16 items-start">
          <div className="reveal-up">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-cyan mb-5">
              manifesto
            </p>
            <p className="max-w-xl font-display text-[clamp(2rem,4.5vw,4rem)] leading-[1.06] tracking-[-0.03em] text-white">
              “Go to the thing. Reply YES. Leave the house. Cross the river.”
            </p>
          </div>
          <div className="space-y-6 reveal-up reveal-delay-1">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
              <p className="text-lg leading-8 text-gray-300">
                Say yes to the weird invite. Build the thing nobody asked for.
                Ship it before it’s ready.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-mono uppercase tracking-[0.18em] text-magenta mb-3">
                  proximity
                </p>
                <p className="text-gray-400 leading-7">
                  London doesn’t wait for permission. The best things here start
                  as accidental meetings, accidental companies, accidental
                  movements.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm font-mono uppercase tracking-[0.18em] text-lime mb-3">
                  serendipity
                </p>
                <p className="text-gray-400 leading-7">
                  From Shoreditch warehouses to King’s Cross coffees, the
                  pattern is the same: energy plus density plus follow-through.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14 reveal-up">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.28em] text-gray-500">
                discovery wall
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.8rem)] leading-[0.98] tracking-[-0.04em]">
                The people you’ll meet
              </h2>
            </div>
            <p className="max-w-md text-gray-400 leading-7">
              Founders, operators, researchers, and connectors shaping the city
              from the inside.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {people.map((person, i) => (
              <article
                key={person.name}
                className={`group reveal-up rounded-3xl border bg-white/[0.04] overflow-hidden card-lift ${accentClasses[person.accent].includes('border-') ? accentClasses[person.accent].split(' ').find((c) => c.startsWith('border-')) : 'border-white/10'} ${i % 3 === 1 ? 'md:translate-y-8' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative aspect-[0.9] overflow-hidden">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="h-full w-full object-cover grayscale brightness-75 transition duration-500 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-100"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${accentClasses[person.accent].split(' border-')[0]} opacity-20 transition duration-300 group-hover:opacity-35`} />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-dark via-dark/75 to-transparent">
                    <p className="text-base font-semibold text-white">{person.name}</p>
                    <p className="mt-1 text-sm italic text-gray-200">“{person.descriptor}”</p>
                    <p className="mt-2 text-[11px] font-mono uppercase tracking-[0.14em] text-gray-400">
                      {person.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 md:p-12 text-center backdrop-blur-md reveal-up">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-gray-500">
            join the movement
          </p>
          <h2 className="mt-5 font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.04em]">
            Find your{' '}
            <span className="bg-gradient-to-r from-cyan via-blue to-magenta bg-clip-text text-transparent">
              Londonmaxxing
            </span>{' '}
            people
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-lg leading-8 text-gray-400">
            Join the movement. Get the signal, not the noise.
          </p>

          {submitted ? (
            <div className="mt-10 inline-flex items-center gap-3 rounded-full border border-cyan/30 bg-cyan/10 px-6 py-3 text-cyan">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan shadow-[0_0_14px_rgba(0,240,255,0.8)]" />
              <span className="font-medium">You’re in. Welcome to the movement.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubmitted(true);
              }}
              className="mt-10 max-w-2xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3 rounded-[1.5rem] border border-white/10 bg-dark/70 p-3">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-xl border border-white/8 bg-white/[0.04] px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/40 transition-colors"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-cyan via-blue to-magenta px-7 py-4 font-mono text-sm uppercase tracking-[0.16em] text-white shadow-[0_8px_30px_rgba(0,163,255,0.25)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 cursor-pointer"
                >
                  I’m in
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <footer className="px-6 py-10 border-t border-white/8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-gray-500">
            Londonmaxxing
          </p>
          <p className="text-sm text-gray-600">
            The city rewards people who show up.
          </p>
        </div>
      </footer>
    </div>
  );
}
