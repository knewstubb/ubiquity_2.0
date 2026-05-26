import { SectionDivider } from '@/components/composed/section-divider';
import { useControlValues } from '@/lib/useControlValues';

export default function SectionDividerDemo({ controls }: { controls?: Record<string, unknown> }) {
  const values = useControlValues(controls);
  const variant = (values['variant'] as 'line' | 'heading') ?? 'line';
  const sections = (values['sections'] as number) ?? 2;
  const label1 = (values['label1'] as string) ?? 'Connection Settings';
  const label2 = (values['label2'] as string) ?? 'Authentication';
  const label3 = (values['label3'] as string) ?? 'Notifications';

  const labels = [label1, label2, label3];

  return (
    <div className="flex flex-col gap-6 p-8 max-w-md w-full">
      {/* First section (fields above first divider) */}
      <div className="space-y-3">
        <div className="h-8 rounded bg-muted" />
        <div className="h-8 rounded bg-muted" />
      </div>

      {Array.from({ length: sections }, (_, i) => (
        <div key={i} className="contents">
          <SectionDivider label={labels[i] ?? `Section ${i + 1}`} variant={variant} />
          <div className="space-y-3">
            <div className="h-8 rounded bg-muted" />
            <div className="h-8 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
