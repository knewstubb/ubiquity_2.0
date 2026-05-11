import { X } from '@phosphor-icons/react';
import { useChangelog } from '../../contexts/ChangelogContext';

export function ChangelogBanner() {
  const { showBanner, unseenEntries, dismissBanner } = useChangelog();

  if (!showBanner) return null;

  return (
    <div
      className="flex items-center gap-3 px-5 py-2.5 bg-warning-subtle border-b border-warning-border text-sm text-warning-foreground animate-[slideDown_0.2s_ease-out]"
      role="status"
      aria-label="New updates available"
    >
      <span className="font-semibold whitespace-nowrap">What's New:</span>
      <div className="flex-1 flex flex-wrap gap-1.5 items-center">
        {unseenEntries.map((entry) => (
          <span
            key={entry.id}
            className="inline-block px-2 py-0.5 bg-[rgba(245,158,11,0.15)] rounded-[10px] text-xs font-medium text-warning-foreground"
          >
            {entry.title}
          </span>
        ))}
      </div>
      <button
        type="button"
        className="bg-none border-none cursor-pointer text-warning-foreground p-1 flex items-center justify-center rounded shrink-0 hover:bg-[rgba(245,158,11,0.15)]"
        onClick={dismissBanner}
        aria-label="Dismiss changelog banner"
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}
