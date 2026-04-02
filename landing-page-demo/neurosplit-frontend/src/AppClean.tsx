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
  },
  {
    name: 'Mustafa Suleyman',
    descriptor: 'From North London to reshaping Microsoft',
    role: 'CEO, Microsoft AI',
    img: '/people/mustafa-suleyman.jpg',
  },
  {
    name: 'Anne Boden',
    descriptor: 'Built a bank from a coffee shop',
    role: 'Founder, Starling Bank',
    img: '/people/anne-boden.jpg',
  },
  {
    name: 'Martha Lane Fox',
    descriptor: 'Wired the UK to the internet age',
    role: 'Founder, Lastminute.com · House of Lords',
    img: '/people/martha-lane-fox.jpg',
  },
  {
    name: 'Eileen Burbidge',
    descriptor: 'The connector who backs the bold ones',
    role: 'Partner, Passion Capital',
    img: '/people/eileen-burbidge.jpg',
  },
  {
    name: 'Azeem Azhar',
    descriptor: 'Maps the exponential age from London',
    role: 'Founder, Exponential View',
    img: '/people/azeem-azhar.png',
  },
];

export default function AppClean() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-dark text-white font-sans">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(0,163,255,0.08),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(255,60,172,0.07),transparent_28%),radial-gradient(circle_at_50%_85%,rgba(0,240,255,0.06),transparent_34%)]" />

      <section className="relative min-h-screen flex items-center px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center py-20 md:py-28">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-blue mb-6 reveal-up">
              London, 2026
            </p>
            <h1 className="font-display text-[clamp(3.4rem,8vw,7.5rem)] leading-[0.95] tracking-[-0.04em] reveal-up">
              Something is happening{' '}
              <span className="bg-gradient-to-r from-blue via-cyan to-magenta bg-clip-text text-transparent">
                in London
              </span>{' '}
              right now.
            </h1>
            <p className="mt-8 max-w-2xl text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed text-gray-300 reveal-up reveal-delay-1">
              The city is building. The energy is unmistakable. This is the
              moment you either join or watch from the sidelines.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 reveal-up reveal-delay-2">
            {people.slice(0, 4).map((person) => (
              <div
                key={person.name}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] aspect-[0.88]"
              >
                <img
                  src={person.img}
                  alt={person.name}
                  className="w-full h-full object-cover grayscale-[0.25] brightness-75 transition duration-500 group-hover:scale-105 group-hover:brightness-100 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-sm font-semibold">{person.name}</p>
                  <p className="text-[11px] mt-1 font-mono uppercase tracking-[0.14em] text-gray-400">
                    {person.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-8 md:pb-14">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="reveal-up rounded-2xl border border-white/10 bg-white/[0.04] p-6 card-lift"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-[clamp(1.8rem,3vw,2.5rem)] font-display leading-none text-white">
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
        <div className="max-w-4xl mx-auto reveal-up">
          <div className="w-16 h-px bg-gradient-to-r from-blue to-cyan mb-8" />
          <p className="font-display text-[clamp(2rem,4.6vw,4rem)] leading-[1.06] tracking-[-0.03em] text-white mb-8">
            “Go to the thing. Reply YES. Leave the house. Cross the river. Say
            yes to the weird invite.”
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-gray-400 leading-8">
            <p>
              London doesn’t wait for permission. The best things here started
              as accidents — accidental meetings, accidental companies,
              accidental movements. The city rewards people who show up.
            </p>
            <p>
              From Shoreditch warehouses to King’s Cross co-working spaces, from
              late-night hackathons to Sunday morning coffees that turn into
              companies — the pattern is the same. Proximity plus energy plus
              serendipity.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center reveal-up">
            <p className="text-xs font-mono uppercase tracking-[0.28em] text-gray-500">
              The builders
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.3rem,5vw,4.8rem)] leading-[0.96] tracking-[-0.04em]">
              People shaping the city
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {people.map((person, i) => (
              <article
                key={person.name}
                className={`group reveal-up overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] card-lift ${i % 3 === 1 ? 'md:translate-y-8' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="relative aspect-[0.9]">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover grayscale brightness-75 transition duration-500 group-hover:scale-105 group-hover:brightness-100 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/65 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <p className="text-base font-semibold text-white">{person.name}</p>
                    <p className="mt-1 text-sm italic text-blue/80">“{person.descriptor}”</p>
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

      <section className="px-6 py-24 md:py-32 text-center">
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 md:p-12 reveal-up">
          <h2 className="font-display text-[clamp(2.4rem,6vw,5.3rem)] leading-[0.95] tracking-[-0.04em] mb-4">
            Find your{' '}
            <span className="bg-gradient-to-r from-blue via-cyan to-magenta bg-clip-text text-transparent">
              Londonmaxxing
            </span>{' '}
            people
          </h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg leading-8">
            Join the movement. Get the signal, not the noise.
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-3 bg-blue/10 border border-blue/30 rounded-full px-6 py-3 text-cyan">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan shadow-[0_0_14px_rgba(0,240,255,0.8)]" />
              <span className="font-medium">You’re in. Welcome to the movement.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubmitted(true);
              }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3 rounded-[1.5rem] border border-white/10 bg-dark/70 p-3">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/[0.04] border border-white/8 text-white placeholder-gray-500 px-5 py-4 rounded-xl w-full focus:outline-none focus:border-cyan transition-colors"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue to-magenta text-white font-mono text-sm px-8 py-4 rounded-xl uppercase tracking-[0.16em] hover:-translate-y-0.5 hover:opacity-95 transition cursor-pointer"
                >
                  I’m in
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 px-6 text-center">
        <p className="text-gray-600 text-sm font-mono uppercase tracking-[0.16em]">
          Londonmaxxing — the city rewards people who show up.
        </p>
      </footer>
    </div>
  );
}
