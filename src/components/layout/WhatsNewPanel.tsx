import { useState, useCallback } from 'react';
import { useChangelog } from '../../contexts/ChangelogContext';
import { CloseButton } from '../ui/close-button';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function WhatsNewPanel() {
  const { entries } = useChangelog();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        className="bg-none border-none cursor-pointer font-sans text-sm font-medium text-primary px-2.5 py-1.5 rounded whitespace-nowrap hover:bg-accent"
        onClick={open}
      >
        What's New
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9991] bg-black/20" onClick={close} />
          <div
            className="fixed top-0 right-0 bottom-0 w-[420px] max-w-full z-[9992] bg-background border-l border-border shadow-[-4px_0_20px_rgba(0,0,0,0.08)] flex flex-col animate-[slideInPanel_0.2s_ease-out]"
            role="dialog"
            aria-label="What's New"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-sans text-lg font-semibold text-foreground m-0">What's New</h2>
              <CloseButton
                size="lg"
                onClick={close}
                aria-label="Close panel"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {entries.length === 0 ? (
                <p className="text-center text-tertiary-foreground font-sans text-sm py-8">No changelog entries yet.</p>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className="p-4 bg-secondary border border-border rounded">
                    <h3 className="font-sans text-[15px] font-semibold text-foreground m-0 mb-1">{entry.title}</h3>
                    <div className="font-sans text-xs text-tertiary-foreground mb-2">{formatDate(entry.createdAt)}</div>
                    {entry.description && (
                      <p className="font-sans text-sm leading-5 text-muted-foreground m-0 mb-2.5 whitespace-pre-wrap">{entry.description}</p>
                    )}
                    {entry.affectedRoutes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.affectedRoutes.map((route) => (
                          <span key={route} className="inline-block px-2 py-0.5 bg-background-sunken rounded-[10px] font-sans text-[11px] text-muted-foreground">
                            {route}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
