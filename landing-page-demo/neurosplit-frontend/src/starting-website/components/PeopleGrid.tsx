import type { VariantTheme } from '../../types';

interface PeopleGridProps {
  theme: VariantTheme['peopleGrid'];
}

const people = [
  'Between things',
  'Building something unnamed',
  'Accidentally excellent at something niche',
  'Left a good job for a weird one',
  'Knows everyone somehow',
  'Quietly reshaping an industry',
];

export default function PeopleGrid({ theme }: PeopleGridProps) {
  return (
    <section className={theme.containerClass}>
      {people.map((descriptor) => (
        <div key={descriptor} className="flex flex-col items-center">
          <div className={theme.avatarClass} />
          <p className={theme.descriptorClass}>"{descriptor}"</p>
        </div>
      ))}
    </section>
  );
}
