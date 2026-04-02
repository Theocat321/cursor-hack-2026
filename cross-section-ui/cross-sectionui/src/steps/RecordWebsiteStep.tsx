import type { WebsiteRecording } from '../types';
import WebsiteRecordingDisplay from '../components/WebsiteRecordingDisplay';

interface RecordWebsiteStepProps {
  websites: WebsiteRecording[];
}

export default function RecordWebsiteStep({ websites }: RecordWebsiteStepProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-1">Record Website</h3>
      <p className="text-[11px] text-muted mb-3">
        {websites.length === 1
          ? 'Capturing the current website for brain activity analysis.'
          : 'Capturing both variants for comparison.'}
      </p>
      <div className={`grid ${websites.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'} gap-3`}>
        {websites.map((w) => (
          <WebsiteRecordingDisplay key={w.id} label={w.label} variant={w.variant} />
        ))}
      </div>
    </div>
  );
}
