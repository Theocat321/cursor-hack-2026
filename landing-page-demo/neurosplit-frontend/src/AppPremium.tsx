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

export default function AppPremium() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans antialiased">
      <div className="grain-overlay" />
      <div className="premium-orbs" />

      <section className="relative min-h-screen px-6 overflow-hidden flex items-center">
        <div className="max-w-6xl mx-auto w-full py-20 md:py-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <p className="font-mono text-xs tracking-[0.4em] uppercase text-text-tertiary hero-animate">
                London, 2026
              </p>
              <h1 className="font-display text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[0.92] tracking-[-0.05em] mt-6 hero-animate hero-animate-delay-1">
                Something is happening{' '}
                <span className="text-gradient-premium">in London</span> right now.
              </h1>
              <p className="text-text-secondary text-[clamp(1.05rem,2vw,1.3rem)] max-w-xl mt-8 leading-relaxed hero-animate hero-animate-delay-2">
                The city is building. The energy is unmistakable. This is the
                moment you either join or watch from the sidelines.
              </p>
              <div className="mt-10 flex flex-wrap gap-3 hero-animate hero-animate-delay-3">
                <span className="badge-premium text-accent">builders</span>
                <span className="badge-premium text-text-primary">researchers</span>
                <span className="badge-premium text-text-primary">operators</span>
              </div>
            </div>

            <div className="hero-animate hero-animate-delay-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 md:p-5 backdrop-blur-md shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {people.slice(0, 4).map((person) => (
                    <div key={person.name} className="group relative overflow-hidden rounded-[1.4rem] bg-surface aspect-[0.9] border border-white/[0.06]">
                      <img
                        src={person.img}
                        alt={person.name}
                        className="w-full h-full object-cover grayscale-[0.2] opacity-80 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/15 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="font-sans text-sm font-semibold text-text-primary">
                          {person.name}
                        </p>
                        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-text-tertiary mt-1">
                          {person.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[1.25rem] border border-white/[0.06] bg-bg/70 px-4 py-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-text-secondary">The city rewards people who show up.</p>
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">live signal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 scroll-indicator hero-animate hero-animate-delay-3">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-text-tertiary to-transparent" />
        </div>
      </section>

      <section className="px-6">
        <div className="divider-line max-w-6xl mx-auto" />
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 py-12 md:py-16 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={stat.label} className="stat-premium reveal" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="font-mono text-3xl md:text-4xl font-bold text-accent">
                {stat.value}
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-text-tertiary mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div className="divider-line max-w-6xl mx-auto" />
      </section>

      <section className="py-28 md:py-36 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-14 lg:gap-20 items-start">
          <div className="reveal">
            <div className="w-10 h-px bg-accent mb-8" />
            <blockquote className="font-serif text-[clamp(2.2rem,4.8vw,4.8rem)] italic leading-[1.12] text-text-primary">
              "Go to the thing. Reply YES. Leave the house. Cross the river."
            </blockquote>
          </div>
          <div className="space-y-5">
            <div className="panel-premium reveal">
              <p className="text-text-secondary text-base leading-8">
                Say yes to the weird invite. Build the thing nobody asked for.
                Ship it before it’s ready.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="panel-premium reveal">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-3">
                  proximity
                </p>
                <p className="text-text-secondary leading-7">
                  London doesn’t wait for permission. The best things here start
                  as accidental meetings, companies, and movements.
                </p>
              </div>
              <div className="panel-premium reveal">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-3">
                  serendipity
                </p>
                <p className="text-text-secondary leading-7">
                  From Shoreditch warehouses to King’s Cross coffees, the city
                  compounds energy through density and follow-through.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 md:py-36 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 reveal">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.4em] text-text-tertiary">
                The builders
              </p>
              <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.04em] mt-4 text-text-primary">
                People shaping the city
              </h2>
            </div>
            <p className="max-w-md text-text-secondary leading-7">
              Founders, operators, researchers, and cultural connectors who make
              London feel magnetic.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {people.map((person, i) => (
              <div
                key={person.name}
                className={`group relative reveal ${i % 2 !== 0 ? 'md:translate-y-8' : ''}`}
              >
                <div className="relative overflow-hidden aspect-[3/4] rounded-[1.6rem] bg-surface border border-white/[0.06] premium-card">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/95 via-bg/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <p className="font-sans text-sm md:text-base font-semibold text-text-primary">
                      {person.name}
                    </p>
                    <p className="font-serif text-sm italic text-accent/85 mt-1">
                      "{person.descriptor}"
                    </p>
                    <p className="text-xs text-text-tertiary mt-2">
                      {person.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-36 px-6 text-center">
        <div className="reveal max-w-4xl mx-auto panel-premium panel-premium-strong">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-text-tertiary">
            Join the movement
          </p>
          <h2 className="font-display text-[clamp(2.6rem,6vw,5.8rem)] leading-[0.94] tracking-[-0.05em] text-text-primary mt-5">
            Find your <span className="text-gradient-premium">people</span>
          </h2>
          <p className="text-text-secondary mt-6 text-base max-w-md mx-auto leading-7">
            Get the signal, not the noise.
          </p>

          {submitted ? (
            <div className="mt-12 inline-flex items-center gap-3 bg-accent-subtle border border-accent/20 rounded-full px-8 py-4">
              <span className="font-serif italic text-accent">
                You're in. Welcome to the movement.
              </span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubmitted(true);
              }}
              className="mt-12 flex items-center justify-center"
            >
              <div className="cta-pill flex flex-col sm:flex-row items-stretch sm:items-center border border-white/10 rounded-[1.4rem] bg-surface/90 p-2.5 w-full max-w-xl hover:border-white/15 gap-2 sm:gap-0">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 px-5 py-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-accent text-bg font-semibold text-sm px-6 py-3.5 rounded-[1rem] hover:brightness-110 transition-all tracking-wide uppercase whitespace-nowrap cursor-pointer"
                >
                  I'm in
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-serif italic text-text-tertiary text-sm">
            Londonmaxxing
          </p>
          <p className="text-text-tertiary text-xs">
            The city rewards people who show up.
          </p>
        </div>
      </footer>
    </div>
  );
}
