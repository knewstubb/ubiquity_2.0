import { useState } from 'react';
import { X, Trash, Image, FileText } from '@phosphor-icons/react';
import type { Asset } from '../../models/asset';

interface AssetDetailPanelProps {
  asset: Asset | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  scopeLabel: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function DetailPreview({ asset }: { asset: Asset }) {
  switch (asset.type) {
    case 'image':
      return (
        <div className="h-[200px] flex items-center justify-center bg-background border-b border-border text-tertiary-foreground">
          <Image size={72} weight="thin" />
        </div>
      );
    case 'colour':
      return (
        <div className="h-[200px] flex items-center justify-center bg-background border-b border-border">
          <div
            className="w-full h-full"
            style={{ backgroundColor: asset.colourValue ?? '#cccccc' }}
          />
        </div>
      );
    case 'font':
      return (
        <div className="h-[200px] flex items-center justify-center bg-background border-b border-border">
          <span className="text-[64px] font-semibold text-foreground tracking-tight">Aa</span>
        </div>
      );
    case 'footer':
      return (
        <div className="h-[200px] flex items-center justify-center bg-background border-b border-border text-tertiary-foreground">
          <FileText size={72} weight="thin" />
        </div>
      );
  }
}

export function AssetDetailPanel({ asset, onClose, onDelete, scopeLabel }: AssetDetailPanelProps) {
  const [confirming, setConfirming] = useState(false);

  if (!asset) return null;

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleDelete() {
    onDelete(asset!.id);
    setConfirming(false);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/30 animate-[fadeIn_200ms_ease]"
        onClick={handleBackdropClick}
      />
      <aside
        className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[90vw] z-[91] bg-background border-l border-border shadow-[-4px_0_12px_rgba(0,0,0,0.08)] flex flex-col animate-[slideIn_200ms_ease] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Asset details"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="m-0 text-lg font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{asset.name}</h2>
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 border-none rounded-md bg-transparent text-muted-foreground cursor-pointer transition-colors duration-150 shrink-0 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </div>

        <DetailPreview asset={asset} />

        <div className="px-5 py-5 flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-tertiary-foreground">Type</span>
              <span className="text-sm font-medium text-foreground capitalize">{asset.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-tertiary-foreground">Scope</span>
              <span className="text-sm font-medium text-foreground capitalize">{scopeLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-tertiary-foreground">Created</span>
              <span className="text-sm font-medium text-foreground capitalize">{formatDate(asset.createdAt)}</span>
            </div>
            {asset.type === 'colour' && asset.colourValue && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-tertiary-foreground">Colour</span>
                <span className="text-sm font-medium text-foreground capitalize">{asset.colourValue}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border mt-auto">
          {!confirming ? (
            <button
              type="button"
              className="w-full py-2 px-4 border border-destructive rounded-md bg-transparent text-sm font-medium text-destructive cursor-pointer transition-colors duration-150 flex items-center justify-center gap-2 hover:bg-destructive hover:text-text-inverse focus-visible:outline-2 focus-visible:outline-destructive focus-visible:outline-offset-2"
              onClick={() => setConfirming(true)}
            >
              <Trash size={16} />
              Delete Asset
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground text-center">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 py-2 px-4 border-none rounded-md bg-transparent text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 px-4 border-none rounded-md bg-destructive text-sm font-medium text-text-inverse cursor-pointer transition-colors duration-150 hover:bg-danger-hover"
                  onClick={handleDelete}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
