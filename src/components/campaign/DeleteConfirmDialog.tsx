interface DeleteConfirmDialogProps {
  itemName: string;
  itemType: 'campaign' | 'journey';
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  itemName,
  itemType,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-[420px] animate-in slide-in-from-bottom-2 duration-200">
        <h2 id="delete-confirm-title" className="m-0 mb-3 text-lg font-semibold text-foreground">
          Delete {itemType === 'campaign' ? 'Campaign' : 'Journey'}
        </h2>
        <p className="m-0 mb-6 text-sm text-muted-foreground leading-normal">
          Are you sure you want to delete {itemName}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 border border-border rounded-md bg-transparent text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 border-none rounded-md bg-destructive text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 hover:bg-danger-hover active:bg-danger-hover focus-visible:outline-2 focus-visible:outline-destructive focus-visible:outline-offset-2"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
