interface VariantPreviewProps {
  variantId: 'a' | 'b';
  label: string;
  subtitle: string;
}

export default function VariantPreview({
  variantId,
  label,
  subtitle,
}: VariantPreviewProps) {
  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-dash-border flex items-center justify-between">
        <div>
          <h3 className="text-dash-text font-sans font-semibold text-sm">
            {label}
          </h3>
          <p className="text-dash-muted text-xs mt-0.5">{subtitle}</p>
        </div>
        <a
          href={`/website?variant=${variantId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-dash-accent hover:text-dash-accent/80 transition-colors"
        >
          Open ↗
        </a>
      </div>
      <div className="aspect-[16/10] relative">
        <iframe
          src={`/website?variant=${variantId}`}
          title={`Variant ${variantId.toUpperCase()} preview`}
          className="w-full h-full border-0 pointer-events-none"
          style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
        />
      </div>
    </div>
  );
}
