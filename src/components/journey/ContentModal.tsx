import { useCallback } from 'react';
import { X, FloppyDisk, Envelope, ListBullets, ChartBar } from '@phosphor-icons/react';

export interface ContentModalProps {
  contentType: 'email' | 'form' | 'survey';
  nodeLabel: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

const CONTENT_META: Record<
  ContentModalProps['contentType'],
  { title: string; icon: React.ComponentType<{ size?: number; weight?: string }> }
> = {
  email: { title: 'Email Builder', icon: Envelope },
  form: { title: 'Form Builder', icon: ListBullets },
  survey: { title: 'Survey Builder', icon: ChartBar },
};

export function ContentModal({ contentType, nodeLabel, onClose, onSave }: ContentModalProps) {
  const meta = CONTENT_META[contentType];
  const Icon = meta.icon;

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleSave = useCallback(() => {
    // Placeholder — in the full product this would return real content
    onSave(`[${contentType} content for "${nodeLabel}"]`);
  }, [contentType, nodeLabel, onSave]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-modal-title"
    >
      <div className="w-[60vw] max-w-[1080px] h-[80vh] bg-background rounded-lg shadow-xl flex flex-col animate-in slide-in-from-bottom-3 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
          <span id="content-modal-title" className="flex-1 text-lg font-semibold text-foreground">
            {meta.title}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium text-primary bg-primary/10 capitalize">
            {nodeLabel}
          </span>
          <button
            className="flex items-center justify-center w-8 h-8 border-none rounded-sm bg-transparent text-tertiary-foreground cursor-pointer transition-colors duration-150 hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            onClick={onClose}
            aria-label="Close content editor"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Body — placeholder builder UI */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="text-center max-w-[420px]">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/[0.08] text-primary">
              <Icon size={32} weight="duotone" />
            </div>
            <p className="m-0 mb-2 text-base font-semibold text-foreground">{meta.title} placeholder</p>
            <p className="m-0 text-sm text-tertiary-foreground leading-normal">
              {contentType.charAt(0).toUpperCase() + contentType.slice(1)} builder placeholder
              — content editing will be available in the full product.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <button
            className="px-4 py-2 border border-border rounded-md bg-transparent text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border-none rounded-md bg-primary text-sm font-semibold text-primary-foreground cursor-pointer transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:bg-accent-foreground"
            onClick={handleSave}
          >
            <FloppyDisk size={16} weight="bold" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
