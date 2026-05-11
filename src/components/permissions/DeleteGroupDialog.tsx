interface DeleteGroupDialogProps {
  open: boolean;
  groupName: string;
  affectedUserCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteGroupDialog({
  open,
  groupName,
  affectedUserCount,
  onConfirm,
  onCancel,
}: DeleteGroupDialogProps) {
  if (!open) return null;

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
      aria-labelledby="delete-group-title"
    >
      <div className="bg-background rounded-lg shadow-xl p-6 w-full max-w-[460px] animate-in slide-in-from-bottom-2 duration-200">
        <h2 id="delete-group-title" className="m-0 mb-3 text-lg font-semibold text-foreground">
          Delete <span className="font-semibold text-foreground">{groupName}</span>
        </h2>
        <p className="m-0 mb-6 text-sm text-muted-foreground leading-normal">
          {affectedUserCount > 0
            ? `${affectedUserCount} user(s) currently assigned to this group will have their assignment changed to Custom with their current permissions preserved.`
            : 'No users are currently assigned to this group.'}
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 border border-border rounded-md bg-transparent text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 border-none rounded-md bg-destructive text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 hover:bg-danger-hover focus-visible:outline-2 focus-visible:outline-destructive focus-visible:outline-offset-2 active:bg-danger-hover"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
