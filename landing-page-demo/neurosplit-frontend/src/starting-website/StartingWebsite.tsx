import { useSearchParams } from 'react-router-dom';
import { variants } from './variants.config';
import type { VariantId } from '../types';
import Hero from './components/Hero';
import PulseStrip from './components/PulseStrip';
import Manifesto from './components/Manifesto';
import PeopleGrid from './components/PeopleGrid';
import CTA from './components/CTA';

export default function StartingWebsite() {
  const [searchParams] = useSearchParams();
  const variant = (searchParams.get('variant') || 'a') as VariantId;
  const theme = variants[variant] ?? variants.a;

  return (
    <div className="min-h-screen">
      <Hero theme={theme.hero} variant={variant} />
      <PulseStrip theme={theme.pulseStrip} variant={variant} />
      <Manifesto theme={theme.manifesto} variant={variant} />
      <PeopleGrid theme={theme.peopleGrid} />
      <CTA theme={theme.cta} variant={variant} />
    </div>
  );
}
