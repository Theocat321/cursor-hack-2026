import type { VariantTheme } from '../../types';

interface ManifestoProps {
  theme: VariantTheme['manifesto'];
  variant: 'a' | 'b';
}

export default function Manifesto({ theme, variant }: ManifestoProps) {
  return (
    <section className={theme.containerClass}>
      {variant === 'a' ? (
        <div className="border-l-2 border-electric-blue/40 pl-6">
          <p className={theme.textClass}>
            Go to the thing. Reply YES. Leave the house. Cross the river. Say
            yes to the weird invite. Build the thing nobody asked for. Ship it
            before it's ready.
          </p>
          <p className={theme.textClass}>
            London doesn't wait for permission. The best things here started as
            accidents — accidental meetings, accidental companies, accidental
            movements. The city rewards people who show up.
          </p>
        </div>
      ) : (
        <>
          <p className={theme.textClass}>
            Go to the thing. Reply YES. Leave the house. Cross the river. Say
            yes to the weird invite. Build the thing nobody asked for. Ship it
            before it's ready.
          </p>
          <p className={theme.textClass}>
            London doesn't wait for permission. The best things here started as
            accidents — accidental meetings, accidental companies, accidental
            movements. The city rewards people who show up.
          </p>
          <div className="w-16 h-px bg-golden-gold/40 mx-auto mt-4" />
        </>
      )}
    </section>
  );
}
