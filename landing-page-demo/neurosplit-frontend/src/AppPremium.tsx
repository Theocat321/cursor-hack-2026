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

      {/* ── Hero ──────────────────────────────── */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-6">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 800px 600px at 70% 70%, rgba(212,168,83,0.04), transparent)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.4em] uppercase text-text-tertiary hero-animate">
            London, 2026
          </p>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-normal leading-[1.05] tracking-tight mt-6 hero-animate hero-animate-delay-1">
            Something is happening
            <br />
            <span className="text-accent">in London</span> right now.
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-lg mx-auto mt-8 leading-relaxed hero-animate hero-animate-delay-2">
            The city is building. The energy is unmistakable. This is the moment
            you either join or watch from the sidelines.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 scroll-indicator hero-animate hero-animate-delay-3">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-text-tertiary to-transparent" />
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────── */}
      <section className="px-6">
        <div className="divider-line max-w-6xl mx-auto" />
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 py-12 md:py-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center reveal">
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

      {/* ── Manifesto ────────────────────────── */}
      <section className="py-32 md:py-40 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="lg:w-3/5 reveal">
            <div className="w-8 h-px bg-accent mb-8" />
            <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl italic leading-[1.3] text-text-primary">
              "Go to the thing. Reply YES. Leave the house. Cross the river. Say
              yes to the weird invite. Build the thing nobody asked for. Ship it
              before it's ready."
            </blockquote>
          </div>
          <div className="lg:w-2/5 flex flex-col justify-end gap-6">
            <p className="text-text-secondary text-base leading-relaxed reveal">
              London doesn't wait for permission. The best things here started as
              accidents — accidental meetings, accidental companies, accidental
              movements. The city rewards people who show up.
            </p>
            <p className="text-text-secondary text-base leading-relaxed reveal">
              From Shoreditch warehouses to King's Cross co-working spaces, from
              late-night hackathons to Sunday morning coffees that turn into
              companies — the pattern is the same. Proximity plus energy plus
              serendipity. That's the London formula.
            </p>
          </div>
        </div>
      </section>

      {/* ── People Grid ──────────────────────── */}
      <section className="py-32 md:py-40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-text-tertiary">
              The builders
            </p>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 text-text-primary">
              People shaping the city
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {people.map((person, i) => (
              <div
                key={person.name}
                className={`group relative reveal ${i % 2 !== 0 ? 'md:translate-y-8' : ''}`}
              >
                <div className="relative overflow-hidden aspect-[3/4] rounded-lg bg-surface">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <p className="font-sans text-sm md:text-base font-semibold text-text-primary">
                      {person.name}
                    </p>
                    <p className="font-serif text-sm italic text-accent/80 mt-1">
                      "{person.descriptor}"
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {person.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="py-32 md:py-40 px-6 text-center">
        <div className="reveal">
          <h2 className="font-serif text-4xl md:text-6xl text-text-primary">
            Join the
            <br />
            <span className="italic text-accent">movement</span>
          </h2>
          <p className="text-text-secondary mt-6 text-base max-w-md mx-auto">
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
              <div className="cta-pill flex items-center border border-white/10 rounded-full bg-surface p-1.5 w-full max-w-md hover:border-white/15">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 px-5 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-accent text-bg font-semibold text-sm px-6 py-3 rounded-full hover:brightness-110 transition-all tracking-wide uppercase whitespace-nowrap cursor-pointer"
                >
                  I'm in
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────── */}
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
