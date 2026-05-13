import { HelpPopover } from '@/components/composed/help-popover';
import { useControlValues } from '@/lib/useControlValues';

export default function HelpPopoverDemo({ controls }: { controls?: Record<string, unknown> }) {
  const values = useControlValues(controls);
  const title = (values['title'] as string) ?? 'How does this work?';
  const body = (values['body'] as string) ?? 'This is a help popover that provides contextual information to the user. Click the ? button to toggle it.';

  return (
    <div className="flex items-center gap-2 p-8">
      <span className="text-sm font-semibold text-foreground">Field Label</span>
      <HelpPopover title={title} body={body} />
    </div>
  );
}
