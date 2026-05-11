import { useEffect, useCallback } from 'react';
import { X } from '@phosphor-icons/react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean; variant?: 'solid' | 'destructive' };
  secondaryAction?: { label: string; onClick: () => void };
  tertiaryAction?: { label: string; onClick: () => void };
  maxWidth?: string;
}

export function Modal({
  title,
  onClose,
  children,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  maxWidth = '560px',
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-[1000] animate-in fade-in duration-150"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="w-full bg-background rounded-lg shadow-lg flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-2 duration-200"
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border rounded-t-lg shrink-0">
          <h3 id="modal-title" className="text-xl font-semibold text-foreground m-0 leading-tight">
            {title}
          </h3>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center w-6 h-6 p-0 border-none bg-transparent",
              "text-muted-foreground cursor-pointer rounded-sm transition-colors duration-150",
              "hover:text-foreground hover:bg-secondary",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            )}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>

        {/* Footer */}
        {(primaryAction || secondaryAction || tertiaryAction) && (
          <div className="flex items-center justify-end gap-4 p-6 border-t border-border rounded-b-lg shrink-0">
            {tertiaryAction && (
              <Button variant="ghost" size="regular" onClick={tertiaryAction.onClick} className="mr-auto">
                {tertiaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="ghost" size="regular" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button variant={primaryAction.variant ?? 'solid'} size="regular" onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
